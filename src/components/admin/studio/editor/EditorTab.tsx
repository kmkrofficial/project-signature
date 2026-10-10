"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { estimateReadingTime } from "@/lib/format";
import { MetadataPanel } from "./MetadataPanel";
import type { DraftPost } from "../types";
import type { BlogPost } from "@/types/blog";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
    loading: () => <Skeleton className="h-[520px] rounded-xl" />,
});

const MAX_SPOTLIGHT = 3;

interface Props {
    post: DraftPost;
    setPost: React.Dispatch<React.SetStateAction<DraftPost>>;
    manualSlug: boolean;
    setManualSlug: (manual: boolean) => void;
    posts: BlogPost[];
    saving: boolean;
    justSaved: boolean;
    onSave: () => void;
    onBack: () => void;
}

export function EditorTab({ post, setPost, manualSlug, setManualSlug, posts, saving, justSaved, onSave, onBack }: Props) {
    const { addToast } = useToast();
    const { theme } = useTheme();

    const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
    const readingTime = estimateReadingTime(post.content || "");

    const otherFeaturedCount = posts.filter((p) => p.featured && p.id !== post.id).length;
    const isAtLimit = otherFeaturedCount >= MAX_SPOTLIGHT && !post.featured;

    return (
        <div className="animate-fade-up space-y-6">
            {/* Editor Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/80">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="press p-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Back to Articles"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {post.id ? "Edit Article" : "Write New Article"}
                        </h2>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{readingTime} min read</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 self-stretch sm:self-auto justify-end">
                    <label
                        className={clsx(
                            "flex items-center gap-2 text-xs select-none",
                            isAtLimit ? "text-muted-foreground/50 cursor-not-allowed" : "text-muted-foreground cursor-pointer"
                        )}
                        title={
                            isAtLimit
                                ? "Maximum of 3 Spotlight articles reached. Unfeature an existing article first."
                                : "Feature this story in the Spotlight Carousel (up to 3)"
                        }
                    >
                        <input
                            type="checkbox"
                            disabled={isAtLimit}
                            checked={Boolean(post.featured)}
                            onChange={(e) => {
                                const isFeatured = e.target.checked;
                                if (isFeatured && otherFeaturedCount >= MAX_SPOTLIGHT) {
                                    addToast("Maximum of 3 articles can be marked as Spotlight. Unfeature an existing article first.", "error");
                                    return;
                                }
                                setPost((prev) => ({ ...prev, featured: isFeatured }));
                                if (isFeatured && (!post.coverImage || !post.coverImage.trim())) {
                                    addToast("Spotlight enabled: Please ensure a cover image is uploaded for this article.", "info");
                                }
                            }}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className={post.featured ? "text-primary font-medium" : ""}>
                            Spotlight Story ({otherFeaturedCount + (post.featured ? 1 : 0)}/3)
                        </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={post.published !== false}
                            onChange={(e) => setPost((prev) => ({ ...prev, published: e.target.checked }))}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        <span className={post.published !== false ? "text-emerald-400 font-medium" : ""}>
                            {post.published !== false ? "Publish Live" : "Keep as Draft"}
                        </span>
                    </label>

                    <SaveButton saving={saving} justSaved={justSaved} onSave={onSave} compact />
                </div>
            </div>

            <MetadataPanel post={post} setPost={setPost} manualSlug={manualSlug} setManualSlug={setManualSlug} />

            {/* Markdown Canvas Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="font-semibold uppercase tracking-wider">Markdown & Raw HTML Canvas</span>
                    <span className="font-mono text-[11px]">Supports raw &lt;details&gt;, &lt;iframe&gt;, and GitHub Markdown</span>
                </div>
                <div data-color-mode={theme === "light" ? "light" : "dark"} className="rounded-xl overflow-hidden border border-border/80">
                    <MDEditor
                        value={post.content || ""}
                        onChange={(val) => setPost((prev) => ({ ...prev, content: val || "" }))}
                        height={520}
                        preview="live"
                    />
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80">
                <button
                    type="button"
                    onClick={onBack}
                    className="press px-3.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    Cancel & Discard
                </button>

                <SaveButton saving={saving} justSaved={justSaved} onSave={onSave} />
            </div>
        </div>
    );
}

function SaveButton({
    saving,
    justSaved,
    onSave,
    compact = false,
}: {
    saving: boolean;
    justSaved: boolean;
    onSave: () => void;
    compact?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onSave}
            disabled={saving || justSaved}
            className={clsx(
                "press inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 shadow-md disabled:opacity-50 cursor-pointer",
                compact ? "px-4 py-2" : "px-5 py-2.5"
            )}
        >
            {saving ? (
                <Loader2 size={14} className="animate-spin" />
            ) : justSaved ? (
                <Check key="saved" size={14} className="animate-pop" />
            ) : (
                <Save size={14} />
            )}
            <span>{saving ? (compact ? "Saving..." : "Saving Changes...") : justSaved ? "Saved" : "Save to Firebase"}</span>
        </button>
    );
}
