import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Rss } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { formatDate, formatReadingTime } from "@/lib/format";
import { isOptimizableImage } from "@/lib/image-utils";
import { ArticleEnhancer } from "@/components/blog/ArticleEnhancer";
import { ArticleLinks } from "@/components/blog/ArticleLinks";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LikeButton } from "@/components/blog/LikeButton";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { ShareButton } from "@/components/blog/ShareButton";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { LinkPending } from "@/components/layout/LinkPending";
import type { AdjacentPosts, Post, PostSummary, SiteConfig } from "@/types/blog";

const CONTENT_ID = "article-content";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Props =
    | {
          mode: "published";
          post: Post;
          config: SiteConfig;
          adjacent: AdjacentPosts;
      }
    | {
          /** Unpublished draft shown to its author or a reviewer: no likes, sharing, or navigation. */
          mode: "preview";
          post: Post;
          /** Rendered above the article, e.g. a "Draft preview" notice. */
          banner: ReactNode;
      };

/** The full article page body, shared by the public page and draft previews so they cannot drift apart. */
export function ArticleView(props: Props) {
    const { post } = props;
    const isPublished = props.mode === "published";
    const wasUpdated = Date.parse(post.updatedAt) - Date.parse(post.publishedAt) > ONE_DAY_MS;
    const hasToc = post.headings.length > 0;
    const hasLinks = post.links.length > 0;

    return (
        <>
            {props.mode === "preview" && props.banner}
            <ReadingProgressBar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10 xl:gap-16">
                    <article className="min-w-0 max-w-3xl">
                        {isPublished && (
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                All articles
                                <LinkPending />
                            </Link>
                        )}

                        <header className="mb-8">
                            <CategoryBadge category={post.category} className="mb-4" />
                            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.15] text-balance">
                                {post.title}
                            </h1>
                            {post.excerpt && (
                                <p className="mt-4 text-lg text-muted-foreground leading-relaxed text-pretty">{post.excerpt}</p>
                            )}
                            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                                <span aria-hidden="true">·</span>
                                <span>{formatReadingTime(post.readingTime)}</span>
                                {wasUpdated && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                            Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                                        </span>
                                    </>
                                )}
                            </p>
                        </header>

                        {post.coverImage && (
                            <div className="relative w-full aspect-[16/9] mb-10 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40">
                                <Image
                                    src={post.coverImage}
                                    alt=""
                                    fill
                                    priority
                                    unoptimized={!isOptimizableImage(post.coverImage)}
                                    sizes="(max-width: 1024px) 100vw, 768px"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div
                            id={CONTENT_ID}
                            className="article-prose prose prose-neutral dark:prose-invert sm:prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.html }}
                        />

                        {post.tags.length > 0 && (
                            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                                {post.tags.map((tag) => (
                                    <li key={tag} className="lift px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground">
                                        #{tag}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* The side rail is hidden below lg, so the links move to the end of the article there */}
                        {hasLinks && <ArticleLinks links={post.links} layout="cards" className="mt-10 lg:hidden" />}

                        {props.mode === "published" && (
                            <>
                                <footer className="mt-10 pt-8 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <LikeButton postId={post.id} initialLikes={post.likes} />
                                        <ShareButton title={post.title} />
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>Follow along</span>
                                        <a href="/feed.xml" aria-label="RSS feed" title="RSS feed" className="lift press p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60">
                                            <Rss size={18} />
                                        </a>
                                        {props.config.github && (
                                            <a href={props.config.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className="lift press p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60">
                                                <GitHubIcon size={16} />
                                            </a>
                                        )}
                                        {props.config.linkedin && (
                                            <a href={props.config.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="lift press p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60">
                                                <LinkedInIcon size={16} />
                                            </a>
                                        )}
                                    </div>
                                </footer>

                                {(props.adjacent.previous || props.adjacent.next) && (
                                    <nav aria-label="More articles" className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {props.adjacent.previous ? (
                                            <AdjacentLink post={props.adjacent.previous} direction="previous" />
                                        ) : (
                                            <div className="hidden sm:block" />
                                        )}
                                        {props.adjacent.next && <AdjacentLink post={props.adjacent.next} direction="next" />}
                                    </nav>
                                )}
                            </>
                        )}
                    </article>

                    {(hasToc || hasLinks) && (
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain">
                                {hasToc && <TableOfContents headings={post.headings} />}
                                {hasLinks && (
                                    <ArticleLinks
                                        links={post.links}
                                        layout="rail"
                                        className={hasToc ? "mt-8 pt-6 border-t border-border/70" : undefined}
                                    />
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <ArticleEnhancer contentId={CONTENT_ID} />
        </>
    );
}

function AdjacentLink({ post, direction }: { post: PostSummary; direction: "previous" | "next" }) {
    const isNext = direction === "next";
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`group lift press p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 ${isNext ? "sm:text-right" : ""}`}
        >
            <span className={`flex items-center gap-1.5 text-xs text-muted-foreground mb-2 ${isNext ? "sm:justify-end" : ""}`}>
                {!isNext && <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />}
                {isNext ? "Newer article" : "Older article"}
                {isNext && <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />}
            </span>
            <span className="block font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {post.title}
            </span>
            <LinkPending />
        </Link>
    );
}
