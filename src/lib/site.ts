/** Canonical public origin, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
