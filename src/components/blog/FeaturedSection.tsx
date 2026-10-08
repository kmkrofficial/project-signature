import { FeaturedPost } from "@/components/blog/FeaturedPost";
import type { PostSummary } from "@/types/blog";

/** The spotlight story: the newest featured post that has a cover image. */
export function pickFeatured(posts: PostSummary[]): PostSummary | null {
    return posts.find((post) => post.featured && post.coverImage) ?? null;
}

/** Spotlight card shown above the list on both the home and topic pages. */
export function FeaturedSection({ post }: { post: PostSummary }) {
    return (
        <section aria-label="Featured article" className="mb-10 sm:mb-12">
            <FeaturedPost post={post} />
        </section>
    );
}
