import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import type { BlogPost } from "@/types/blog";

const REMOVE_ANIMATION_MS = 260;

/** Loads every post (drafts included) for the studio and tracks rows that are animating out. */
export function usePosts() {
    const { addToast } = useToast();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<string[]>([]);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, "blog"), orderBy("createdAt", "desc")));
            setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost));
        } catch (error: unknown) {
            console.error("Firestore query error:", error);
            addToast("Failed to load articles from Firestore", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    /** Collapses the row, then drops it from the list. */
    const removePost = useCallback((id: string) => {
        setRemovingIds((prev) => [...prev, id]);
        setTimeout(() => {
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setRemovingIds((prev) => prev.filter((removing) => removing !== id));
        }, REMOVE_ANIMATION_MS);
    }, []);

    return { posts, loading, removingIds, fetchPosts, removePost };
}
