import { useCallback, useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { revalidateContent } from "@/app/admin/actions";
import { isSlugTaken, persistPost, type SaveIntent, type StoredInfo } from "../posts-client";
import type { DraftPost } from "../types";
import type { BlogPost } from "@/types/blog";

const MAX_SPOTLIGHT = 3;

const SUCCESS_MESSAGE: Record<SaveIntent, string> = {
    draft: "Draft saved",
    publish: "Published. The article is live.",
    update: "Article updated",
    unpublish: "Moved back to drafts",
};

interface Options {
    posts: BlogPost[];
    fetchPosts: () => Promise<void>;
    removePost: (id: string) => void;
}

interface PersistOptions {
    /** Autosave: no toasts and no validation errors, just skip when the post isn't savable yet. */
    silent?: boolean;
}

/** Firestore writes for the studio, each followed by a public-cache refresh when readers can see the change. */
export function useStudioActions({ posts, fetchPosts, removePost }: Options) {
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const inFlight = useRef(false);

    // Expire the cached public pages so the edit is visible immediately
    const refreshPublicSite = useCallback(async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (token) await revalidateContent(token, "posts");
        } catch (err) {
            console.error("Revalidation failed:", err);
            addToast("Saved, but the public site may take a while to update", "error");
        }
    }, [addToast]);

    /** Saves the post. Returns the stored post, or null when nothing was written. */
    const persist = useCallback(
        async (
            post: DraftPost,
            intent: SaveIntent,
            stored: StoredInfo,
            { silent = false }: PersistOptions = {}
        ): Promise<DraftPost | null> => {
            if (inFlight.current) return null;

            const fail = (message: string) => {
                if (!silent) addToast(message, "error");
                return null;
            };

            const slug = (post.slug ?? "").trim();
            if (!post.title?.trim() || !slug) return fail("Add a title before saving");
            if ((intent === "publish" || intent === "update") && !post.content?.trim()) {
                return fail("Write something before publishing");
            }

            if (post.featured) {
                if (!post.coverImage?.trim()) {
                    return fail("A cover image is mandatory for Spotlight articles. Please upload or link a cover image.");
                }
                const otherFeatured = posts.filter((p) => p.featured && p.id !== post.id).length;
                if (otherFeatured >= MAX_SPOTLIGHT) {
                    return fail("A maximum of 3 articles can be marked as Spotlight. Please unfeature an existing Spotlight article first.");
                }
            }

            inFlight.current = true;
            if (!silent) setSaving(true);
            try {
                if (slug !== stored.slug && (await isSlugTaken(slug, post.id))) {
                    return fail("That URL is already used by another article");
                }

                const saved = await persistPost(post, intent, stored);

                const becameVisible = intent === "publish" || intent === "unpublish" || saved.published === true;
                if (becameVisible) await refreshPublicSite();
                await fetchPosts();
                if (!silent) addToast(SUCCESS_MESSAGE[intent], "success");
                return saved;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Save error:", msg);
                return fail("Failed to save article: " + msg);
            } finally {
                inFlight.current = false;
                if (!silent) setSaving(false);
            }
        },
        [addToast, fetchPosts, posts, refreshPublicSite]
    );

    const deletePost = useCallback(
        async (id: string) => {
            if (!confirm("Are you sure you want to delete this article?")) return false;

            try {
                await deleteDoc(doc(db, "blog", id));
                removePost(id);
                await refreshPublicSite();
                addToast("Article deleted successfully", "success");
                return true;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Delete error:", msg);
                addToast("Failed to delete article: " + msg, "error");
                return false;
            }
        },
        [addToast, refreshPublicSite, removePost]
    );

    return { saving, persist, deletePost, refreshPublicSite };
}
