import type { DraftPost } from "./types";

export function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

/** Applies a new title, keeping the slug in step with it unless it is being edited by hand. */
export function withTitle(post: DraftPost, title: string, manualSlug: boolean): DraftPost {
    return { ...post, title, slug: manualSlug ? post.slug : slugify(title) };
}
