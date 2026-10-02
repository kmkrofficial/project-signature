"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Tag, Eye, Heart, Share2, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, increment, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { useToast } from "@/context/ToastContext";
import { toFriendlyCategory } from "@/app/blog/BlogListClient";
import { clsx } from "clsx";
import { getCachedPost, setCachedPost } from "@/lib/blogCache";
import { ArticleSkeleton } from "@/components/blog/ArticleSkeleton";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    content: string;
    date: string;
    readTime: string;
    category?: string;
    tags: string[];
    views?: number;
    likes?: number;
}

export function BlogPostClient() {
    const params = useParams();
    const slug = params.slug as string;
    const { addToast } = useToast();

    // Check synchronous client-side cache for instantaneous 0ms display
    const cached = typeof window !== "undefined" ? getCachedPost(slug) : null;
    const [post, setPost] = useState<BlogPost | null>(cached as any);
    const [likes, setLikes] = useState(cached?.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(!cached);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const q = query(collection(db, "blog"), where("slug", "==", slug));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setNotFound(true);
                } else {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();

                    // Increment views once per session
                    const viewedKey = `viewed_${docSnap.id}`;
                    if (typeof window !== "undefined" && !sessionStorage.getItem(viewedKey)) {
                        updateDoc(doc(db, "blog", docSnap.id), {
                            views: increment(1),
                        }).catch(() => {});
                        sessionStorage.setItem(viewedKey, "true");
                    }

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
                        views: (data.views || 0) + (typeof window !== "undefined" && sessionStorage.getItem(viewedKey) ? 1 : 0),
                        likes: data.likes || 0,
                    };

                    setPost(postData);
                    setCachedPost(slug, postData);
                    setLikes(data.likes || 0);

                    if (typeof window !== "undefined") {
                        if (sessionStorage.getItem(`liked_${docSnap.id}`)) {
                            setHasLiked(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                if (!post) setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    // Optimistic Like Handler (0ms visual feedback)
    const handleLike = async () => {
        if (!post) return;
        const viewedKey = `liked_${post.id}`;

        if (hasLiked) {
            setLikes((prev) => Math.max(0, prev - 1));
            setHasLiked(false);
            sessionStorage.removeItem(viewedKey);
            await updateDoc(doc(db, "blog", post.id), {
                likes: increment(-1),
            }).catch(() => {});
        } else {
            setLikes((prev) => prev + 1);
            setHasLiked(true);
            sessionStorage.setItem(viewedKey, "true");
            await updateDoc(doc(db, "blog", post.id), {
                likes: increment(1),
            }).catch(() => {});
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
            className="relative pb-2 sm:pb-4"
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
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold font-sans">
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
                                    {post.views !== undefined && post.views > 0 && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={13} />
                                                {post.views} views
                                            </span>
                                        </>
                                    )}
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
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Editorial Reading Canvas (Constrained for reading comfort) */}
                        <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-[1.7] font-sans prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-7 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2 prose-p:my-3 prose-p:leading-[1.72] prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-blockquote:my-4 prose-hr:my-6 prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-l-primary prose-blockquote:bg-secondary/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-pre:p-0 prose-pre:bg-transparent">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const value = String(children).replace(/\n$/, "");
                                        if (!inline && match) {
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
                                        return (
                                            <figure className="my-6">
                                                <img
                                                    src={src}
                                                    alt={alt || ""}
                                                    className="w-full h-auto rounded-xl border border-border/80 shadow-md"
                                                    loading="lazy"
                                                />
                                                {alt && (
                                                    <figcaption className="text-center text-xs text-muted-foreground mt-2 font-mono">
                                                        // {alt}
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
                                    className="px-2.5 py-1 rounded-full bg-secondary/50 text-xs font-mono text-muted-foreground border border-slate-300/60 dark:border-zinc-800"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right-Side Sticky Sidebar (Actions & Table of Contents) */}
                    <aside className="hidden lg:block relative h-full">
                        <div className="sticky top-20 space-y-4">
                            {/* Article Interactions Card */}
                            <div className="p-3.5 rounded-2xl bg-card border border-slate-300/80 dark:border-zinc-800 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2.5 px-0.5">
                                    <span className="uppercase tracking-wider font-semibold">Article Actions</span>
                                    {post.views !== undefined && post.views > 0 && (
                                        <span className="flex items-center gap-1 text-[11px]">
                                            <Eye size={11} />
                                            {post.views}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Like Button */}
                                    <button
                                        onClick={handleLike}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs group",
                                            hasLiked
                                                ? "border-rose-500/50 bg-rose-500/10 text-rose-500 shadow-rose-500/10"
                                                : "border-slate-300 dark:border-zinc-700/80 bg-secondary/40 hover:bg-secondary hover:border-primary/50 text-muted-foreground hover:text-foreground"
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
                                                : "border-slate-300 dark:border-zinc-700/80 bg-secondary/40 hover:bg-secondary hover:border-primary/50 text-muted-foreground hover:text-foreground"
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
        </motion.div>
    );
}
