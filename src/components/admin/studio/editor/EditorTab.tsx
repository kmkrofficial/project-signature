"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Check, EyeOff, Loader2, RotateCcw, Save, Send, Upload } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { estimateReadingTime } from "@/lib/format";
import { MetadataPanel } from "./MetadataPanel";
import type { SlugStatus } from "../hooks/useSlugCheck";
import type { SaveIntent } from "../posts-client";
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
    dirty: boolean;
    saving: boolean;
    savedAt: Date | null;
    slugLocked: boolean;
    slugStatus: SlugStatus;
    /** Unsaved edits from an earlier session, waiting for a decision. */
    hasBackup: boolean;
    onRestore: () => void;
    onDismissBackup: () => void;
    onSave: (intent: SaveIntent) => void;
    onBack: () => void;
}

export function EditorTab({
    post,
    setPost,
    manualSlug,
    setManualSlug,
    posts,
    dirty,
    saving,
    savedAt,
    slugLocked,
    slugStatus,
    hasBackup,
    onRestore,
    onDismissBackup,
    onSave,
    onBack,
}: Props) {
    const { addToast } = useToast();
    const { theme } = useTheme();

    const isLive = post.published === true;
    const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;
    const readingTime = estimateReadingTime(post.content || "");

    const otherFeaturedCount = posts.filter((p) => p.featured && p.id !== post.id).length;
    const isAtLimit = otherFeaturedCount >= MAX_SPOTLIGHT && !post.featured;

    // Ctrl/Cmd+S saves, Ctrl/Cmd+Shift+P publishes
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            const key = event.key.toLowerCase();
            if (key === "s" && !event.shiftKey) {
                event.preventDefault();
                onSave(isLive ? "update" : "draft");
            } else if (key === "p" && event.shiftKey && !isLive) {
                event.preventDefault();
                onSave("publish");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isLive, onSave]);

    const status = saving ? (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Loader2 size={11} className="animate-spin" /> Saving…
        </span>
    ) : dirty ? (
        <span className="inline-flex items-center gap-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" /> Unsaved changes
        </span>
    ) : savedAt ? (
        <span className="inline-flex items-center gap-1 text-emerald-400">
            <Check size={11} /> Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
    ) : null;

    const actions = (
        <ActionButtons isLive={isLive} dirty={dirty} saving={saving} isNew={!post.id} onSave={onSave} />
    );

    return (
        <div className="animate-fade-up space-y-6">
            {hasBackup && (
                <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <p className="text-xs text-foreground">
                        <strong>Unsaved changes were found</strong> from an earlier session on this device.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onRestore}
                            className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
                        >
                            <RotateCcw size={12} /> Restore
                        </button>
                        <button
                            type="button"
                            onClick={onDismissBackup}
                            className="press px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Header Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/80">
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
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground">
                                {post.id ? "Edit Article" : "Write New Article"}
                            </h2>
                            <span
                                className={clsx(
                                    "px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase border",
                                    isLive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}
                            >
                                {isLive ? "Published" : "Draft"}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-mono text-muted-foreground">
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{readingTime} min read</span>
                            {status && (
                                <>
                                    <span>•</span>
                                    {status}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 self-stretch lg:self-auto justify-end">
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

                    {actions}
                </div>
            </div>

            <MetadataPanel
                post={post}
                setPost={setPost}
                manualSlug={manualSlug}
                setManualSlug={setManualSlug}
                slugLocked={slugLocked}
                slugStatus={slugStatus}
            />

            {/* Markdown Canvas Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span className="font-semibold uppercase tracking-wider">Markdown & Raw HTML Canvas</span>
                    <span className="font-mono text-[11px]">Ctrl+S to save · Ctrl+Shift+P to publish</span>
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
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/80">
                <button
                    type="button"
                    onClick={onBack}
                    className="press px-3.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    Back to articles
                </button>

                {actions}
            </div>
        </div>
    );
}

function ActionButtons({
    isLive,
    dirty,
    saving,
    isNew,
    onSave,
}: {
    isLive: boolean;
    dirty: boolean;
    saving: boolean;
    isNew: boolean;
    onSave: (intent: SaveIntent) => void;
}) {
    const secondary =
        "press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs font-semibold text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
    const primary =
        "press inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    if (isLive) {
        return (
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => onSave("unpublish")} disabled={saving} className={secondary}>
                    <EyeOff size={14} />
                    <span>Unpublish</span>
                </button>
                <button
                    type="button"
                    onClick={() => onSave("update")}
                    disabled={saving || !dirty}
                    title={dirty ? "Save changes to the live article (Ctrl+S)" : "No changes to save"}
                    className={primary}
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span>Update</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onSave("draft")}
                disabled={saving || (!dirty && !isNew)}
                title={dirty || isNew ? "Save as a draft (Ctrl+S)" : "No changes to save"}
                className={secondary}
            >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save draft</span>
            </button>
            <button
                type="button"
                onClick={() => onSave("publish")}
                disabled={saving}
                title="Make this article live (Ctrl+Shift+P)"
                className={primary}
            >
                <Send size={14} />
                <span>Publish</span>
            </button>
        </div>
    );
}
