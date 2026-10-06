"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock, Heart, Share2, Check, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { useToast } from "@/context/ToastContext";
import { toFriendlyCategory, getCategoryBadgeClasses } from "@/lib/categoryUtils";
import { clsx } from "clsx";
import { getCachedPost, setCachedPost } from "@/lib/blogCache";
import { isOptimizableImage } from "@/lib/image-utils";
import { ArticleSkeleton } from "@/components/blog/ArticleSkeleton";
import type { BlogPost } from "@/types/blog";

export interface AdjacentPostSummary {
    slug: string;
    title: string;
    category: string;
    readTime: string;
}

interface BlogPostClientProps {
    initialPost?: BlogPost | null;
    prevPost?: AdjacentPostSummary | null;
    nextPost?: AdjacentPostSummary | null;
}

const likedKey = (postId: string) => `liked_${postId}`;

function readLiked(postId: string): boolean {
    try {
        return localStorage.getItem(likedKey(postId)) === "1";
    } catch {
        return false;
    }
}

function writeLiked(postId: string, liked: boolean): void {
    try {
        if (liked) localStorage.setItem(likedKey(postId), "1");
        else localStorage.removeItem(likedKey(postId));
    } catch {
        // Storage unavailable; the server still deduplicates
    }
}

export function BlogPostClient({ initialPost, prevPost, nextPost }: BlogPostClientProps) {
    const params = useParams();
    const slug = (params.slug as string) || initialPost?.slug || "";
    const { addToast } = useToast();

    const [post, setPost] = useState<BlogPost | null>(initialPost || null);
    const [likes, setLikes] = useState(initialPost?.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(!initialPost);
    const [notFound, setNotFound] = useState(false);
    const [zoomImage, setZoomImage] = useState<{ src: string; alt?: string } | null>(null);

    // Synchronize initialPost when provided or changed
    useEffect(() => {
        if (initialPost) {
            setPost(initialPost);
            setLikes(initialPost.likes || 0);
            setLoading(false);
            setCachedPost(initialPost.slug, initialPost);
        }
    }, [initialPost]);

    // Handle Escape key and body lock for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setZoomImage(null);
            }
        };

        if (zoomImage) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [zoomImage]);

    useEffect(() => {
        if (initialPost) {
            setHasLiked(readLiked(initialPost.id));
            return;
        }

        const cached = getCachedPost(slug);
        if (cached) {
            setPost(cached);
            setLikes(cached.likes || 0);
            setLoading(false);
        }

        const fetchPost = async () => {
            try {
                const q = query(collection(db, "blog"), where("slug", "==", slug), where("published", "==", true));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setNotFound(true);
                } else {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();

                    const postData: BlogPost = {
                        id: docSnap.id,
                        title: data.title,
                        slug: data.slug,
                        excerpt: data.excerpt,
                        coverImage: data.coverImage || "",
                        content: data.content,
                        tags: data.tags || [],
                        category: toFriendlyCategory(data.category || (data.tags && data.tags[0]) || "Technology"),
                        date: data.createdAt
                            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "Recent",
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                        likes: data.likes || 0,
                    };

                    setPost(postData);
                    setCachedPost(slug, postData);
                    setLikes(data.likes || 0);

                    setHasLiked(readLiked(docSnap.id));
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                setPost((current) => {
                    if (!current) setNotFound(true);
                    return current;
                });
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug, initialPost]);

    // Optimistic like toggle; the server deduplicates per reader and returns the true count
    const handleLike = async () => {
        if (!post) return;
        const nextLiked = !hasLiked;
        const previous = { liked: hasLiked, likes };

        setHasLiked(nextLiked);
        setLikes((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
        writeLiked(post.id, nextLiked);

        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.id, action: nextLiked ? "like" : "unlike" }),
            });
            if (!res.ok) throw new Error(`Like request failed: ${res.status}`);
            const data: { likes: number; liked: boolean } = await res.json();
            setLikes(data.likes);
            setHasLiked(data.liked);
            writeLiked(post.id, data.liked);
        } catch {
            setHasLiked(previous.liked);
            setLikes(previous.likes);
            writeLiked(post.id, previous.liked);
            addToast("Couldn't update your like. Please try again.", "error");
        }
    };

    // Copy Link
    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            addToast("Article link copied to clipboard!", "success");
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    // Seamless editorial skeleton instead of jarring centered spinner
    if (loading && !post) {
        return <ArticleSkeleton />;
    }

    if (notFound || !post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-bold mb-3 text-foreground">Article Not Found</h1>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                    The requested article does not exist or may have been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                    <ArrowLeft size={16} />
                    <span>Return to Articles</span>
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative pb-6 sm:pb-12"
        >
            <ReadingProgressBar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-5 transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>All Articles</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-10 relative">
                    {/* Main Article Column */}
                    <div className="min-w-0 max-w-3xl">
                        {/* Article Header */}
                        <header className="mb-7 pb-5 sm:mb-8 sm:pb-6 border-b border-border/60">
                            {/* Category Pill */}
                            <div className="flex items-center gap-2 text-xs font-mono mb-3">
                                <span className={clsx("px-2.5 py-0.5 rounded-full border font-semibold font-sans text-xs transition-colors", getCategoryBadgeClasses(post.category))}>
                                    {post.category}
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.2] mb-3 sm:mb-4">
                                {post.title}
                            </h1>

                            {/* Excerpt Lede */}
                            {post.excerpt && (
                                <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed mb-4">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Metadata & Actions Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-border/50">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={13} className="text-primary" />
                                        {post.date}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={13} />
                                        {post.readTime}
                                    </span>
                                </div>

                                {/* Article Actions (Like, Share) for Mobile/Tablet */}
                                <div className="flex items-center gap-2 self-start sm:self-auto lg:hidden">
                                    <button
                                        onClick={handleLike}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer",
                                            hasLiked
                                                ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                                                : "border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground"
                                        )}
                                        title={hasLiked ? "Unlike" : "Like this article"}
                                    >
                                        <Heart size={14} className={clsx(hasLiked && "fill-current")} />
                                        <span>{likes}</span>
                                    </button>

                                    <button
                                        onClick={handleCopyLink}
                                        className="p-1.5 sm:p-2 rounded-full border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                        title="Copy article link"
                                    >
                                        {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Article Cover Image Banner */}
                        {post.coverImage && (
                            <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] mb-8 border border-border/70 shadow-lg">
                                <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    fill
                                    priority
                                    unoptimized={!isOptimizableImage(post.coverImage)}
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Editorial Reading Canvas */}
                        <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-[1.7] font-sans prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-7 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-p:my-3 prose-p:leading-[1.72] prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-hr:my-6 prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:my-5 prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-secondary/40 dark:prose-blockquote:bg-secondary/20 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-foreground/95 prose-blockquote:shadow-xs prose-pre:p-0 prose-pre:bg-transparent">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const value = String(children).replace(/\n$/, "");
                                        if (!props.inline && match) {
                                            return <CodeBlock language={match[1]} value={value} />;
                                        }
                                        return (
                                            <code
                                                className="px-1.5 py-0.5 rounded-md bg-secondary/80 font-mono text-[0.85em] text-primary"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                    img({ src, alt }) {
                                        if (!src || typeof src !== "string") return null;
                                        return (
                                            <figure className="my-6">
                                                <div
                                                    className="relative overflow-hidden rounded-xl border border-border/80 shadow-md group cursor-zoom-in bg-secondary/20"
                                                    onClick={() => setZoomImage({ src, alt: alt || "" })}
                                                    title="Click to expand diagram"
                                                >
                                                    <Image
                                                        src={src}
                                                        alt={alt || ""}
                                                        width={1200}
                                                        height={675}
                                                        unoptimized
                                                        className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 text-foreground text-xs font-mono backdrop-blur-md shadow-md border border-border/60 font-medium">
                                                            <ZoomIn size={14} className="text-primary" />
                                                            Click to enlarge
                                                        </span>
                                                    </div>
                                                </div>
                                                {alt && (
                                                    <figcaption className="text-center text-xs text-muted-foreground mt-2 font-mono">
                                                        {`// ${alt}`}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        );
                                    },
                                    table({ children }) {
                                        return (
                                            <div className="overflow-x-auto my-6 border border-border/80 rounded-xl">
                                                <table className="w-full text-left text-sm">{children}</table>
                                            </div>
                                        );
                                    },
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </article>

                        {/* Tags Cloud */}
                        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border/60">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground border border-border/60"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Adjacent Post Navigation (Next / Previous Article) */}
                        {(prevPost || nextPost) && (
                            <nav className="mt-10 pt-8 border-t border-border/70" aria-label="Adjacent articles">
                                <h3 className="text-xs uppercase tracking-wider font-mono text-muted-foreground font-semibold mb-4">
                                    Continue Reading
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {prevPost ? (
                                        <Link
                                            href={`/blog/${prevPost.slug}`}
                                            className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-secondary/30 transition-all flex flex-col justify-between"
                                        >
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-2 group-hover:text-primary transition-colors">
                                                <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                                                <span>Previous Article</span>
                                            </div>
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base mb-3 leading-snug">
                                                {prevPost.title}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                                <span className={clsx("px-2 py-0.5 rounded-full border text-[10px] font-sans font-medium", getCategoryBadgeClasses(prevPost.category))}>
                                                    {prevPost.category}
                                                </span>
                                                <span>•</span>
                                                <span>{prevPost.readTime}</span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="hidden sm:block" />
                                    )}

                                    {nextPost ? (
                                        <Link
                                            href={`/blog/${nextPost.slug}`}
                                            className="group p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:bg-secondary/30 transition-all flex flex-col justify-between text-left sm:text-right"
                                        >
                                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground font-mono mb-2 group-hover:text-primary transition-colors">
                                                <span>Next Article</span>
                                                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base mb-3 leading-snug">
                                                {nextPost.title}
                                            </span>
                                            <div className="flex items-center sm:justify-end gap-2 text-xs font-mono text-muted-foreground">
                                                <span className={clsx("px-2 py-0.5 rounded-full border text-[10px] font-sans font-medium", getCategoryBadgeClasses(nextPost.category))}>
                                                    {nextPost.category}
                                                </span>
                                                <span>•</span>
                                                <span>{nextPost.readTime}</span>
                                            </div>
                                        </Link>
                                    ) : null}
                                </div>
                            </nav>
                        )}
                    </div>

                    {/* Right-Side Sticky Sidebar (Actions & Table of Contents) */}
                    <aside className="hidden lg:block relative h-full">
                        <div className="sticky top-20 space-y-4">
                            {/* Article Interactions Card */}
                            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
                                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2.5 px-0.5">
                                    <span className="uppercase tracking-wider font-semibold">Article Actions</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Like Button */}
                                    <button
                                        onClick={handleLike}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs group",
                                            hasLiked
                                                ? "border-rose-500/50 bg-rose-500/10 text-rose-500 shadow-rose-500/10"
                                                : "border-border bg-secondary/60 hover:bg-secondary hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                        )}
                                        title={hasLiked ? "Unlike article" : "Like this article"}
                                    >
                                        <Heart
                                            size={14}
                                            className={clsx(
                                                "transition-transform group-hover:scale-110",
                                                hasLiked ? "fill-current text-rose-500" : "text-muted-foreground group-hover:text-rose-500"
                                            )}
                                        />
                                        <span>{likes}</span>
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        onClick={handleCopyLink}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs group",
                                            copiedLink
                                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-semibold"
                                                : "border-border bg-secondary/60 hover:bg-secondary hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                        )}
                                        title="Share or copy article link"
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check size={14} className="text-emerald-500" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Share2 size={14} className="group-hover:text-primary transition-colors" />
                                                <span>Share</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Table of Contents */}
                            <TableOfContents content={post.content} />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Click-to-Zoom Lightbox Modal */}
            <AnimatePresence>
                {zoomImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md cursor-zoom-out"
                        onClick={() => setZoomImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                                <img
                                    src={zoomImage.src}
                                    alt={zoomImage.alt || ""}
                                    className="max-h-[80vh] w-auto object-contain select-none"
                                />
                            </div>
                            {zoomImage.alt && (
                                <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-mono border border-white/10 max-w-lg text-center truncate">
                                    {zoomImage.alt}
                                </div>
                            )}
                            <button
                                onClick={() => setZoomImage(null)}
                                className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-lg cursor-pointer"
                                title="Close (Esc)"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
