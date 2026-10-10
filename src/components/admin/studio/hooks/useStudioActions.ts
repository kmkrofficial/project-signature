import { useCallback, useState } from "react";
import { collection, deleteDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { revalidateContent } from "@/app/admin/actions";
import { estimateReadingTime } from "@/lib/format";
import { CATEGORIES, type DraftPost } from "../types";
import type { BlogPost } from "@/types/blog";

const MAX_SPOTLIGHT = 3;

interface Options {
    posts: BlogPost[];
    fetchPosts: () => Promise<void>;
    removePost: (id: string) => void;
}

/** Firestore writes for the studio, each followed by a public-cache refresh. */
export function useStudioActions({ posts, fetchPosts, removePost }: Options) {
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);

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

    /** Returns true when the post was written. */
    const savePost = useCallback(
        async (post: DraftPost): Promise<boolean> => {
            if (!post.title || !post.slug || !post.content) {
                addToast("Title, slug, and content are required", "error");
                return false;
            }

            if (post.featured) {
                if (!post.coverImage || !post.coverImage.trim()) {
                    addToast("A cover image is mandatory for Spotlight articles. Please upload or link a cover image.", "error");
                    return false;
                }

                const otherFeatured = posts.filter((p) => p.featured && p.id !== post.id).length;
                if (otherFeatured >= MAX_SPOTLIGHT) {
                    addToast("A maximum of 3 articles can be marked as Spotlight. Please unfeature an existing Spotlight article first.", "error");
                    return false;
                }
            }

            setSaving(true);
            const payload = {
                title: post.title.trim(),
                slug: post.slug.trim(),
                excerpt: post.excerpt || "",
                coverImage: post.coverImage || "",
                content: post.content,
                category: post.category || CATEGORIES[0],
                tags: post.tags || [],
                published: post.published !== false,
                featured: Boolean(post.featured),
                readingTime: estimateReadingTime(post.content),
                updatedAt: Timestamp.now(),
            };

            try {
                if (post.id) {
                    await setDoc(doc(db, "blog", post.id), payload, { merge: true });
                    addToast("Article updated successfully!", "success");
                } else {
                    const newDocRef = doc(collection(db, "blog"));
                    await setDoc(newDocRef, {
                        ...payload,
                        id: newDocRef.id,
                        likes: 0,
                        createdAt: Timestamp.now(),
                    });
                    addToast("New article published successfully!", "success");
                }

                await refreshPublicSite();
                await fetchPosts();
                return true;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Save error:", msg);
                addToast("Failed to save article: " + msg, "error");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [addToast, fetchPosts, posts, refreshPublicSite]
    );

    const deletePost = useCallback(
        async (id: string) => {
            if (!confirm("Are you sure you want to delete this article?")) return;

            try {
                await deleteDoc(doc(db, "blog", id));
                removePost(id);
                await refreshPublicSite();
                addToast("Article deleted successfully", "success");
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error("Delete error:", msg);
                addToast("Failed to delete article: " + msg, "error");
            }
        },
        [addToast, refreshPublicSite, removePost]
    );

    return { saving, savePost, deletePost, refreshPublicSite };
}
