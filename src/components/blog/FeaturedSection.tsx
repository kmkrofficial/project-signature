import { ViewTransition } from "react";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import type { PostSummary } from "@/types/blog";

/** The spotlight story: the newest featured post that has a cover image. */
export function pickFeatured(posts: PostSummary[]): PostSummary | null {
    return posts.find((post) => post.featured && post.coverImage) ?? null;
}

/**
 * Spotlight card shown above the list on the home and topic pages. It shares one transition name
 * across both, so moving between topics leaves it exactly where it is.
 */
export function FeaturedSection({ post }: { post: PostSummary }) {
    return (
        <ViewTransition name="featured-spotlight" share="spotlight-stay" default="none">
            <section aria-label="Featured article" className="mb-10 sm:mb-12">
                <FeaturedPost post={post} />
            </section>
        </ViewTransition>
    );
}
