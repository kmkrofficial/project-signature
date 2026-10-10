"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { CATEGORIES, type DraftPost } from "../types";

interface Props {
    post: DraftPost;
    setPost: React.Dispatch<React.SetStateAction<DraftPost>>;
    manualSlug: boolean;
    setManualSlug: (manual: boolean) => void;
}

/** Title, slug, category, excerpt, tags and cover image for the post being edited. */
export function MetadataPanel({ post, setPost, manualSlug, setManualSlug }: Props) {
    const [tagInput, setTagInput] = useState("");

    // Auto-generate the slug from the title unless it is being edited by hand
    const handleTitleChange = (title: string) => {
        const autoSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        setPost((prev) => ({ ...prev, title, slug: manualSlug ? prev.slug : autoSlug }));
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const clean = tagInput.trim().replace(/^#|,/g, "");
            if (!post.tags?.includes(clean)) {
                setPost((prev) => ({ ...prev, tags: [...(prev.tags || []), clean] }));
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setPost((prev) => ({ ...prev, tags: prev.tags?.filter((t) => t !== tag) || [] }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-5 rounded-xl border border-border/80">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Article Title *
                </label>
                <input
                    type="text"
                    value={post.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Distributed Consensus in Modern Edge Architectures"
                    className="w-full px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        URL Slug *
                    </label>
                    <button
                        type="button"
                        onClick={() => setManualSlug(!manualSlug)}
                        className="text-[11px] text-primary hover:underline font-mono"
                    >
                        {manualSlug ? "Auto-generate" : "Manual Edit"}
                    </button>
                </div>
                <div className="flex items-center">
                    <span className="px-3 py-2 bg-secondary/80 border border-r-0 border-border rounded-l-xl text-xs font-mono text-muted-foreground">
                        /blog/
                    </span>
                    <input
                        type="text"
                        value={post.slug || ""}
                        readOnly={!manualSlug}
                        onChange={(e) =>
                            setPost((prev) => ({
                                ...prev,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                            }))
                        }
                        placeholder="distributed-consensus"
                        className={clsx(
                            "w-full px-3.5 py-2 bg-secondary/40 border border-border rounded-r-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors",
                            !manualSlug && "opacity-80"
                        )}
                    />
                </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary Category
                </label>
                <select
                    value={post.category || CATEGORIES[0]}
                    onChange={(e) => setPost((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-card text-foreground">
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Executive Summary / Excerpt
                </label>
                <textarea
                    value={post.excerpt || ""}
                    onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                    placeholder="A 1-2 sentence executive overview displayed in cards and RSS feeds..."
                    className="w-full px-3.5 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
            </div>

            {/* Tag Chips */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags (Press Enter or Comma to add)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/30 border border-border rounded-xl min-h-[42px]">
                    {post.tags?.map((t) => (
                        <span
                            key={t}
                            className="animate-pop inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-secondary text-primary border border-border"
                        >
                            #{t}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(t)}
                                className="press hover:text-red-400 ml-0.5 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={post.tags?.length ? "Add another tag..." : "e.g. Nextjs, QUIC, Caching"}
                        className="flex-1 min-w-[140px] px-2 py-1 bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Cover Image */}
            <div
                className={clsx(
                    "space-y-1.5 md:col-span-2 p-3.5 rounded-xl transition-colors",
                    post.featured &&
                        (post.coverImage
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-amber-500/10 border border-amber-500/30")
                )}
            >
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span>Cover Image URL (Editorial Spotlight Hero)</span>
                        {post.featured && (
                            <span
                                className={clsx(
                                    "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border",
                                    post.coverImage
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30"
                                )}
                            >
                                * Mandatory for Spotlight
                            </span>
                        )}
                    </label>
                    <span className="text-[11px] font-mono">
                        {post.featured ? (
                            post.coverImage ? (
                                <span className="text-emerald-500 font-medium">✓ Cover image attached</span>
                            ) : (
                                <span className="text-amber-500 dark:text-amber-400 font-medium">Required before publishing</span>
                            )
                        ) : (
                            <span className="text-muted-foreground/70">Optional • Generates dynamic gradient if empty</span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="url"
                        value={post.coverImage || ""}
                        onChange={(e) => setPost((prev) => ({ ...prev, coverImage: e.target.value }))}
                        placeholder={
                            post.featured
                                ? "https://images.unsplash.com/... (Cover image required for spotlight)"
                                : "https://images.unsplash.com/... or paste image URL"
                        }
                        className={clsx(
                            "flex-1 px-3.5 py-2 bg-secondary/40 border rounded-xl text-xs text-foreground focus:outline-none transition-colors font-mono",
                            post.featured && !post.coverImage
                                ? "border-amber-500/70 focus:border-amber-400"
                                : "border-border focus:border-primary"
                        )}
                    />
                    {post.coverImage && (
                        <button
                            type="button"
                            onClick={() => setPost((prev) => ({ ...prev, coverImage: "" }))}
                            className="press px-2.5 py-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs text-muted-foreground hover:text-red-400 cursor-pointer"
                            title="Clear Image"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                {post.coverImage && (
                    <div className="animate-fade-in mt-2 relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-border/80 bg-secondary/20">
                        <NextImage src={post.coverImage} alt="Cover preview" fill unoptimized className="object-cover" />
                        <span className="absolute bottom-2 right-2 text-[10px] bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-foreground font-mono">
                            Preview
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
