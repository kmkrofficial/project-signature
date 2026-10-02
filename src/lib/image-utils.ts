/**
 * Utility to determine whether a given image URL can be optimized by Next.js
 * based on configured remote patterns, or if it should be rendered with unoptimized={true}
 * to prevent runtime crashes when arbitrary external image URLs are provided.
 */

const OPTIMIZABLE_HOSTS = new Set([
    "firebasestorage.googleapis.com",
    "images.unsplash.com",
    "plus.unsplash.com",
    "127.0.0.1",
    "localhost",
]);

export function isOptimizableImage(src?: string | null): boolean {
    if (!src) return false;
    // Local assets (starting with /) are always optimizable by Next.js
    if (src.startsWith("/") && !src.startsWith("//")) return true;

    try {
        const parsed = new URL(src);
        if (OPTIMIZABLE_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith(".unsplash.com")) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
