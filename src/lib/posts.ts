import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { DocumentData, DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { toFriendlyCategory } from "@/lib/categoryUtils";
import { deriveExcerpt, estimateReadingTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { toPostLinks } from "@/lib/post-links";
import type { AdjacentPosts, Post, PostSummary, SiteConfig } from "@/types/blog";

/** Cache tags invalidated by the Admin Studio after edits (see app/admin/actions.ts). */
export const POSTS_TAG = "posts";
export const CONFIG_TAG = "config";

const DEFAULT_SITE_CONFIG: SiteConfig = {
    siteTitle: "Signature",
    siteDescription: "Articles on technology, building software, and practical ideas from real-world projects.",
    author: "Keerthi Raajan K M",
    email: "kmkrworks@gmail.com",
    github: "https://github.com/kmkrofficial",
    linkedin: "https://linkedin.com/in/keerthiraajankm",
    twitter: "",
};

/** Normalizes Admin SDK Timestamps and legacy `{ seconds }` / `{ _seconds }` shapes to ISO strings. */
function toIsoDate(value: unknown): string | null {
    if (!value || typeof value !== "object") return null;
    const v = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof v.toDate === "function") return v.toDate().toISOString();
    const seconds = v.seconds ?? v._seconds;
    return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

function toPostSummary(id: string, data: DocumentData): PostSummary {
    const publishedAt = toIsoDate(data.publishedAt) ?? toIsoDate(data.createdAt) ?? new Date(0).toISOString();
    const content = typeof data.content === "string" ? data.content : "";

    return {
        id,
        slug: data.slug || id,
        title: data.title || "Untitled Article",
        // No written excerpt: fall back to the opening paragraph so cards and feeds are never blank
        excerpt: data.excerpt || deriveExcerpt(content),
        coverImage: data.coverImage || "",
        category: toFriendlyCategory(data.category || data.tags?.[0] || "Technology"),
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: data.featured === true,
        likes: Math.max(0, Number(data.likes) || 0),
        readingTime: Number(data.readingTime) || estimateReadingTime(content),
        publishedAt,
        updatedAt: toIsoDate(data.updatedAt) ?? publishedAt,
    };
}

function byNewest(a: PostSummary, b: PostSummary): number {
    return b.publishedAt.localeCompare(a.publishedAt);
}

/** All published posts (metadata only), newest first. */
export async function getPublishedPosts(): Promise<PostSummary[]> {
    "use cache";
    cacheLife("days");
    cacheTag(POSTS_TAG);

    const snap = await db.collection("blog").where("published", "==", true).get();
    return snap.docs.map((doc) => toPostSummary(doc.id, doc.data())).sort(byNewest);
}

/** A single published post with rendered HTML, or null when missing or unpublished. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    "use cache";
    cacheLife("days");
    cacheTag(POSTS_TAG, `post:${slug}`);

    const snap = await db
        .collection("blog")
        .where("slug", "==", slug)
        .where("published", "==", true)
        .limit(1)
        .get();

    const doc: DocumentSnapshot | undefined = snap.docs[0];
    const data = doc?.data();
    if (!doc || !data) return null;

    const { html, headings } = await renderMarkdown(typeof data.content === "string" ? data.content : "");
    return { ...toPostSummary(doc.id, data), html, headings, links: toPostLinks(data.links) };
}

/**
 * Any post by id (drafts included), rendered fresh on every call. Callers must have authorized access
 * themselves (see lib/previews.ts); this is never cached so unpublished content cannot leak into the cache.
 */
export async function getPostForPreview(postId: string): Promise<{ post: Post; published: boolean } | null> {
    const snap = await db.collection("blog").doc(postId).get();
    const data = snap.data();
    if (!data || data.deletedAt) return null;

    const summary = toPostSummary(snap.id, data);
    const published = data.published === true;
    // A live post is shown at its public address, so there is nothing to render here
    if (published) return { post: { ...summary, html: "", headings: [], links: [] }, published };

    const { html, headings } = await renderMarkdown(typeof data.content === "string" ? data.content : "");
    return { post: { ...summary, html, headings, links: toPostLinks(data.links) }, published };
}

/** The current slug of a published post that used to live at `slug`, for permanent redirects. */
export async function getRedirectForSlug(slug: string): Promise<string | null> {
    "use cache";
    cacheLife("days");
    cacheTag(POSTS_TAG);

    const snap = await db.collection("blog").where("previousSlugs", "array-contains", slug).limit(5).get();
    const current = snap.docs.map((doc) => doc.data()).find((data) => data.published === true && data.slug);
    return current?.slug ?? null;
}

/** Chronological neighbours: `previous` is older, `next` is newer. */
export async function getAdjacentPosts(slug: string): Promise<AdjacentPosts> {
    const posts = await getPublishedPosts();
    const index = posts.findIndex((post) => post.slug === slug);
    if (index === -1) return { previous: null, next: null };
    return {
        next: index > 0 ? posts[index - 1] : null,
        previous: index < posts.length - 1 ? posts[index + 1] : null,
    };
}

export async function getSiteConfig(): Promise<SiteConfig> {
    "use cache";
    cacheLife("days");
    cacheTag(CONFIG_TAG);

    const snap = await db.doc("config/site").get();
    const data = snap.data() ?? {};
    const pick = (key: keyof SiteConfig) =>
        typeof data[key] === "string" && data[key].trim() ? (data[key] as string) : DEFAULT_SITE_CONFIG[key];

    return {
        siteTitle: pick("siteTitle"),
        siteDescription: pick("siteDescription"),
        author: pick("author"),
        email: pick("email"),
        github: pick("github"),
        linkedin: pick("linkedin"),
        twitter: pick("twitter"),
    };
}
