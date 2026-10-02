"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, Loader2, Eye, Heart, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { clsx } from "clsx";
import { SpotlightCoverFallback } from "@/components/blog/SpotlightCoverFallback";
import { primePostCache } from "@/lib/blogCache";

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImage?: string;
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
    "Artificial Intelligence",
    "Web & Software",
    "Cloud & Data",
    "Guides & Tips",
];

// Map overly technical categories to friendly, accessible names
export function toFriendlyCategory(cat?: string): string {
    if (!cat) return "Technology";
    const lower = cat.toLowerCase();
    if (lower.includes("systems") || lower.includes("architecture")) return "Web & Software";
    if (lower.includes("backend") || lower.includes("cloud")) return "Cloud & Data";
    if (lower.includes("craft") || lower.includes("engineering craft")) return "Guides & Tips";
    if (lower.includes("machine learning")) return "Artificial Intelligence";
    return cat;
}

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
                    const rawCat = data.category || (data.tags && data.tags.length > 0 ? data.tags[0] : "Technology");
                    return {
                        id: doc.id,
                        ...data,
                        coverImage: data.coverImage || "",
                        date: data.createdAt
                            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "Recent",
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                        category: toFriendlyCategory(rawCat),
                        views: data.views || 0,
                        likes: data.likes || 0,
                    };
                }) as BlogPost[];

                setPosts(postsData);
                primePostCache(postsData);
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
                (selectedCategory === "Artificial Intelligence" &&
                    (post.category?.toLowerCase().includes("ai") ||
                     post.category?.toLowerCase().includes("intelligence") ||
                     post.tags.some(t => /ai|llm|agent|machine/i.test(t)))) ||
                (selectedCategory === "Web & Software" &&
                    (post.category?.toLowerCase().includes("software") ||
                     post.category?.toLowerCase().includes("web") ||
                     post.category?.toLowerCase().includes("system") ||
                     post.tags.some(t => /web|architecture|http|frontend|system/i.test(t)))) ||
                (selectedCategory === "Cloud & Data" &&
                    (post.category?.toLowerCase().includes("cloud") ||
                     post.category?.toLowerCase().includes("data") ||
                     post.category?.toLowerCase().includes("backend") ||
                     post.tags.some(t => /redis|cloud|database|cache|backend/i.test(t)))) ||
                (selectedCategory === "Guides & Tips" &&
                    (post.category?.toLowerCase().includes("guide") ||
                     post.category?.toLowerCase().includes("tip") ||
                     post.category?.toLowerCase().includes("craft") ||
                     post.tags.some(t => /guide|tip|tutorial|best-practice/i.test(t)))) ||
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

    // Select category-specific featured post if one matches the active filter, otherwise keep the global featured post
    const categoryFeatured = selectedCategory === "All"
        ? null
        : filteredAndSortedPosts.find(p => p.featured);
    const spotlightPost = categoryFeatured || posts.find(p => p.featured) || (posts.length > 0 ? posts[0] : null);

    // Keep the featured article hero visible when selecting category filters and sort options
    const showSpotlight = !searchQuery.trim() && currentPage === 1 && Boolean(spotlightPost);

    // Exclude the spotlight post from the chronological stream below when spotlight hero is visible
    const displayPosts = showSpotlight && spotlightPost
        ? filteredAndSortedPosts.filter(p => p.id !== spotlightPost.id)
        : filteredAndSortedPosts;

    // Pagination
    const totalPages = Math.ceil(displayPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = displayPosts.slice(indexOfFirstPost, indexOfLastPost);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    const sortLabels: Record<SortOption, string> = {
        newest: "Newest First",
        oldest: "Oldest First",
        views: "Most Viewed",
        likes: "Most Liked",
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16">
            {/* Editorial Spotlight Hero Card (Option 1) */}
            {showSpotlight && spotlightPost && (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8 sm:mb-10"
                >
                    <Link
                        href={`/blog/${spotlightPost.slug}`}
                        className="group block relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                            {/* Cover Canvas / Image (Left 5 Cols on desktop) */}
                            <div className="md:col-span-5 relative overflow-hidden aspect-[16/10] md:aspect-auto md:min-h-[290px] bg-secondary/40 border-b md:border-b-0 md:border-r border-border/60">
                                {spotlightPost.coverImage ? (
                                    <img
                                        src={spotlightPost.coverImage}
                                        alt={spotlightPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <SpotlightCoverFallback
                                        title={spotlightPost.title}
                                        category={spotlightPost.category}
                                        tags={spotlightPost.tags}
                                    />
                                )}
                            </div>

                            {/* Content Side (Right 7 Cols on desktop) */}
                            <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
                                <div>
                                    {/* Live Badge + Category + Read Time */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            {spotlightPost.featured ? "Featured Story" : "Latest Story"}
                                        </span>
                                        <span className="text-muted-foreground/40">•</span>
                                        <span className="font-semibold text-primary font-sans">{spotlightPost.category}</span>
                                        <span className="text-muted-foreground/40">•</span>
                                        <span className="flex items-center gap-1 text-muted-foreground font-mono">
                                            <Clock size={12} />
                                            {spotlightPost.readTime}
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 leading-tight mb-2.5">
                                        {spotlightPost.title}
                                    </h2>

                                    {/* Excerpt */}
                                    {spotlightPost.excerpt && (
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                                            {spotlightPost.excerpt}
                                        </p>
                                    )}
                                </div>

                                {/* Footer Row: Tags + Read CTA */}
                                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                                    <div className="flex flex-wrap gap-1.5">
                                        {spotlightPost.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 rounded-md bg-secondary/60 text-[11px] font-mono text-muted-foreground"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary group-hover:translate-x-1.5 transition-transform duration-200">
                                        <span>Read article</span>
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}

            {/* Predefined Categories (Sliding Capsule Indicator) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar mask-gradient-right">
                {PREDEFINED_CATEGORIES.map(category => {
                    const active = selectedCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={clsx(
                                "relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                                active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            )}
                        >
                            {active && (
                                <motion.span
                                    layoutId="activeCategoryTab"
                                    className="absolute inset-0 bg-secondary border border-slate-300 dark:border-zinc-700 rounded-full shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                />
                            )}
                            {category}
                        </button>
                    );
                })}
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search articles, topics, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-secondary/30 border border-slate-300 dark:border-zinc-700/80 rounded-xl focus:outline-none focus:border-primary/60 transition-colors"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium bg-secondary/30 border border-slate-300 dark:border-zinc-700/80 rounded-xl hover:bg-secondary/60 transition-colors"
                    >
                        <SlidersHorizontal size={14} className="text-muted-foreground" />
                        <span>{sortLabels[sortOption]}</span>
                        <ChevronDown size={14} className={clsx("transition-transform duration-200", isSortOpen && "rotate-180")} />
                    </button>

                    {isSortOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-slate-300 dark:border-zinc-700 rounded-xl shadow-xl z-30 overflow-hidden py-1">
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
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : currentPosts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-300 dark:border-zinc-700/80 rounded-xl p-6">
                    <BookOpen size={32} className="mx-auto mb-2.5 text-muted-foreground/60" />
                    <h3 className="font-semibold text-base text-foreground mb-1">
                        {showSpotlight && spotlightPost && filteredAndSortedPosts.some(p => p.id === spotlightPost.id)
                            ? "All articles in this category are featured above"
                            : "No articles found"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {searchQuery
                            ? `No posts matched "${searchQuery}".`
                            : showSpotlight && spotlightPost && filteredAndSortedPosts.some(p => p.id === spotlightPost.id)
                            ? "Explore the featured article above or choose another topic."
                            : "No articles published in this category yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {currentPosts.map((post, idx) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.05 }}
                        >
                            <Link
                                href={`/blog/${post.slug}`}
                                className="block p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all duration-200 group hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="flex flex-col gap-2.5">
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
                                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Tags & Action */}
                                    <div className="flex items-center justify-between pt-1">
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
                        <div className="flex justify-center items-center gap-4 pt-6">
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
