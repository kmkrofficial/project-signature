import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { estimateReadingTime } from "@/lib/format";
import { CATEGORIES, type DraftPost } from "./types";
import type { BlogPost } from "@/types/blog";

/**
 * What a save does to the post's visibility:
 * - draft: keep (or create) it as an unpublished draft
 * - publish: make it live; the first time this also sets its public date
 * - update: save changes to a post that is already live
 * - unpublish: take it offline, keeping its public date
 */
export type SaveIntent = "draft" | "publish" | "update" | "unpublish";

/** What the stored document looked like when it was loaded or last saved. */
export interface StoredInfo {
    slug: string;
    /** Has been live at some point, so its URL may already be linked to. */
    wasPublic: boolean;
}

export const storedInfoOf = (post: DraftPost): StoredInfo => ({
    slug: post.slug ?? "",
    wasPublic: post.published === true || Boolean(post.publishedAt),
});

/** True if another article already uses `slug`, either as its current slug or as a former one. */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const posts = collection(db, "blog");
    const [current, former] = await Promise.all([
        getDocs(query(posts, where("slug", "==", slug), limit(3))),
        getDocs(query(posts, where("previousSlugs", "array-contains", slug), limit(3))),
    ]);
    return [...current.docs, ...former.docs].some((d) => d.id !== excludeId);
}

// ---------------------------------------------------------------- version history

const REVISION_LIMIT = 20;

/** A saved version of an article, for the History view. */
export interface Revision {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    tags: string[];
    savedAt: Date;
    reason: SaveIntent;
}

const revisionsOf = (postId: string) => collection(db, "blog", postId, "revisions");

const revisionFields = (post: DraftPost) => ({
    title: (post.title ?? "").trim(),
    excerpt: post.excerpt || "",
    content: post.content ?? "",
    coverImage: post.coverImage || "",
    category: post.category || CATEGORIES[0],
    tags: post.tags || [],
});

/** Keeps the newest 20 explicit saves. A save that changes nothing adds no revision. */
async function recordRevision(postId: string, post: DraftPost, reason: SaveIntent): Promise<void> {
    const newest = await getDocs(query(revisionsOf(postId), orderBy("savedAt", "desc"), limit(REVISION_LIMIT)));
    const fields = revisionFields(post);

    const latest = newest.docs[0]?.data();
    if (latest && JSON.stringify(revisionFields(latest as DraftPost)) === JSON.stringify(fields)) return;

    await addDoc(revisionsOf(postId), { ...fields, reason, savedAt: Timestamp.now() });
    await Promise.all(newest.docs.slice(REVISION_LIMIT - 1).map((old) => deleteDoc(old.ref)));
}

export async function listRevisions(postId: string): Promise<Revision[]> {
    const snap = await getDocs(query(revisionsOf(postId), orderBy("savedAt", "desc"), limit(REVISION_LIMIT)));
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            title: data.title ?? "",
            excerpt: data.excerpt ?? "",
            content: data.content ?? "",
            coverImage: data.coverImage ?? "",
            category: data.category ?? CATEGORIES[0],
            tags: Array.isArray(data.tags) ? data.tags : [],
            savedAt: (data.savedAt as Timestamp).toDate(),
            reason: (data.reason as SaveIntent) ?? "draft",
        };
    });
}

// ---------------------------------------------------------------- saving

/** Writes the post to Firestore and returns it with its server-side fields filled in. */
export async function persistPost(
    post: DraftPost,
    intent: SaveIntent,
    stored: StoredInfo,
    options: { revision?: boolean } = {}
): Promise<DraftPost> {
    const now = Timestamp.now();
    const slug = (post.slug ?? "").trim();
    const published = intent === "publish" ? true : intent === "update" ? post.published === true : false;

    // Keep old links alive when a post that has been public changes address
    const renamed = stored.wasPublic && stored.slug !== "" && stored.slug !== slug;
    const previousSlugs = [...new Set([...(post.previousSlugs ?? []), ...(renamed ? [stored.slug] : [])])].filter(
        (former) => former !== slug
    );

    // The public date is set once, the first time a post goes live. Older posts fall back to createdAt, so
    // unpublishing one pins that date before it can be lost.
    let publishedAt = post.publishedAt ?? null;
    if (!publishedAt && intent === "publish") publishedAt = now;
    if (!publishedAt && intent === "unpublish" && post.createdAt) publishedAt = post.createdAt;

    const content = post.content ?? "";
    const payload = {
        title: (post.title ?? "").trim(),
        slug,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || "",
        content,
        category: post.category || CATEGORIES[0],
        tags: post.tags || [],
        published,
        featured: Boolean(post.featured),
        readingTime: estimateReadingTime(content),
        previousSlugs,
        ...(publishedAt ? { publishedAt } : {}),
        updatedAt: now,
    };

    let saved: DraftPost;
    if (post.id) {
        await setDoc(doc(db, "blog", post.id), payload, { merge: true });
        saved = { ...post, ...payload, id: post.id };
    } else {
        const ref = doc(collection(db, "blog"));
        await setDoc(ref, { ...payload, id: ref.id, likes: 0, createdAt: now });
        saved = { ...post, ...payload, id: ref.id, likes: 0, createdAt: now };
    }

    // History is a convenience: it must never make a save fail
    if (options.revision && saved.id) {
        await recordRevision(saved.id, saved, intent).catch((err) => console.warn("Revision not recorded:", err));
    }
    return saved;
}

// ---------------------------------------------------------------- trash

/** Days a trashed article is kept before it is removed for good. */
export const TRASH_RETENTION_DAYS = 30;

/** Moves an article to the trash. It goes offline but can be restored; its Spotlight flag is left alone. */
export async function trashPost(post: BlogPost): Promise<void> {
    const now = Timestamp.now();
    await updateDoc(doc(db, "blog", post.id), {
        deletedAt: now,
        publishedBeforeTrash: post.published === true,
        published: false,
        updatedAt: now,
    });
}

/** Brings an article back from the trash, as a draft or as it was before (live again). */
export async function restorePost(id: string, publish: boolean): Promise<void> {
    await updateDoc(doc(db, "blog", id), {
        deletedAt: deleteField(),
        publishedBeforeTrash: deleteField(),
        published: publish,
        updatedAt: Timestamp.now(),
    });
}

/** Removes an article and its saved versions. */
export async function deletePostForever(id: string): Promise<void> {
    const revisions = await getDocs(revisionsOf(id));
    await Promise.all(revisions.docs.map((revision) => deleteDoc(revision.ref)));
    await deleteDoc(doc(db, "blog", id));
}
