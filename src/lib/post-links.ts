import type { PostLink } from "@/types/blog";

/** Matches the cap in firestore.rules. */
export const MAX_POST_LINKS = 8;
export const MAX_LINK_LABEL = 80;
export const MAX_LINK_NOTE = 120;

export type LinkKind = "github" | "linkedin" | "youtube" | "x" | "link";

/** The URL when it is an absolute http(s) address, otherwise null. */
export function parseLinkUrl(value: string): URL | null {
    try {
        const url = new URL(value.trim());
        return url.protocol === "https:" || url.protocol === "http:" ? url : null;
    } catch {
        return null;
    }
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/**
 * Cleans stored or edited links into what is saved and rendered: valid http(s) URLs only, no duplicates,
 * trimmed text, at most MAX_POST_LINKS. Rows still being filled in are dropped.
 */
export function toPostLinks(value: unknown): PostLink[] {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const links: PostLink[] = [];
    for (const item of value) {
        if (!item || typeof item !== "object") continue;
        const { url: rawUrl, label, note } = item as Record<string, unknown>;
        const url = typeof rawUrl === "string" ? parseLinkUrl(rawUrl) : null;
        if (!url || seen.has(url.href)) continue;
        seen.add(url.href);
        links.push({ url: url.href, label: str(label, MAX_LINK_LABEL), note: str(note, MAX_LINK_NOTE) });
        if (links.length === MAX_POST_LINKS) break;
    }
    return links;
}

const hostOf = (url: URL) => url.hostname.replace(/^www\./, "");

/** What the link points at, so it can get a matching icon without the writer picking one. */
export function linkKind(value: string): LinkKind {
    const url = parseLinkUrl(value);
    if (!url) return "link";
    const host = hostOf(url);
    const is = (domain: string) => host === domain || host.endsWith(`.${domain}`);
    if (is("github.com")) return "github";
    if (is("linkedin.com") || host === "lnkd.in") return "linkedin";
    if (is("youtube.com") || host === "youtu.be") return "youtube";
    if (is("x.com") || is("twitter.com")) return "x";
    return "link";
}

/** A short readable form of the URL, shown when a link has no label: "github.com/owner/repo". */
export function prettyUrl(value: string): string {
    const url = parseLinkUrl(value);
    if (!url) return value;
    const path = url.pathname.replace(/\/+$/, "");
    try {
        return hostOf(url) + decodeURIComponent(path);
    } catch {
        return hostOf(url) + path;
    }
}
