/**
 * Utility to determine whether a given image URL can be optimized by Next.js
 * based on configured remote patterns, or if it should be rendered with unoptimized={true}
 * to prevent runtime crashes when arbitrary external image URLs are provided.
 */

const OPTIMIZABLE_HOSTS = new Set([
    "firebasestorage.googleapis.com",
    "images.unsplash.com",
    "127.0.0.1",
    "localhost",
]);

/**
 * Both the home spotlight and the article cover use this, so they request the same optimized file.
 * The article cover is then already cached when the home-to-article morph starts.
 */
export const COVER_IMAGE_SIZES = "(max-width: 1024px) 100vw, 768px";

export function isOptimizableImage(src?: string | null): boolean {
    if (!src) return false;
    // Local assets (starting with /) are always optimizable by Next.js
    if (src.startsWith("/") && !src.startsWith("//")) return true;

    try {
        const parsed = new URL(src);
        if (OPTIMIZABLE_HOSTS.has(parsed.hostname)) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
