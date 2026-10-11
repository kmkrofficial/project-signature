import { useCallback, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { revalidateContent, revokePostPreviewLinks } from "@/app/admin/actions";
import {
    deletePostForever,
    isSlugTaken,
    persistPost,
    restorePost,
    trashPost,
    unfeaturePost,
    type SaveIntent,
    type StoredInfo,
} from "../posts-client";
import type { DraftPost } from "../types";
import type { BlogPost } from "@/types/blog";

const SUCCESS_MESSAGE: Record<SaveIntent, string> = {
    draft: "Draft saved",
    publish: "Published. The article is live.",
    update: "Article updated",
    unpublish: "Moved back to drafts",
};

interface Options {
    posts: BlogPost[];
    fetchPosts: (silent?: boolean) => Promise<void>;
    /** Resolves when the row's collapse animation has finished. */
    removePost: (id: string) => Promise<void>;
}

interface PersistOptions {
    /** Autosave: no toasts, no validation errors and no history entry; it just skips when the post isn't savable yet. */
    silent?: boolean;
    /** Id to give a post that is being saved for the first time (its images are already in a folder of that name). */
    newId?: string;
}

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Firestore writes for the studio, each followed by a public-cache refresh when readers can see the change. */
export function useStudioActions({ posts, fetchPosts, removePost }: Options) {
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);
    const inFlight = useRef(false);

    // Expire the cached public pages so the edit is visible immediately
    const refreshPublicSite = useCallback(
        async (scope: "posts" | "config" = "posts") => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (token) await revalidateContent(token, scope);
            } catch (err) {
                console.error("Revalidation failed:", err);
                addToast("Saved, but the public site may take a while to update", "error");
            }
        },
        [addToast]
    );

    /** Saves the post. Returns the stored post, or null when nothing was written. */
    const persist = useCallback(
        async (
            post: DraftPost,
            intent: SaveIntent,
            stored: StoredInfo,
            { silent = false, newId }: PersistOptions = {}
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

            if (post.featured && !post.coverImage?.trim()) {
                return fail("The spotlight needs a cover image. Please upload or link one.");
            }

            inFlight.current = true;
            if (!silent) setSaving(true);
            try {
                if (slug !== stored.slug && (await isSlugTaken(slug, post.id))) {
                    return fail("That URL is already used by another article");
                }

                const saved = await persistPost(post, intent, stored, { revision: !silent, newId });

                // There is one spotlight. A live article that takes it replaces the current one; a draft only
                // does so when it is published, so saving a draft never empties the home page's spotlight.
                if (saved.featured && saved.published === true) {
                    const replaced = posts.filter((p) => p.featured && p.published !== false && p.id !== saved.id);
                    await Promise.all(replaced.map((other) => unfeaturePost(other.id)));
                    if (replaced.length > 0 && !silent) {
                        const names = replaced.map((other) => `\u201c${other.title}\u201d`).join(", ");
                        addToast(`${names} ${replaced.length === 1 ? "is" : "are"} no longer the spotlight`, "info");
                    }
                }

                const becameVisible = intent === "publish" || intent === "unpublish" || saved.published === true;
                if (becameVisible) await refreshPublicSite();
                await fetchPosts();
                if (!silent) addToast(SUCCESS_MESSAGE[intent], "success");
                return saved;
            } catch (err: unknown) {
                console.error("Save error:", messageOf(err));
                return fail("Failed to save article: " + messageOf(err));
            } finally {
                inFlight.current = false;
                if (!silent) setSaving(false);
            }
        },
        [addToast, fetchPosts, posts, refreshPublicSite]
    );

    /** Brings an article back from the trash: as a draft, or live again when `publish` is set. */
    const restore = useCallback(
        async (id: string, publish: boolean) => {
            try {
                await restorePost(id, publish);
                if (publish) await refreshPublicSite();
                await fetchPosts(true);
                addToast(publish ? "Restored and live again" : "Restored as a draft", "success");
            } catch (err: unknown) {
                console.error("Restore error:", messageOf(err));
                addToast("Failed to restore article: " + messageOf(err), "error");
            }
        },
        [addToast, fetchPosts, refreshPublicSite]
    );

    /** Moves an article to the trash. The toast offers Undo, which brings it back exactly as it was. */
    const trash = useCallback(
        async (post: BlogPost) => {
            try {
                await trashPost(post);
                // Let the row finish collapsing before the list is refreshed, or the refresh would be undone
                await removePost(post.id);

                const token = await auth.currentUser?.getIdToken();
                if (token) await revokePostPreviewLinks(token, post.id).catch(() => undefined);
                if (post.published !== false) await refreshPublicSite();
                await fetchPosts(true);

                addToast("Moved to trash", "success", {
                    label: "Undo",
                    onClick: () => void restore(post.id, post.published !== false),
                });
            } catch (err: unknown) {
                console.error("Trash error:", messageOf(err));
                addToast("Failed to delete article: " + messageOf(err), "error");
            }
        },
        [addToast, fetchPosts, refreshPublicSite, removePost, restore]
    );

    const deleteForever = useCallback(
        async (id: string) => {
            try {
                await deletePostForever(id);
                await removePost(id);
                addToast("Article deleted permanently", "success");
            } catch (err: unknown) {
                console.error("Delete error:", messageOf(err));
                addToast("Failed to delete article: " + messageOf(err), "error");
            }
        },
        [addToast, removePost]
    );

    return { saving, persist, trash, restore, deleteForever, refreshPublicSite };
}
