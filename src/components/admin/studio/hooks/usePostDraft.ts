import { useCallback, useEffect, useState } from "react";
import { toPostLinks } from "@/lib/post-links";
import { storedInfoOf, type StoredInfo } from "../posts-client";
import { emptyPost, type DraftPost } from "../types";

const BACKUP_PREFIX = "studio:draft:";
const BACKUP_DELAY_MS = 1000;

type EditableFields = Pick<
    DraftPost,
    "title" | "slug" | "excerpt" | "coverImage" | "content" | "category" | "tags" | "links" | "featured"
>;

/** The fields the writer edits. Visibility changes only through explicit save actions, so it isn't "dirty". */
const editable = (post: DraftPost): EditableFields => ({
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage ?? "",
    content: post.content ?? "",
    category: post.category,
    tags: post.tags ?? [],
    // Compared as saved, so blank rows still being filled in are not "unsaved changes"
    links: toPostLinks(post.links),
    featured: Boolean(post.featured),
});

const snapshot = (post: DraftPost) => JSON.stringify(editable(post));
const backupKey = (id?: string) => BACKUP_PREFIX + (id ?? "new");

// localStorage can be unavailable (private windows, blocked storage); the studio works without it.
function readBackup(id?: string): EditableFields | null {
    try {
        const raw = localStorage.getItem(backupKey(id));
        return raw ? ((JSON.parse(raw) as { fields?: EditableFields }).fields ?? null) : null;
    } catch {
        return null;
    }
}

function writeBackup(id: string | undefined, fields: EditableFields) {
    try {
        localStorage.setItem(backupKey(id), JSON.stringify({ savedAt: Date.now(), fields }));
    } catch {
        // ignore
    }
}

function clearBackup(id?: string) {
    try {
        localStorage.removeItem(backupKey(id));
    } catch {
        // ignore
    }
}

/**
 * The post being edited, with unsaved-change tracking and a local backup so a closed tab, crash
 * or accidental navigation never loses work.
 */
export function usePostDraft() {
    const [post, setPost] = useState<DraftPost>(emptyPost);
    const [baseline, setBaseline] = useState(() => snapshot(emptyPost()));
    const [stored, setStored] = useState<StoredInfo>(() => storedInfoOf(emptyPost()));
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const [restorable, setRestorable] = useState<EditableFields | null>(null);

    const dirty = snapshot(post) !== baseline;

    /** Replaces the editor contents with `next` (a stored post or a blank one). */
    const load = useCallback((next: DraftPost) => {
        setPost(next);
        setBaseline(snapshot(next));
        setStored(storedInfoOf(next));
        setSavedAt(null);

        const backup = readBackup(next.id);
        const differs = backup && snapshot({ ...next, ...backup }) !== snapshot(next);
        setRestorable(differs ? backup : null);
    }, []);

    // Mirror unsaved edits to localStorage shortly after typing stops
    useEffect(() => {
        if (restorable) return; // keep the old backup until the writer decides
        if (!dirty) {
            clearBackup(post.id);
            return;
        }
        const timer = setTimeout(() => writeBackup(post.id, editable(post)), BACKUP_DELAY_MS);
        return () => clearTimeout(timer);
    }, [dirty, post, restorable]);

    // Warn before a reload or tab close would throw edits away
    useEffect(() => {
        if (!dirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    /**
     * Records a successful save. Only server-assigned fields are merged into the editor, so anything typed
     * while the request was in flight is kept (and stays unsaved).
     */
    const markSaved = useCallback((saved: DraftPost, previousId?: string) => {
        setPost((prev) => ({
            ...prev,
            id: saved.id,
            published: saved.published,
            publishedAt: saved.publishedAt,
            previousSlugs: saved.previousSlugs,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            likes: saved.likes,
        }));
        setBaseline(snapshot(saved));
        setStored(storedInfoOf(saved));
        setSavedAt(new Date());
        clearBackup(previousId);
        clearBackup(saved.id);
    }, []);

    const restore = useCallback(() => {
        setPost((prev) => ({ ...prev, ...restorable }));
        setRestorable(null);
    }, [restorable]);

    const dismissRestore = useCallback(() => {
        clearBackup(post.id);
        setRestorable(null);
    }, [post.id]);

    /** Throws away unsaved edits and the local backup. */
    const discard = useCallback(() => {
        clearBackup(post.id);
        setRestorable(null);
        setBaseline(snapshot(post));
    }, [post]);

    return { post, setPost, dirty, stored, savedAt, restorable, load, markSaved, restore, dismissRestore, discard };
}
