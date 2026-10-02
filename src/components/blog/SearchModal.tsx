"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Tag, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface PostSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category?: string;
    tags: string[];
    readTime?: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [queryText, setQueryText] = useState("");
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch published posts once when search is first opened
    useEffect(() => {
        if (!isOpen) return;

        const loadPosts = async () => {
            if (posts.length > 0) return;
            setLoading(true);
            try {
                const q = query(collection(db, "blog"), where("published", "==", true));
                const snap = await getDocs(q);
                const data = snap.docs.map((doc) => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        slug: d.slug,
                        title: d.title || "",
                        excerpt: d.excerpt || "",
                        category: d.category || (d.tags && d.tags[0]) || "General",
                        tags: d.tags || [],
                        readTime: `${Math.max(1, Math.ceil((d.content?.split(/\s+/).length || 0) / 200))} min read`,
                    };
                });
                setPosts(data);
            } catch (err) {
                console.error("Error loading posts for search:", err);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen]);

    // Handle global Cmd+K or Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            } else if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const filtered = posts.filter((post) => {
        if (!queryText.trim()) return true;
        const q = queryText.toLowerCase();
        return (
            post.title.toLowerCase().includes(q) ||
            post.excerpt.toLowerCase().includes(q) ||
            post.tags.some((t) => t.toLowerCase().includes(q)) ||
            (post.category && post.category.toLowerCase().includes(q))
        );
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input Bar */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80">
                        <Search size={18} className="text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search essays, tags, topics..."
                            value={queryText}
                            onChange={(e) => {
                                setQueryText(e.target.value);
                                setSelectedIndex(0);
                            }}
                            className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Results Stream */}
                    <div className="overflow-y-auto p-2 divide-y divide-border/30">
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {loading ? "Indexing articles..." : `No articles found for "${queryText}".`}
                            </div>
                        ) : (
                            filtered.map((post, idx) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    onClick={onClose}
                                    className="block p-3 rounded-xl hover:bg-secondary/60 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <span className="text-primary font-medium">{post.category}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {post.readTime}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base truncate">
                                                {post.title}
                                            </h4>
                                            {post.excerpt && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight
                                            size={16}
                                            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-2"
                                        />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div className="px-4 py-2 border-t border-border/60 bg-secondary/20 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Navigate with keyboard or click</span>
                        <span>ESC to close</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
