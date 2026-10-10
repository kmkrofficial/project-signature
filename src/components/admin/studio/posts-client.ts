import {
    collection,
    doc,
    getDocs,
    limit,
    query,
    setDoc,
    Timestamp,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { estimateReadingTime } from "@/lib/format";
import { CATEGORIES, type DraftPost } from "./types";

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

/** Writes the post to Firestore and returns it with its server-side fields filled in. */
export async function persistPost(post: DraftPost, intent: SaveIntent, stored: StoredInfo): Promise<DraftPost> {
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

    if (post.id) {
        await setDoc(doc(db, "blog", post.id), payload, { merge: true });
        return { ...post, ...payload, id: post.id };
    }

    const ref = doc(collection(db, "blog"));
    await setDoc(ref, { ...payload, id: ref.id, likes: 0, createdAt: now });
    return { ...post, ...payload, id: ref.id, likes: 0, createdAt: now };
}
