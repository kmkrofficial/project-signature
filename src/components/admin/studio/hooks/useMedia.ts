import { useCallback, useEffect, useState } from "react";
import { deleteObject, getDownloadURL, listAll, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/lib/upload-image";
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

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** The media library in Firebase Storage: listing, bulk uploading, deleting and copying markdown snippets. */
export function useMedia(active: boolean) {
    const { addToast } = useToast();
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAll(ref(storage, "media"));
            const listed = await Promise.all(
                res.items.map(async (itemRef) => ({
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    url: await getDownloadURL(itemRef),
                }))
            );
            setImages(listed);
        } catch (err: unknown) {
            console.warn("Storage list notice:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (active) fetchImages();
    }, [active, fetchImages]);

    /** Compresses and uploads any number of images, a few at a time. Non-images are skipped. */
    const uploadFiles = useCallback(
        async (files: File[]) => {
            const images = files.filter((file) => file.type.startsWith("image/"));
            const skipped = files.length - images.length;
            if (skipped > 0) {
                addToast(`${skipped} file${skipped === 1 ? " was" : "s were"} skipped because ${skipped === 1 ? "it isn't an image" : "they aren't images"}`, "info");
            }

            const batch = images.slice(0, MAX_FILES_PER_BATCH);
            if (images.length > batch.length) {
                addToast(`Only the first ${MAX_FILES_PER_BATCH} images were uploaded. Add the rest in another batch.`, "info");
            }
            if (batch.length === 0) return;

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

            let cursor = 0;
            let succeeded = 0;
            let failed = 0;

            const worker = async () => {
                while (cursor < batch.length) {
                    const index = cursor++;
                    const { id } = items[index];
                    patch(id, { status: "uploading" });
                    try {
                        const uploaded = await uploadImage(batch[index], (fraction) => patch(id, { progress: fraction }));
                        setImages((prev) => [{ ...uploaded, fresh: true }, ...prev]);
                        patch(id, { status: "done", progress: 1 });
                        succeeded++;
                    } catch (err: unknown) {
                        console.error("Upload error:", messageOf(err));
                        patch(id, { status: "error", error: messageOf(err) });
                        failed++;
                    }
                }
            };

            await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT, batch.length) }, worker));

            if (succeeded > 0) {
                addToast(`${succeeded} image${succeeded === 1 ? "" : "s"} uploaded`, "success");
            }
            if (failed > 0) {
                addToast(`${failed} image${failed === 1 ? "" : "s"} failed to upload`, "error");
            }

            const batchIds = new Set(items.map((item) => item.id));
            setTimeout(() => {
                setUploads((prev) => prev.filter((item) => !(batchIds.has(item.id) && item.status === "done")));
            }, DONE_LINGER_MS);
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
            navigator.clipboard.writeText(`![${name.replace(/\.[^/.]+$/, "")}](${url})`);
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
