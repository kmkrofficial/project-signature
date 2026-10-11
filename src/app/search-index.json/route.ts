import { cacheLife, cacheTag } from "next/cache";
import { getPublishedPosts, POSTS_TAG } from "@/lib/posts";
import type { SearchEntry } from "@/types/blog";

async function getSearchIndex(): Promise<SearchEntry[]> {
    "use cache";
    cacheLife("days");
    cacheTag(POSTS_TAG);

    const posts = await getPublishedPosts();
    return posts.map(({ slug, title, excerpt, category, tags, readingTime }) => ({
        slug,
        title,
        excerpt,
        category,
        tags,
        readingTime,
    }));
}

/** Lightweight index for the Cmd/Ctrl+K palette, fetched on first open. */
export async function GET() {
    return Response.json(await getSearchIndex());
}
