import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LinkPending } from "@/components/layout/LinkPending";
import { formatDate, formatReadingTime } from "@/lib/format";
import { isOptimizableImage } from "@/lib/image-utils";
import type { PostSummary } from "@/types/blog";

export function FeaturedPost({ post }: { post: PostSummary }) {
    return (
        <article>
            <Link
                href={`/blog/${post.slug}`}
                className="group lift grid md:grid-cols-[5fr_7fr] overflow-hidden rounded-3xl border border-border/80 bg-card hover:border-primary/50"
            >
                <ViewTransition name={`post-cover-${post.slug}`} share="post-cover" default="none">
                    <div className="relative aspect-[16/9] md:aspect-auto md:min-h-72 overflow-hidden bg-secondary/40">
                        <Image
                            src={post.coverImage}
                            alt=""
                            fill
                            priority
                            unoptimized={!isOptimizableImage(post.coverImage)}
                            sizes="(max-width: 768px) 100vw, 420px"
                            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
                        />
                    </div>
                </ViewTransition>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider text-primary">Featured</span>
                        <span aria-hidden="true">·</span>
                        <CategoryBadge category={post.category} asText />
                    </p>
                    <ViewTransition name={`post-title-${post.slug}`} share="post-title" default="none">
                        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight text-balance">
                            {post.title}
                        </h2>
                    </ViewTransition>
                    {post.excerpt && (
                        <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                    )}
                    <p className="mt-5 text-sm text-muted-foreground">
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        <span aria-hidden="true"> · </span>
                        {formatReadingTime(post.readingTime)}
                    </p>
                </div>
                <LinkPending />
            </Link>
        </article>
    );
}
