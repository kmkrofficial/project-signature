"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Search, Tag, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

// Mock Data for Blog Posts
const BLOG_POSTS = [
    {
        slug: "scaling-websockets-10m-users",
        title: "Scaling WebSockets for 10 Million Users",
        excerpt: "Architectural patterns for high-concurrency real-time systems using Redis Pub/Sub and horizontal scaling.",
        date: "2024-03-15",
        category: "System Design",
        readTime: "8 min read",
        tags: ["WebSockets", "Redis", "Scaling"]
    },
    {
        slug: "rag-chatbot-optimization",
        title: "Optimizing RAG Chatbots for Enterprise Data",
        excerpt: "Strategies for improving retrieval accuracy and reducing hallucination in Large Language Model applications.",
        date: "2024-02-28",
        category: "AI Engineering",
        readTime: "12 min read",
        tags: ["LLM", "RAG", "Vector DB"]
    },
    {
        slug: "anomaly-detection-edge",
        title: "Edge-Based Anomaly Detection with Transformers",
        excerpt: "Deploying lightweight Transformer models on edge devices for real-time security monitoring.",
        date: "2024-01-10",
        category: "Edge AI",
        readTime: "10 min read",
        tags: ["Edge Computing", "PyTorch", "Security"]
    }
];

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Array.from(new Set(BLOG_POSTS.map(post => post.category)));

    const filteredPosts = BLOG_POSTS.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="pt-20 min-h-screen">
            <Section>
                <Container>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <BookOpen size={20} />
                                <span className="font-mono text-sm tracking-wider">RESEARCH LAB // DOCUMENTATION</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">Engineering Logs</h1>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
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

                    <div className="grid grid-cols-1 gap-6">
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.slug}
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
                                                    <span>{post.readTime}</span>
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
                        ))}
                    </div>
                </Container>
            </Section>
        </div>
    );
}
