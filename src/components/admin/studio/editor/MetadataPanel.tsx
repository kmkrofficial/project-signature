"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { deriveExcerpt, estimateReadingTime, formatReadingTime } from "@/lib/format";
import { CoverField } from "./CoverField";
import { LinksField } from "./LinksField";
import { withTitle } from "../slug";
import { CATEGORIES, type DraftPost } from "../types";
import type { SlugStatus } from "../hooks/useSlugCheck";

interface Props {
    post: DraftPost;
    setPost: React.Dispatch<React.SetStateAction<DraftPost>>;
    manualSlug: boolean;
    setManualSlug: (manual: boolean) => void;
    /** The post has been live, so its URL is linked to elsewhere and changing it needs a deliberate unlock. */
    slugLocked: boolean;
    slugStatus: SlugStatus;
    /** The article's id (or the id it will get), which names its image folder. */
    articleId: string;
    /** "stack" is a single narrow column for the focus-mode side panel; the title is edited elsewhere there. */
    layout?: "grid" | "stack";
}

/** Title, slug, category, excerpt, tags, cover image and related links for the post being edited. */
export function MetadataPanel({
    post,
    setPost,
    manualSlug,
    setManualSlug,
    slugLocked,
    slugStatus,
    articleId,
    layout = "grid",
}: Props) {
    const [tagInput, setTagInput] = useState("");
    const [slugUnlocked, setSlugUnlocked] = useState(false);

    const stacked = layout === "stack";
    const slugEditable = slugLocked ? slugUnlocked : manualSlug;
    const span = stacked ? "" : "md:col-span-2";

    const autoExcerpt = deriveExcerpt(post.content ?? "");
    const shownExcerpt = post.excerpt?.trim() || autoExcerpt;

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
        <div
            className={clsx(
                "grid grid-cols-1 gap-4 bg-card p-5 rounded-xl border border-border/80",
                !stacked && "md:grid-cols-2"
            )}
        >
            {/* Title */}
            {!stacked && (
                <div className={clsx("space-y-1.5", span)}>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Article Title *
                    </label>
                    <input
                        type="text"
                        value={post.title || ""}
                        onChange={(e) => setPost((prev) => withTitle(prev, e.target.value, manualSlug))}
                        placeholder="e.g. Distributed Consensus in Modern Edge Architectures"
                        className="w-full px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            )}

            {/* Slug */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        URL Slug *
                    </label>
                    {slugLocked ? (
                        <button
                            type="button"
                            onClick={() => setSlugUnlocked(!slugUnlocked)}
                            className="text-[11px] text-primary hover:underline font-mono cursor-pointer"
                        >
                            {slugUnlocked ? "Lock" : "Edit slug"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setManualSlug(!manualSlug)}
                            className="text-[11px] text-primary hover:underline font-mono cursor-pointer"
                        >
                            {manualSlug ? "Auto-generate" : "Manual Edit"}
                        </button>
                    )}
                </div>
                <div className="flex items-center">
                    <span className="px-3 py-2 bg-secondary/80 border border-r-0 border-border rounded-l-xl text-xs font-mono text-muted-foreground">
                        /blog/
                    </span>
                    <input
                        type="text"
                        value={post.slug || ""}
                        readOnly={!slugEditable}
                        aria-invalid={slugStatus === "taken"}
                        onChange={(e) =>
                            setPost((prev) => ({
                                ...prev,
                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                            }))
                        }
                        placeholder="distributed-consensus"
                        className={clsx(
                            "w-full min-w-0 px-3.5 py-2 bg-secondary/40 border rounded-r-xl text-xs font-mono text-foreground focus:outline-none transition-colors",
                            slugStatus === "taken" ? "border-red-500/70 focus:border-red-400" : "border-border focus:border-primary",
                            !slugEditable && "opacity-80"
                        )}
                    />
                </div>
                <div className="min-h-4 text-[11px]" aria-live="polite">
                    {slugStatus === "taken" && (
                        <span className="text-red-400">Another article already uses this URL.</span>
                    )}
                    {slugStatus === "checking" && <span className="text-muted-foreground">Checking availability…</span>}
                    {slugStatus === "ok" && <span className="text-emerald-400">✓ Available</span>}
                    {slugLocked && slugUnlocked && slugStatus !== "taken" && (
                        <span className="block text-amber-400">
                            This article has been live. The old link will keep working and redirect here.
                        </span>
                    )}
                    {slugLocked && !slugUnlocked && (
                        <span className="text-muted-foreground">Locked because this article has been published.</span>
                    )}
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
            <div className={clsx("space-y-1.5", span)}>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Excerpt
                    </label>
                    {!post.excerpt?.trim() && autoExcerpt && (
                        <span className="text-[11px] font-mono text-muted-foreground">Using the opening paragraph</span>
                    )}
                </div>
                <textarea
                    value={post.excerpt || ""}
                    onChange={(e) => setPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                    placeholder={autoExcerpt || "A 1-2 sentence overview shown on cards and in the RSS feed. Leave empty to use the opening paragraph."}
                    className="w-full px-3.5 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />

                {/* How it will look in the article list */}
                <div className="rounded-xl border border-border/70 bg-background/60 p-3.5" aria-label="List preview">
                    <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                        <span className="text-primary">{post.category || CATEGORIES[0]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatReadingTime(estimateReadingTime(post.content ?? ""))}</span>
                    </p>
                    <p className="mt-1 text-base font-bold tracking-tight text-foreground line-clamp-2">
                        {post.title || "Untitled article"}
                    </p>
                    {shownExcerpt && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{shownExcerpt}</p>
                    )}
                </div>
            </div>

            {/* Tag Chips */}
            <div className={clsx("space-y-1.5", span)}>
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
                        className="flex-1 min-w-[8rem] px-2 py-1 bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Cover Image */}
            <div className={span}>
                <CoverField post={post} setPost={setPost} articleId={articleId} />
            </div>

            {/* Related links */}
            <div className={span}>
                <LinksField post={post} setPost={setPost} />
            </div>
        </div>
    );
}
