"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { BlogContactSection } from "@/components/features/BlogContactSection";
import { Search, Tag, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { useThemeLanguage } from "@/hooks/useThemeLanguage";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date?: string; // We might need to format createdAt
    category?: string; // We didn't add category to admin form, maybe use tags[0]?
    readTime?: string; // We can calculate this
    tags: string[];
    createdAt?: { seconds: number; nanoseconds: number };
    published: boolean;
}

export default function BlogPage() {
    const t = useThemeLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Query for published posts (client-side sort to avoid composite index requirement)
                const q = query(collection(db, "blog"), where("published", "==", true));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "Unknown",
                        // Estimate read time: 200 words per minute
                        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
                        // Use first tag as category if not present
                        category: data.category || (data.tags && data.tags.length > 0 ? data.tags[0] : "Uncategorized")
                    };
                }) as BlogPost[];

                // Sort by createdAt descending
                postsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
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
                        <div className="grid grid-cols-1 gap-6">
                            {filteredPosts.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No logs found matching your criteria.
                                </div>
                            ) : (
                                filteredPosts.map((post, index) => (
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
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                                                            <span className="text-primary">{post.date}</span>
                                                            <span>//</span>
                                                            <span>{post.category}</span>
                                                            <span>//</span>
                                                            <span>{post.readTime?.replace("read", "").trim()} {t.blog.readTime}</span>
                                                        </div>
                                                        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                            {post.title}
                                                        </h2>
                                                        <p className="text-muted-foreground max-w-3xl">
                                                            {post.excerpt}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
                    )}
                </Container>
            </Section>

            <BlogContactSection />
        </div >
    );
}
