import { useCallback, useEffect, useState } from "react";
import { deleteObject, getDownloadURL, listAll, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { LIBRARY_FOLDER, uploadImage } from "@/lib/upload-image";
import { displayName, imageMarkdown } from "../image-markdown";
import type { StoredImage } from "../types";

/** One file in an upload batch, shown as a row with its own progress. */
export interface UploadItem {
    id: string;
    name: string;
    /** 0..1 */
    progress: number;
    status: "queued" | "uploading" | "done" | "error";
    error?: string;
}

/** Files compressed and uploaded at the same time; keeps memory and bandwidth reasonable for big batches. */
const MAX_CONCURRENT = 3;
const MAX_FILES_PER_BATCH = 50;
/** How long finished rows stay visible before they clear themselves (failed ones stay until dismissed). */
const DONE_LINGER_MS = 2500;

/** Uploads made before folders existed. They are treated as part of the library. */
const LEGACY_FOLDER = "media";
const ARTICLES_FOLDER = "articles";

export const LIBRARY_GROUP = "library";

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));
const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** `articles/<id>` -> `<id>`; anything else is the shared library. */
const groupOf = (folder: string) => (folder.startsWith(`${ARTICLES_FOLDER}/`) ? folder.split("/")[1] : LIBRARY_GROUP);

async function listFolder(path: string, group: string): Promise<StoredImage[]> {
    try {
        const { items } = await listAll(ref(storage, path));
        return await Promise.all(
            items.map(async (item) => ({
                name: displayName(item.name),
                fullPath: item.fullPath,
                url: await getDownloadURL(item),
                group,
            }))
        );
    } catch (err) {
        console.warn(`Could not list ${path}:`, err);
        return [];
    }
}

/**
 * The media library in Firebase Storage: listing (grouped by article), bulk uploading, deleting
 * and copying markdown snippets.
 */
export function useMedia(active: boolean) {
    const { addToast } = useToast();
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const articles = await listAll(ref(storage, ARTICLES_FOLDER)).catch(() => null);
            const lists = await Promise.all([
                listFolder(LIBRARY_FOLDER, LIBRARY_GROUP),
                listFolder(LEGACY_FOLDER, LIBRARY_GROUP),
                ...(articles?.prefixes ?? []).map((prefix) => listFolder(prefix.fullPath, prefix.name)),
            ]);
            // Names start with a timestamp, so this is newest first
            setImages(lists.flat().sort((a, b) => baseName(b.fullPath ?? "").localeCompare(baseName(a.fullPath ?? ""))));
        } catch (err: unknown) {
            console.warn("Storage list notice:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (active) fetchImages();
    }, [active, fetchImages]);

    /**
     * Compresses and uploads any number of images, a few at a time, into `folder`.
     * Non-images are skipped. Resolves with the images that were stored.
     */
    const uploadFiles = useCallback(
        async (files: File[], folder: string = LIBRARY_FOLDER): Promise<StoredImage[]> => {
            const candidates = files.filter((file) => file.type.startsWith("image/"));
            const skipped = files.length - candidates.length;
            if (skipped > 0) {
                addToast(
                    `${skipped} file${skipped === 1 ? " was" : "s were"} skipped because ${skipped === 1 ? "it isn't an image" : "they aren't images"}`,
                    "info"
                );
            }

            const batch = candidates.slice(0, MAX_FILES_PER_BATCH);
            if (candidates.length > batch.length) {
                addToast(`Only the first ${MAX_FILES_PER_BATCH} images were uploaded. Add the rest in another batch.`, "info");
            }
            if (batch.length === 0) return [];

            const stamp = Date.now();
            const items: UploadItem[] = batch.map((file, index) => ({
                id: `${stamp}-${index}`,
                name: file.name,
                progress: 0,
                status: "queued",
            }));
            const patch = (id: string, change: Partial<UploadItem>) =>
                setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, ...change } : item)));

            setUploads((prev) => [...prev, ...items]);

            const stored: StoredImage[] = [];
            let cursor = 0;
            let failed = 0;

            const worker = async () => {
                while (cursor < batch.length) {
                    const index = cursor++;
                    const { id } = items[index];
                    patch(id, { status: "uploading" });
                    try {
                        const uploaded = await uploadImage(batch[index], (fraction) => patch(id, { progress: fraction }), folder);
                        const image: StoredImage = {
                            name: displayName(uploaded.fullPath.slice(uploaded.fullPath.lastIndexOf("/") + 1)),
                            fullPath: uploaded.fullPath,
                            url: uploaded.url,
                            size: uploaded.size,
                            group: groupOf(folder),
                            fresh: true,
                        };
                        setImages((prev) => [image, ...prev]);
                        stored.push(image);
                        patch(id, { status: "done", progress: 1 });
                    } catch (err: unknown) {
                        console.error("Upload error:", messageOf(err));
                        patch(id, { status: "error", error: messageOf(err) });
                        failed++;
                    }
                }
            };

            await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT, batch.length) }, worker));

            if (stored.length > 0) {
                addToast(`${stored.length} image${stored.length === 1 ? "" : "s"} uploaded`, "success");
            }
            if (failed > 0) {
                addToast(`${failed} image${failed === 1 ? "" : "s"} failed to upload`, "error");
            }

            const batchIds = new Set(items.map((item) => item.id));
            setTimeout(() => {
                setUploads((prev) => prev.filter((item) => !(batchIds.has(item.id) && item.status === "done")));
            }, DONE_LINGER_MS);

            return stored;
        },
        [addToast]
    );

    /** Clears the finished and failed rows. */
    const dismissUploads = useCallback(
        () => setUploads((prev) => prev.filter((item) => item.status === "queued" || item.status === "uploading")),
        []
    );

    const remove = useCallback(
        async (fullPath: string) => {
            try {
                await deleteObject(ref(storage, fullPath));
                setImages((prev) => prev.filter((image) => image.fullPath !== fullPath));
                addToast("Image deleted", "success");
            } catch (err: unknown) {
                console.error("Delete image error:", messageOf(err));
                addToast("Failed to delete image: " + messageOf(err), "error");
            }
        },
        [addToast]
    );

    const copySnippet = useCallback(
        (url: string, name: string) => {
            navigator.clipboard.writeText(imageMarkdown(name, url));
            setCopiedUrl(url);
            addToast("Markdown image code copied to clipboard!", "success");
            setTimeout(() => setCopiedUrl(null), 2500);
        },
        [addToast]
    );

    const uploading = uploads.some((item) => item.status === "queued" || item.status === "uploading");

    return {
        images,
        loading,
        uploads,
        uploading,
        copiedUrl,
        uploadFiles,
        dismissUploads,
        copySnippet,
        remove,
        refresh: fetchImages,
    };
}
