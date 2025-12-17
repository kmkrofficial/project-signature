"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

import { Search, Tag, ArrowRight, BookOpen, Loader2, Eye, Heart, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useThemeLanguage } from "@/hooks/useThemeLanguage";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface BlogPost {
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
}

type SortOption = "newest" | "oldest" | "views" | "likes";

export default function BlogPage() {
    const t = useThemeLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const postsPerPage = 10;

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
                        date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "Unknown",
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                        category: data.category || (data.tags && data.tags.length > 0 ? data.tags[0] : "Uncategorized"),
                        views: data.views || 0,
                        likes: data.likes || 0
                    };
                }) as BlogPost[];

                // Initial sort is handled by effect below, just set data here
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean) as string[]));

    // Filter and Sort
    const filteredAndSortedPosts = posts
        .filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
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

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredAndSortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    return (
        <div className="pt-20 min-h-screen">
            <Section className="py-12 md:py-16">
                <Container>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <BookOpen size={20} />
                                <span className="font-mono text-sm tracking-wider">{t.blog.subtitle}</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">{t.blog.title}</h1>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {/* Sort Dropdown / Controls */}
                            <div className="flex items-center gap-2 bg-secondary/20 border border-border rounded px-3 py-2">
                                <SlidersHorizontal size={16} className="text-muted-foreground" />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="bg-transparent border-none text-sm focus:outline-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="views">Most Viewed</option>
                                    <option value="likes">Most Liked</option>
                                </select>
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder={t.blog.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-secondary/20 border border-border rounded w-full sm:w-64 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1 rounded text-sm font-mono whitespace-nowrap border transition-colors ${!selectedCategory ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/50'}`}
                        >
                            ALL
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded text-sm font-mono whitespace-nowrap border transition-colors ${selectedCategory === category ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:border-primary/50'}`}
                            >
                                {category.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 gap-6">
                                {currentPosts.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No logs found matching your criteria.
                                    </div>
                                ) : (
                                    currentPosts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Link href={`/blog/${post.slug}`} className="block group">
                                                <article className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/50 transition-colors" />

                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground mb-2">
                                                                <span className="text-primary">{post.date}</span>
                                                                <span>//</span>
                                                                <span>{post.category}</span>
                                                                <span>//</span>
                                                                <span>{post.readTime?.replace("read", "").trim()} {t.blog.readTime}</span>

                                                                {(post.views !== undefined || post.likes !== undefined) && (
                                                                    <>
                                                                        <span className="hidden sm:inline">//</span>
                                                                        <div className="flex items-center gap-3">
                                                                            {post.views !== undefined && (
                                                                                <span className="flex items-center gap-1" title="Views">
                                                                                    <Eye size={12} /> {post.views}
                                                                                </span>
                                                                            )}
                                                                            {post.likes !== undefined && (
                                                                                <span className="flex items-center gap-1" title="Likes">
                                                                                    <Heart size={12} /> {post.likes}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                                {post.title}
                                                            </h2>
                                                            <p className="text-muted-foreground max-w-3xl line-clamp-2">
                                                                {post.excerpt}
                                                            </p>
                                                        </div>
                                                        <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-2 md:mt-0" />
                                                    </div>

                                                    <div className="flex gap-2 mt-4">
                                                        {post.tags.map(tag => (
                                                            <span key={tag} className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-secondary/30 text-muted-foreground">
                                                                <Tag size={10} />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </article>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 pt-4">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="font-mono text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </Section>


        </div >
    );
}
