"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
    CheckCircle2,
    Database,
    Edit3,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    LogOut,
    Plus,
    Settings,
    Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { auth } from "@/lib/firebase";
import { useEmulator as isUsingEmulator } from "@/lib/firebase-config";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArticlesTab } from "./studio/ArticlesTab";
import { EditorTab } from "./studio/editor/EditorTab";
import { MediaTab } from "./studio/MediaTab";
import { SettingsTab } from "./studio/SettingsTab";
import { usePosts } from "./studio/hooks/usePosts";
import { useStudioActions } from "./studio/hooks/useStudioActions";
import { emptyPost, type DraftPost, type StudioTab } from "./studio/types";
import type { BlogPost } from "@/types/blog";

const SAVED_FLASH_MS = 520;

export default function AdminStudio() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<StudioTab>("articles");
    const [currentPost, setCurrentPost] = useState<DraftPost>(emptyPost);
    const [manualSlug, setManualSlug] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const { posts, loading, removingIds, fetchPosts, removePost } = usePosts();
    const { saving, savePost, deletePost } = useStudioActions({ posts, fetchPosts, removePost });

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch {
            // ignore
        }
        router.push("/admin/login");
    };

    const handleCreateNew = () => {
        setCurrentPost(emptyPost());
        setManualSlug(false);
        setActiveTab("editor");
    };

    const handleEditPost = (post: BlogPost) => {
        setCurrentPost(post);
        setManualSlug(true);
        setActiveTab("editor");
    };

    const handleSave = async () => {
        if (!(await savePost(currentPost))) return;
        setJustSaved(true);
        await new Promise((resolve) => setTimeout(resolve, SAVED_FLASH_MS));
        setActiveTab("articles");
        setJustSaved(false);
    };

    const tabs: { id: StudioTab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: "articles", label: "Articles", icon: <FileText size={14} />, badge: posts.length },
        {
            id: "editor",
            label: currentPost.id ? "Edit Article" : "Write Article",
            icon: <Edit3 size={14} />,
        },
        { id: "media", label: "Media", icon: <ImageIcon size={14} /> },
        { id: "settings", label: "Settings", icon: <Settings size={14} /> },
    ];

    return (
        <div className="space-y-6">
            {/* Top Navigation Bar */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                                Content Studio
                            </h1>
                            {isUsingEmulator ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-primary/10 border border-primary/30 text-primary">
                                    <Database size={11} />
                                    <span>Firebase Emulator</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                    <CheckCircle2 size={11} />
                                    <span>Firebase Live</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Author & Publication Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <Link
                        href="/"
                        target="_blank"
                        className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground"
                        title="View Public Publication"
                    >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">View Site</span>
                    </Link>

                    <ThemeToggle size="sm" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-secondary/30 hover:bg-red-500/10 text-xs font-medium text-muted-foreground hover:text-red-400 cursor-pointer"
                        title="Sign Out"
                    >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-2 overflow-x-auto">
                <nav className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "press flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer",
                                    active
                                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && (
                                    <span
                                        className={clsx(
                                            "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                                            active
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {activeTab === "articles" && (
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        className="press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 shadow-sm shrink-0 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>New Article</span>
                    </button>
                )}
            </div>

            {activeTab === "articles" && (
                <ArticlesTab
                    posts={posts}
                    loading={loading}
                    removingIds={removingIds}
                    onCreate={handleCreateNew}
                    onEdit={handleEditPost}
                    onDelete={deletePost}
                />
            )}

            {activeTab === "editor" && (
                <EditorTab
                    post={currentPost}
                    setPost={setCurrentPost}
                    manualSlug={manualSlug}
                    setManualSlug={setManualSlug}
                    posts={posts}
                    saving={saving}
                    justSaved={justSaved}
                    onSave={handleSave}
                    onBack={() => setActiveTab("articles")}
                />
            )}

            {activeTab === "media" && <MediaTab />}

            {activeTab === "settings" && <SettingsTab postCount={posts.length} />}
        </div>
    );
}
