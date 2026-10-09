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
