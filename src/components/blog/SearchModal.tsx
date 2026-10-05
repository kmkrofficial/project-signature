"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { clsx } from "clsx";
import { toFriendlyCategory, getCategoryBadgeClasses } from "@/lib/categoryUtils";

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
    const router = useRouter();
    const [queryText, setQueryText] = useState("");
    const [posts, setPosts] = useState<PostSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

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
                        slug: d.slug || doc.id,
                        title: d.title || "",
                        excerpt: d.excerpt || "",
                        category: toFriendlyCategory(d.category || (d.tags && d.tags[0]) || "Technology"),
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
    }, [isOpen, posts.length]);

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

    // Reset selection index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [queryText]);

    // Keep active item scrolled into view
    useEffect(() => {
        if (!listRef.current) return;
        const activeElement = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
        if (activeElement) {
            activeElement.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    // Keyboard navigation (Arrow keys, Enter, Esc, Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            } else if (e.key === "Escape" && isOpen) {
                onClose();
            } else if (isOpen && filtered.length > 0) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filtered.length);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    const target = filtered[selectedIndex];
                    if (target) {
                        onClose();
                        router.push(`/blog/${target.slug}`);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, filtered, selectedIndex, router]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md"
                onClick={onClose}
            >
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
                            placeholder="Search articles, tags, topics..."
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Results Stream */}
                    <div ref={listRef} className="overflow-y-auto p-2 space-y-1">
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {loading ? "Loading articles..." : `No articles found for "${queryText}".`}
                            </div>
                        ) : (
                            filtered.map((post, idx) => {
                                const isSelected = idx === selectedIndex;
                                return (
                                    <Link
                                        key={post.id}
                                        data-index={idx}
                                        href={`/blog/${post.slug}`}
                                        onClick={onClose}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={clsx(
                                            "block p-3 rounded-xl border transition-all duration-150 group",
                                            isSelected
                                                ? "bg-secondary/90 border-primary/40 shadow-xs"
                                                : "border-transparent hover:bg-secondary/40 text-foreground"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                    <span className={clsx("px-2 py-0.2 rounded-full border text-[10px] font-sans font-semibold", getCategoryBadgeClasses(post.category))}>
                                                        {post.category}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <Clock size={11} />
                                                        {post.readTime}
                                                    </span>
                                                </div>
                                                <h4 className={clsx("font-semibold text-base truncate transition-colors", isSelected ? "text-primary" : "text-foreground group-hover:text-primary")}>
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
                                                className={clsx(
                                                    "transition-all shrink-0 mt-2",
                                                    isSelected ? "text-primary translate-x-1" : "text-muted-foreground group-hover:text-primary"
                                                )}
                                            />
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Tip with Command Palette Keyboard Badges */}
                    <div className="px-4 py-2.5 border-t border-border/60 bg-secondary/30 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px]">↑↓</kbd>
                                <span>Navigate</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px]">↵</kbd>
                                <span>Open</span>
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px]">ESC</kbd>
                            <span>Close</span>
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
