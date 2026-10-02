"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Tag, Loader2, Eye, Heart, Share2, Bookmark, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, increment, doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { useToast } from "@/context/ToastContext";
import { clsx } from "clsx";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
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

    const [post, setPost] = useState<BlogPost | null>(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(true);
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
                        content: data.content,
                        tags: data.tags || [],
                        category: data.category || (data.tags && data.tags[0]) || "Engineering Craft",
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
                    setLikes(data.likes || 0);

                    if (typeof window !== "undefined") {
                        if (sessionStorage.getItem(`liked_${docSnap.id}`)) {
                            setHasLiked(true);
                        }
                        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
                        setIsBookmarked(bookmarks.includes(postData.slug));
                    }
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                setNotFound(true);
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

    // Optimistic Bookmark Handler
    const handleToggleBookmark = () => {
        if (!post) return;
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
        let updated: string[];

        if (isBookmarked) {
            updated = bookmarks.filter((s: string) => s !== post.slug);
            setIsBookmarked(false);
            addToast("Removed from saved articles", "info");
        } else {
            updated = [...bookmarks, post.slug];
            setIsBookmarked(true);
            addToast("Saved to reading list", "success");
        }
        localStorage.setItem("bookmarks", JSON.stringify(updated));
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

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={36} />
                <p className="text-xs font-mono text-muted-foreground">Loading article...</p>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-bold mb-3 text-foreground">Article Not Found</h1>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                    The requested essay does not exist or may have been archived.
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
        <div className="relative min-h-screen pb-20">
            <ReadingProgressBar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>All Articles</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-start">
                    {/* Main Article Column */}
                    <div className="min-w-0">
                        {/* Article Header */}
                        <header className="mb-10 pb-8 border-b border-border/60">
                            {/* Category Pill */}
                            <div className="flex items-center gap-2 text-xs font-mono mb-4">
                                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold font-sans">
                                    {post.category}
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
                                {post.title}
                            </h1>

                            {/* Excerpt Lede */}
                            {post.excerpt && (
                                <p className="text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed mb-6">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Byline Row (Inspired Editorial Ergonomics) */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    {/* Author Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/30 border border-primary/40 flex items-center justify-center font-bold text-sm text-primary">
                                        KR
                                    </div>
                                    <div>
                                        <Link href="/about" className="font-semibold text-sm text-foreground hover:underline">
                                            Keerthi Raajan
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                            {post.views !== undefined && post.views > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {post.views}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Article Actions (Bookmark, Like, Share) */}
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                        onClick={handleLike}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95",
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
                                        onClick={handleToggleBookmark}
                                        className={clsx(
                                            "p-2 rounded-full border text-xs transition-colors",
                                            isBookmarked
                                                ? "border-primary/40 bg-primary/10 text-primary"
                                                : "border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground"
                                        )}
                                        title={isBookmarked ? "Remove bookmark" : "Save for later"}
                                    >
                                        <Bookmark size={14} className={clsx(isBookmarked && "fill-current")} />
                                    </button>

                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2 rounded-full border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy article link"
                                    >
                                        {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Mobile Table of Contents Accordion */}
                        <TableOfContents content={post.content} />

                        {/* Editorial Reading Canvas (Constrained to 680px for reading comfort) */}
                        <article className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-[1.8] font-sans prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-l-primary prose-blockquote:bg-secondary/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-pre:p-0 prose-pre:bg-transparent">
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
                                            <figure className="my-8">
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
                                            <div className="overflow-x-auto my-8 border border-border/80 rounded-xl">
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
                        <div className="flex flex-wrap gap-2 my-10 pt-6 border-t border-border/60">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full bg-secondary/50 text-xs font-mono text-muted-foreground border border-border/50"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Author Sign-Off Card (Quiet, Inspired by Top Publications) */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/80 mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-500/30 border border-primary/40 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                                KR
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-foreground mb-1">
                                    Written by Keerthi Raajan
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                    Full-Stack AI Engineer specializing in high-concurrency systems, distributed logic, and machine learning infrastructure.
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <Link href="/about" className="text-primary hover:underline">
                                        View Portfolio & Work History →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sticky Table of Contents Sidebar */}
                    <aside className="hidden lg:block">
                        <TableOfContents content={post.content} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
