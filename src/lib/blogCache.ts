import type { BlogPost } from "@/types/blog";

// Lightweight client-side cache for instantaneous article loading
export type CachedBlogPost = BlogPost;

const memoryCache = new Map<string, CachedBlogPost>();

export function setCachedPost(slug: string, post: CachedBlogPost): void {
    if (!slug) return;
    memoryCache.set(slug, post);

    if (typeof window !== "undefined") {
        try {
            sessionStorage.setItem(`cached_post_${slug}`, JSON.stringify(post));
        } catch {
            // Storage quota exceeded or disabled, memoryCache handles it
        }
    }
}

export function getCachedPost(slug: string): CachedBlogPost | null {
    if (!slug) return null;

    // 1. Instant check in memory map
    if (memoryCache.has(slug)) {
        return memoryCache.get(slug)!;
    }

    // 2. Check sessionStorage
    if (typeof window !== "undefined") {
        try {
            const stored = sessionStorage.getItem(`cached_post_${slug}`);
            if (stored) {
                const parsed = JSON.parse(stored) as CachedBlogPost;
                memoryCache.set(slug, parsed);
                return parsed;
            }
        } catch {
            // Ignore parse errors
        }
    }

    return null;
}

export function primePostCache(posts: CachedBlogPost[]): void {
    if (!Array.isArray(posts)) return;
    for (const post of posts) {
        if (post?.slug) {
            setCachedPost(post.slug, post);
        }
    }
}
