import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Rss } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { getAdjacentPosts, getPostBySlug, getPublishedPosts, getSiteConfig } from "@/lib/posts";
import { formatDate, formatReadingTime } from "@/lib/format";
import { isOptimizableImage } from "@/lib/image-utils";
import { ArticleEnhancer } from "@/components/blog/ArticleEnhancer";
import { ArticleSkeleton } from "@/components/blog/ArticleSkeleton";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LikeButton } from "@/components/blog/LikeButton";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { ShareButton } from "@/components/blog/ShareButton";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkPending } from "@/components/layout/LinkPending";
import { PageTransition } from "@/components/layout/PageTransition";
import { absoluteUrl } from "@/lib/site";
import type { PostSummary } from "@/types/blog";

type Props = { params: Promise<{ slug: string }> };

const CONTENT_ID = "article-content";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    // Cache Components requires at least one param; unknown slugs still render on demand
    return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const [post, config] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
    if (!post) return { title: "Article not found" };

    // Social images come from the sibling opengraph-image.tsx (branded card per article)
    return {
        title: post.title,
        description: post.excerpt || undefined,
        authors: [{ name: config.author, url: "/about" }],
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            type: "article",
            url: `/blog/${post.slug}`,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [config.author],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || undefined,
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    return (
        <PageTransition>
            <Suspense
                fallback={
                    <ViewTransition exit="slide-down" default="none">
                        <ArticleSkeleton />
                    </ViewTransition>
                }
            >
                <ViewTransition enter="slide-up" default="none">
                    <Article params={params} />
                </ViewTransition>
            </Suspense>
        </PageTransition>
    );
}

async function Article({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const [{ previous, next }, config] = await Promise.all([getAdjacentPosts(slug), getSiteConfig()]);
    const wasUpdated = Date.parse(post.updatedAt) - Date.parse(post.publishedAt) > ONE_DAY_MS;

    const url = absoluteUrl(`/blog/${post.slug}`);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        url,
        mainEntityOfPage: url,
        image: post.coverImage || undefined,
        keywords: post.tags.join(", ") || undefined,
        articleSection: post.category,
        author: { "@type": "Person", name: config.author, url: absoluteUrl("/about") },
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <ReadingProgressBar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-10 xl:gap-16">
                    <article className="min-w-0 max-w-3xl">
                        <Link
                            href="/"
                            transitionTypes={["nav-back"]}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            All articles
                            <LinkPending />
                        </Link>

                        <header className="mb-8">
                            <CategoryBadge category={post.category} className="mb-4" />
                            <ViewTransition name={`post-title-${post.slug}`} share="post-title" default="none">
                                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.15] text-balance">
                                    {post.title}
                                </h1>
                            </ViewTransition>
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
                            <ViewTransition name={`post-cover-${post.slug}`} share="post-cover" default="none">
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
                            </ViewTransition>
                        )}

                        <div
                            id={CONTENT_ID}
                            className="article-prose prose prose-neutral dark:prose-invert sm:prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.html }}
                        />

                        {post.tags.length > 0 && (
                            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                                {post.tags.map((tag) => (
                                    <li key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                                        #{tag}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <footer className="mt-10 pt-8 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <LikeButton postId={post.id} initialLikes={post.likes} />
                                <ShareButton title={post.title} />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>Follow along</span>
                                <a href="/feed.xml" aria-label="RSS feed" title="RSS feed" className="p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors">
                                    <Rss size={18} />
                                </a>
                                {config.github && (
                                    <a href={config.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className="p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors">
                                        <GitHubIcon size={16} />
                                    </a>
                                )}
                                {config.linkedin && (
                                    <a href={config.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="p-1.5 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors">
                                        <LinkedInIcon size={16} />
                                    </a>
                                )}
                            </div>
                        </footer>

                        {(previous || next) && (
                            <nav aria-label="More articles" className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {previous ? <AdjacentLink post={previous} direction="previous" /> : <div className="hidden sm:block" />}
                                {next && <AdjacentLink post={next} direction="next" />}
                            </nav>
                        )}
                    </article>

                    {post.headings.length > 0 && (
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                                <TableOfContents headings={post.headings} />
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
            transitionTypes={[isNext ? "nav-forward" : "nav-back"]}
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
