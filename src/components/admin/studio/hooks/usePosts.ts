import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { deletePostForever, TRASH_RETENTION_DAYS } from "../posts-client";
import type { BlogPost } from "@/types/blog";

const REMOVE_ANIMATION_MS = 260;
const DAY_SECONDS = 24 * 60 * 60;

/**
 * Loads every post (drafts included) for the studio and tracks rows that are animating out.
 * Trashed posts are returned separately; those past their retention period are removed for good.
 */
export function usePosts() {
    const { addToast } = useToast();
    const [all, setAll] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    /** When the list was last loaded (epoch seconds), so views can show relative times without reading the clock. */
    const [loadedAt, setLoadedAt] = useState(0);
    const [removingIds, setRemovingIds] = useState<string[]>([]);

    /** `silent` refreshes in place without the loading skeleton. */
    const fetchPosts = useCallback(
        async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                const snap = await getDocs(query(collection(db, "blog"), orderBy("createdAt", "desc")));
                const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost);

                // Trash older than the retention period goes for good
                const cutoff = Date.now() / 1000 - TRASH_RETENTION_DAYS * DAY_SECONDS;
                const expired = fetched.filter((p) => p.deletedAt && p.deletedAt.seconds < cutoff);
                expired.forEach((p) => void deletePostForever(p.id).catch(() => undefined));
                const expiredIds = new Set(expired.map((p) => p.id));

                setAll(fetched.filter((p) => !expiredIds.has(p.id)));
                setLoadedAt(Date.now() / 1000);
            } catch (error: unknown) {
                console.error("Firestore query error:", error);
                addToast("Failed to load articles from Firestore", "error");
            } finally {
                setLoading(false);
            }
        },
        [addToast]
    );

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /** Collapses the row, then drops it from the list. Resolves once the animation has finished. */
    const removePost = useCallback(
        (id: string) =>
            new Promise<void>((resolve) => {
                setRemovingIds((prev) => [...prev, id]);
                setTimeout(() => {
                    setAll((prev) => prev.filter((p) => p.id !== id));
                    setRemovingIds((prev) => prev.filter((removing) => removing !== id));
                    resolve();
                }, REMOVE_ANIMATION_MS);
            }),
        []
    );

    const posts = all.filter((p) => !p.deletedAt);
    const trashed = all.filter((p) => p.deletedAt);

    return { posts, trashed, loading, loadedAt, removingIds, fetchPosts, removePost };
}
