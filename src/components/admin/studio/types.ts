import { TOPICS } from "@/lib/categoryUtils";
import type { BlogPost } from "@/types/blog";

export type StudioTab = "articles" | "editor" | "media" | "settings";

/** The post being edited; fields are optional until it has been saved once. */
export type DraftPost = Partial<BlogPost>;

export interface StoredImage {
    name: string;
    url: string;
    fullPath?: string;
    size?: string;
    /** Just uploaded in this session; animates in. */
    fresh?: boolean;
}

export const CATEGORIES = TOPICS.map((topic) => topic.name);

export function emptyPost(): DraftPost {
    return {
        title: "",
        slug: "",
        excerpt: "",
        coverImage: "",
        content: "",
        category: CATEGORIES[0],
        tags: [],
        links: [],
        // New posts start as drafts; going live is an explicit Publish
        published: false,
        featured: false,
    };
}
