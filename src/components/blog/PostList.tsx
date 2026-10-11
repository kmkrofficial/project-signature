import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LinkPending } from "@/components/layout/LinkPending";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { PostSummary } from "@/types/blog";

export function PostCard({ post }: { post: PostSummary }) {
    return (
        <article className="reveal">
            <Link
                href={`/blog/${post.slug}`}
                className="group press block -mx-4 sm:-mx-5 px-4 sm:px-5 py-5 rounded-2xl hover:bg-card"
            >
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <CategoryBadge category={post.category} asText />
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{formatReadingTime(post.readingTime)}</span>
                    <ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="ml-auto text-muted-foreground opacity-0 -translate-x-2 transition-[opacity,translate,color] duration-200 ease-smooth group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary"
                    />
                </p>
                <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors text-balance">
                    {post.title}
                </h2>
                {post.excerpt && (
                    <p className="mt-1.5 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <LinkPending />
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
