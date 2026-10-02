"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Tag, ArrowRight, BookOpen, Loader2, Eye, Heart, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Clock, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { clsx } from "clsx";

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date?: string;
    category?: string;
    readTime?: string;
    tags: string[];
    createdAt?: { seconds: number; nanoseconds: number };
    published: boolean;
    views?: number;
    likes?: number;
    featured?: boolean;
}

type SortOption = "newest" | "oldest" | "views" | "likes";

const PREDEFINED_CATEGORIES = [
    "All",
    "AI & Machine Learning",
    "Systems & Architecture",
    "Backend & Cloud",
    "Engineering Craft",
];

export function BlogListClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const postsPerPage = 8;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "blog"), where("published", "==", true));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: data.createdAt
                            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "Recent",
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                        category: data.category || (data.tags && data.tags.length > 0 ? data.tags[0] : "Engineering Craft"),
                        views: data.views || 0,
                        likes: data.likes || 0,
                    };
                }) as BlogPost[];

                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    // Filter and Sort Logic
    const filteredAndSortedPosts = posts
        .filter(post => {
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory =
                selectedCategory === "All" ||
                (post.category && post.category.toLowerCase() === selectedCategory.toLowerCase()) ||
                post.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase());

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortOption) {
                case "oldest":
                    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
                case "views":
                    return (b.views || 0) - (a.views || 0);
                case "likes":
                    return (b.likes || 0) - (a.likes || 0);
                case "newest":
                default:
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            }
        });

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredAndSortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    const sortLabels: Record<SortOption, string> = {
        newest: "Newest First",
        oldest: "Oldest First",
        views: "Most Viewed",
        likes: "Most Liked",
    };

    const featuredPost = posts.find(p => p.featured) || (posts.length > 0 ? posts[0] : null);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            {/* Author Intro Header (Quiet, Classy Editorial) */}
            <header className="mb-12 md:mb-16 border-b border-border/60 pb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-wider uppercase mb-3">
                            <Sparkles size={14} />
                            <span>Engineering Journal</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                            Writings on systems, AI & architecture.
                        </h1>
                        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
                            Hi, I’m Keerthi Raajan. I write deep dives on high-concurrency systems, full-stack AI integrations, and software engineering craft.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6 text-sm">
                    <Link
                        href="/about"
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline group"
                    >
                        <span>Read my background & portfolio</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </header>

            {/* Predefined Categories (Sliding Capsule Indicator) */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar mask-gradient-right">
                {PREDEFINED_CATEGORIES.map(category => {
                    const active = selectedCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={clsx(
                                "relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                                active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            )}
                        >
                            {active && (
                                <motion.span
                                    layoutId="activeCategoryTab"
                                    className="absolute inset-0 bg-secondary border border-border/80 rounded-full shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                            {category}
                        </button>
                    );
                })}
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-10">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search essays, topics, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:border-primary/60 transition-colors"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium bg-secondary/30 border border-border/80 rounded-xl hover:bg-secondary/60 transition-colors"
                    >
                        <SlidersHorizontal size={14} className="text-muted-foreground" />
                        <span>{sortLabels[sortOption]}</span>
                        <ChevronDown size={14} className={clsx("transition-transform duration-200", isSortOpen && "rotate-180")} />
                    </button>

                    {isSortOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden py-1">
                                {(Object.keys(sortLabels) as SortOption[]).map(option => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSortOption(option);
                                            setIsSortOpen(false);
                                        }}
                                        className={clsx(
                                            "w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between",
                                            sortOption === option ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span>{sortLabels[option]}</span>
                                        {sortOption === option && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Articles Stream */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={36} />
                </div>
            ) : currentPosts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl p-8">
                    <BookOpen size={36} className="mx-auto mb-3 text-muted-foreground/60" />
                    <h3 className="font-semibold text-lg text-foreground mb-1">No articles found</h3>
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? `No posts matched "${searchQuery}".` : "No articles published in this category yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {currentPosts.map((post, idx) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.05 }}
                        >
                            <Link
                                href={`/blog/${post.slug}`}
                                className="block p-6 sm:p-7 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all duration-200 group hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="flex flex-col gap-3">
                                    {/* Meta Row */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
                                        <span className="text-primary font-semibold font-sans">{post.category}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {post.date}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {post.readTime}
                                        </span>

                                        {(post.views !== undefined || post.likes !== undefined) && (
                                            <>
                                                <span>•</span>
                                                <div className="flex items-center gap-3">
                                                    {post.views !== undefined && (
                                                        <span className="flex items-center gap-1" title="Views">
                                                            <Eye size={12} />
                                                            {post.views}
                                                        </span>
                                                    )}
                                                    {post.likes !== undefined && post.likes > 0 && (
                                                        <span className="flex items-center gap-1 text-rose-500/80" title="Likes">
                                                            <Heart size={12} className="fill-current" />
                                                            {post.likes}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Headline */}
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Tags & Action */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] font-mono text-muted-foreground"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-[11px] text-muted-foreground self-center">
                                                    +{post.tags.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                                            Read article
                                            <ArrowRight size={13} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-xs font-mono text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next Page"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
