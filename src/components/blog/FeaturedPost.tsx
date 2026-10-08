import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LinkPending } from "@/components/layout/LinkPending";
import { formatDate, formatReadingTime } from "@/lib/format";
import { COVER_IMAGE_SIZES, isOptimizableImage } from "@/lib/image-utils";
import type { PostSummary } from "@/types/blog";

export function FeaturedPost({ post }: { post: PostSummary }) {
    return (
        <article>
            <Link
                href={`/blog/${post.slug}`}
                className="group lift grid gap-4 md:grid-cols-[5fr_7fr] md:items-center md:gap-8 rounded-[28px] border border-border/80 bg-card p-3 sm:p-4 hover:border-primary/50"
            >
                {/* Same 16:9 shape and 16px corners as the article cover, so the morph never re-crops or re-rounds */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-secondary/40">
                    <ViewTransition name={`post-cover-${post.slug}`} share="post-cover" default="none">
                        <div className="absolute inset-0">
                            <Image
                                src={post.coverImage}
                                alt=""
                                fill
                                priority
                                unoptimized={!isOptimizableImage(post.coverImage)}
                                sizes={COVER_IMAGE_SIZES}
                                className="object-cover"
                            />
                        </div>
                    </ViewTransition>
                </div>
                <div className="flex flex-col justify-center px-2 pb-2 md:p-0 md:pr-4">
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
