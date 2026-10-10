import { useCallback, useEffect, useState } from "react";
import { getDownloadURL, listAll, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/lib/upload-image";
import type { StoredImage } from "../types";

/** The media library in Firebase Storage: listing, uploading and copying markdown snippets. */
export function useMedia(active: boolean) {
    const { addToast } = useToast();
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
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

    const upload = useCallback(
        async (file: File) => {
            setUploading(true);
            setProgress(0);
            try {
                const uploaded = await uploadImage(file, setProgress);
                setImages((prev) => [{ ...uploaded, fresh: true }, ...prev]);
                addToast("Media uploaded to Firebase Storage!", "success");
                return uploaded;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Upload error:", msg);
                addToast("Failed to upload image: " + msg, "error");
                return null;
            } finally {
                setUploading(false);
                setProgress(0);
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

    return { images, loading, uploading, progress, copiedUrl, upload, copySnippet, refresh: fetchImages };
}
