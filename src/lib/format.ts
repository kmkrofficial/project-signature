const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});

/** Formats an ISO date deterministically (UTC) so server and client output match. */
export function formatDate(iso: string): string {
    return dateFormatter.format(new Date(iso));
}

export function formatReadingTime(minutes: number): string {
    return `${minutes} min read`;
}

/** Rough reading time at 200 words per minute, minimum one minute. */
export function estimateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

/**
 * The first real paragraph of Markdown as plain text, used for cards and snippets when an article has no
 * hand-written excerpt. Skips headings, code, images, tables and rules.
 */
export function deriveExcerpt(markdown: string, maxLength = 160): string {
    const paragraphs = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/<[^>]+>/g, "")
        .split(/\n\s*\n/);

    for (const raw of paragraphs) {
        const text = raw
            .replace(/^\s{0,3}#{1,6}\s.*$/gm, "")
            .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            .replace(/^\s{0,3}(>|[-*+]|\d+\.)\s+/gm, "")
            .replace(/[*_`~]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        if (text.length < 20 || /^(-{3,}|\|)/.test(text)) continue;
        if (text.length <= maxLength) return text;

        const cut = text.slice(0, maxLength + 1);
        const lastSpace = cut.lastIndexOf(" ");
        return cut.slice(0, lastSpace > maxLength / 2 ? lastSpace : maxLength).replace(/[\s,;:.\-–—]+$/, "") + "…";
    }
    return "";
}
