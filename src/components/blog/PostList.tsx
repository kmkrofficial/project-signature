import Link from "next/link";
import { BookOpen } from "lucide-react";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { PostSummary } from "@/types/blog";

export function PostCard({ post }: { post: PostSummary }) {
    return (
        <article>
            <Link
                href={`/blog/${post.slug}`}
                className="group block -mx-4 sm:-mx-5 px-4 sm:px-5 py-5 rounded-2xl hover:bg-card transition-colors"
            >
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <CategoryBadge category={post.category} asText />
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{formatReadingTime(post.readingTime)}</span>
                </p>
                <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors text-balance">
                    {post.title}
                </h2>
                {post.excerpt && (
                    <p className="mt-1.5 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
            </Link>
        </article>
    );
}

interface PostListProps {
    posts: PostSummary[];
    emptyMessage?: string;
}

export function PostList({ posts, emptyMessage = "No articles published yet." }: PostListProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-14 border border-dashed border-border rounded-2xl">
                <BookOpen size={28} className="mx-auto mb-3 text-muted-foreground/60" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/60">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
