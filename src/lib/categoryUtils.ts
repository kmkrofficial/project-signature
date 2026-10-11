export type Topic = { name: string; slug: string };

/** Public topic pages (/topics/[slug]), one per predefined category. */
export const TOPICS: readonly Topic[] = [
    { name: "Artificial Intelligence", slug: "ai" },
    { name: "Web & Software", slug: "web-software" },
    { name: "Cloud & Data", slug: "cloud-data" },
    { name: "Guides & Tips", slug: "guides-tips" },
];

export function getTopicBySlug(slug: string): Topic | undefined {
    return TOPICS.find((topic) => topic.slug === slug);
}

export function getTopicByName(name: string): Topic | undefined {
    return TOPICS.find((topic) => topic.name === name);
}

/**
 * Normalizes raw or legacy category tags to consistent, friendly publication pillars.
 */
export function toFriendlyCategory(cat?: string): string {
    if (!cat) return "Technology";
    const lower = cat.toLowerCase();
    if (lower.includes("systems") || lower.includes("architecture")) return "Web & Software";
    if (lower.includes("backend") || lower.includes("cloud")) return "Cloud & Data";
    if (lower.includes("craft") || lower.includes("engineering craft")) return "Guides & Tips";
    if (lower.includes("machine learning") || lower.includes("intelligence") || lower === "ai") return "Artificial Intelligence";
    return cat;
}

/** Accent dot color per category (readable in both light and dark themes). */
export function getCategoryDotClass(cat?: string): string {
    switch (toFriendlyCategory(cat)) {
        case "Artificial Intelligence":
            return "bg-sky-500";
        case "Web & Software":
            return "bg-amber-500";
        case "Cloud & Data":
            return "bg-emerald-500";
        case "Guides & Tips":
            return "bg-violet-500";
        default:
            return "bg-primary";
    }
}
