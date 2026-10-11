"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Edit3,
    Eye,
    FileText,
    Layers,
    PenLine,
    Plus,
    RotateCcw,
    Search,
    Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { CollapseRow } from "@/components/ui/CollapseRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { TRASH_RETENTION_DAYS } from "./posts-client";
import { CATEGORIES } from "./types";
import type { BlogPost } from "@/types/blog";

type StatusFilter = "all" | "published" | "drafts" | "trash";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "drafts", label: "Drafts" },
    { id: "trash", label: "Trash" },
];

/** Last edit time in seconds, falling back to creation time for older posts. */
const editedAt = (post: BlogPost) => post.updatedAt?.seconds ?? post.createdAt?.seconds ?? 0;

function timeAgo(seconds: number): string {
    if (!seconds) return "recently";
    const minutes = Math.max(0, Math.round((Date.now() / 1000 - seconds) / 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    return days < 30 ? `${days} d ago` : new Date(seconds * 1000).toLocaleDateString();
}

interface Props {
    posts: BlogPost[];
    loading: boolean;
    removingIds: string[];
    onCreate: () => void;
    onEdit: (post: BlogPost) => void;
    /** Trashed articles, shown under the Trash filter. */
    trashed: BlogPost[];
    onTrash: (post: BlogPost) => void;
    /** When the list was loaded (epoch seconds); used to count down the trash retention. */
    loadedAt: number;
    /** Brings an article back from the trash as a draft. */
    onRestore: (id: string) => void;
    onDeleteForever: (id: string) => void;
}

export function ArticlesTab({
    posts,
    loading,
    removingIds,
    onCreate,
    onEdit,
    trashed,
    onTrash,
    loadedAt,
    onRestore,
    onDeleteForever,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [confirmForeverId, setConfirmForeverId] = useState<string | null>(null);

    const stats = {
        total: posts.length,
        published: posts.filter((p) => p.published !== false).length,
        drafts: posts.filter((p) => p.published === false).length,
        likes: posts.reduce((acc, p) => acc + (p.likes || 0), 0),
    };

    const needle = searchQuery.toLowerCase();
    const inTrash = statusFilter === "trash";

    const filteredPosts = (inTrash ? trashed : posts)
        .filter((p) => {
            const isDraft = p.published === false;
            if (statusFilter === "drafts" && !isDraft) return false;
            if (statusFilter === "published" && isDraft) return false;

            const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
            const matchesSearch =
                p.title.toLowerCase().includes(needle) ||
                (p.excerpt || "").toLowerCase().includes(needle) ||
                p.tags?.some((t) => t.toLowerCase().includes(needle));
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => editedAt(b) - editedAt(a));

    // Jump back into work in progress, unless the writer is searching or filtering
    const filtering = searchQuery !== "" || categoryFilter !== "All" || statusFilter !== "all";
    const recentDrafts = filtering
        ? []
        : posts
              .filter((p) => p.published === false)
              .sort((a, b) => editedAt(b) - editedAt(a))
              .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div style={{ "--i": 0 } as React.CSSProperties} className="animate-fade-up stagger p-4 rounded-xl bg-card border border-border/80">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider">Total</span>
                        <Layers size={14} />
                    </div>
                    <div className="text-2xl font-bold font-mono text-foreground">{stats.total}</div>
                    <span className="text-[11px] text-muted-foreground">Articles in catalog</span>
                </div>

                <div style={{ "--i": 1 } as React.CSSProperties} className="animate-fade-up stagger p-4 rounded-xl bg-card border border-border/80">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider">Published</span>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{stats.published}</div>
                    <span className="text-[11px] text-muted-foreground">Live on publication</span>
                </div>

                <div style={{ "--i": 2 } as React.CSSProperties} className="animate-fade-up stagger p-4 rounded-xl bg-card border border-border/80">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider">Drafts</span>
                        <Edit3 size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-400">{stats.drafts}</div>
                    <span className="text-[11px] text-muted-foreground">Work in progress</span>
                </div>

                <div style={{ "--i": 3 } as React.CSSProperties} className="animate-fade-up stagger p-4 rounded-xl bg-card border border-border/80">
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider">Likes</span>
                        <BarChart3 size={14} className="text-primary" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-primary">{stats.likes.toLocaleString()}</div>
                    <span className="text-[11px] text-muted-foreground">Across all articles</span>
                </div>
            </div>

            {recentDrafts.length > 0 && (
                <section aria-label="Continue writing" className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Continue writing
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {recentDrafts.map((draft) => (
                            <button
                                key={draft.id}
                                type="button"
                                onClick={() => onEdit(draft)}
                                className="press group flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left hover:border-primary/50 cursor-pointer"
                            >
                                <PenLine size={15} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {draft.title || "Untitled draft"}
                                    </span>
                                    <span className="block text-[11px] font-mono text-muted-foreground">
                                        Edited {timeAgo(editedAt(draft))}
                                    </span>
                                </span>
                                <ArrowRight
                                    size={14}
                                    aria-hidden="true"
                                    className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                                />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles by title, tag, or topic..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-0.5 self-start md:self-auto">
                    {STATUS_FILTERS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={statusFilter === option.id}
                            onClick={() => setStatusFilter(option.id)}
                            className={clsx(
                                "press px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer",
                                statusFilter === option.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {option.label}
                            {option.id === "trash" && trashed.length > 0 && (
                                <span className="ml-1 font-mono opacity-70">{trashed.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {["All", ...CATEGORIES].map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategoryFilter(cat)}
                            className={clsx(
                                "press px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer",
                                categoryFilter === cat
                                    ? "bg-secondary text-primary font-semibold border border-primary/30"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles List / Cards */}
            {loading ? (
                <div className="space-y-3" role="status" aria-label="Loading articles">
                    {[0, 1, 2].map((row) => (
                        <div key={row} className="p-5 rounded-xl bg-card border border-border/80 space-y-3" aria-hidden="true">
                            <Skeleton className="h-4 w-24 rounded-full" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card/30 p-8">
                    <FileText size={36} className="mx-auto text-muted-foreground/40 mb-3" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">No articles found</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        {searchQuery ? "Try refining your search terms or filters." : "Start by writing your first article."}
                    </p>
                    <button
                        type="button"
                        onClick={onCreate}
                        className="press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>New Article</span>
                    </button>
                </div>
            ) : (
                <div>
                    {filteredPosts.map((post, index) => (
                        <CollapseRow
                            key={post.id}
                            index={index + 4}
                            leaving={removingIds.includes(post.id)}
                            className="p-4 sm:p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                        >
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={clsx(
                                            "px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase",
                                            post.published !== false
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        )}
                                    >
                                        {post.published !== false ? "Published" : "Draft"}
                                    </span>
                                    {post.category && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-secondary text-primary border border-border">
                                            {post.category}
                                        </span>
                                    )}
                                    {post.featured && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {post.title}
                                </h3>

                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {post.excerpt || "No excerpt provided."}
                                </p>

                                <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                                    <span>/{post.slug}</span>
                                    <span>•</span>
                                    {post.deletedAt ? (
                                        <span>
                                            Removed for good in{" "}
                                            {Math.max(
                                                0,
                                                Math.ceil(
                                                    TRASH_RETENTION_DAYS -
                                                        (loadedAt - post.deletedAt.seconds) / 86400
                                                )
                                            )}{" "}
                                            days
                                        </span>
                                    ) : (
                                        <>
                                            <span>{post.likes || 0} likes</span>
                                            <span>•</span>
                                            <span>
                                                {post.createdAt?.seconds
                                                    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                                                    : "Recent"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {post.deletedAt ? (
                                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onRestore(post.id)}
                                        className="press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground cursor-pointer"
                                    >
                                        <RotateCcw size={13} />
                                        <span>Restore</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmForeverId(post.id)}
                                        className="press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:border-red-500/30 bg-secondary/30 hover:bg-red-500/10 text-xs font-medium text-muted-foreground hover:text-red-400 cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                        <span>Delete forever</span>
                                    </button>
                                </div>
                            ) : (
                            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    target="_blank"
                                    className="press p-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground"
                                    title="View Public Post"
                                >
                                    <Eye size={14} />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => onEdit(post)}
                                    className="press inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground cursor-pointer"
                                >
                                    <Edit3 size={13} />
                                    <span>Edit</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onTrash(post)}
                                    className="press p-2 rounded-lg border border-border hover:border-red-500/30 bg-secondary/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 cursor-pointer"
                                    title="Move to trash"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            )}
                        </CollapseRow>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={confirmForeverId !== null}
                title="Delete this article forever?"
                description="This removes the article, its saved versions and the images uploaded for it. It cannot be undone."
                onClose={() => setConfirmForeverId(null)}
                actions={[
                    { label: "Cancel", onClick: () => setConfirmForeverId(null) },
                    {
                        label: "Delete forever",
                        tone: "danger",
                        onClick: () => {
                            if (confirmForeverId) onDeleteForever(confirmForeverId);
                            setConfirmForeverId(null);
                        },
                    },
                ]}
            />
        </div>
    );
}
