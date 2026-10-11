"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createPreviewLink } from "@/app/admin/actions";
import { useToast } from "@/context/ToastContext";
import { ArticlesTab } from "./studio/ArticlesTab";
import { EditorTab } from "./studio/editor/EditorTab";
import { ShareDialog } from "./studio/editor/ShareDialog";
import { MediaTab } from "./studio/MediaTab";
import { SettingsTab } from "./studio/SettingsTab";
import { usePosts } from "./studio/hooks/usePosts";
import { usePostDraft } from "./studio/hooks/usePostDraft";
import { useSlugCheck } from "./studio/hooks/useSlugCheck";
import { useStudioActions } from "./studio/hooks/useStudioActions";
import { newArticleId, type Revision, type SaveIntent } from "./studio/posts-client";
import { emptyPost, type DraftPost, type StudioTab } from "./studio/types";
import type { BlogPost } from "@/types/blog";

const AUTOSAVE_MS = 30_000;

export default function AdminStudio() {
    const router = useRouter();
    const { addToast } = useToast();
    const [shareOpen, setShareOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<StudioTab>("articles");
    const [manualSlug, setManualSlug] = useState(false);
    /** Names the image folder of an article that has not been saved yet; the first save uses it as the article's id. */
    const [newId, setNewId] = useState(newArticleId);
    /** An action that was blocked by unsaved changes, waiting for the writer's decision. */
    const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);

    const { posts, trashed, loading, loadedAt, removingIds, fetchPosts, removePost } = usePosts();
    const { saving, persist, trash, restore, deleteForever, refreshPublicSite } = useStudioActions({
        posts,
        fetchPosts,
        removePost,
    });
    const draft = usePostDraft();
    const { post, stored, dirty, markSaved } = draft;
    const articleId = post.id ?? newId;

    const slugStatus = useSlugCheck((post.slug ?? "").trim(), post.id, (post.slug ?? "").trim() !== stored.slug);
    const inEditor = activeTab === "editor";

    /** Runs `action` now, or after the writer decides what to do with unsaved edits. */
    const guarded = useCallback(
        (action: () => void) => {
            if (inEditor && dirty) setPendingLeave(() => action);
            else action();
        },
        [inEditor, dirty]
    );

    const save = useCallback(
        async (intent: SaveIntent): Promise<DraftPost | null> => {
            const previousId = post.id;
            const saved = await persist(post, intent, stored, { newId });
            if (saved) markSaved(saved, previousId);
            return saved;
        },
        [persist, post, stored, markSaved, newId]
    );

    /** The stored id of the current draft, saving it first when there are unsaved edits. */
    const ensureSavedId = useCallback(async (): Promise<string | null> => {
        if (post.id && !dirty) return post.id;
        return (await save("draft"))?.id ?? null;
    }, [post.id, dirty, save]);

    const handlePreview = async () => {
        // Opened synchronously so the browser treats it as a direct result of the click
        const tab = window.open("", "_blank");
        try {
            const id = await ensureSavedId();
            const token = await auth.currentUser?.getIdToken();
            if (!id || !token) throw new Error("not saved");
            const { path } = await createPreviewLink(token, id, { kind: "self" });
            if (tab) {
                tab.opener = null;
                tab.location.href = path;
            } else {
                window.open(path, "_blank", "noopener");
            }
        } catch {
            tab?.close();
            addToast("Could not open the preview. Save the draft and try again.", "error");
        }
    };

    const handleShare = async () => {
        if (await ensureSavedId()) setShareOpen(true);
    };

    // Autosave drafts to Firestore while writing. Live articles only change on an explicit Update.
    const autosave = useRef<() => void>(() => {});
    useEffect(() => {
        autosave.current = async () => {
            if (!inEditor || !dirty || post.published === true || slugStatus === "taken") return;
            if (!post.title?.trim() || !post.slug?.trim()) return;
            const previousId = post.id;
            const saved = await persist(post, "draft", stored, { silent: true, newId });
            if (saved) markSaved(saved, previousId);
        };
    });
    useEffect(() => {
        if (!inEditor) return;
        const timer = setInterval(() => autosave.current(), AUTOSAVE_MS);
        return () => clearInterval(timer);
    }, [inEditor]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch {
            // ignore
        }
        router.push("/admin/login");
    };

    const handleCreateNew = () => {
        setNewId(newArticleId());
        draft.load(emptyPost());
        setManualSlug(false);
        setActiveTab("editor");
    };

    const handleEditPost = (existing: BlogPost) => {
        draft.load(existing);
        // Published articles keep their address; the slug field is locked until deliberately unlocked
        setManualSlug(true);
        setActiveTab("editor");
    };

    /** Puts an older version's text into the editor; it stays unsaved until the writer saves. */
    const handleRestoreRevision = (revision: Revision) => {
        draft.setPost((prev) => ({
            ...prev,
            title: revision.title,
            excerpt: revision.excerpt,
            content: revision.content,
            coverImage: revision.coverImage,
            category: revision.category,
            tags: revision.tags,
        }));
        addToast("Version loaded. Save to keep it.", "info");
    };

    const handleTrash = async (target: BlogPost) => {
        await trash(target);
        if (post.id === target.id) {
            setNewId(newArticleId());
            draft.load(emptyPost());
        }
    };

    const tabs: { id: StudioTab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: "articles", label: "Articles", icon: <FileText size={14} />, badge: posts.length },
        {
            id: "editor",
            label: post.id ? "Edit Article" : "Write Article",
            icon: <Edit3 size={14} />,
        },
        { id: "media", label: "Media", icon: <ImageIcon size={14} /> },
        { id: "settings", label: "Settings", icon: <Settings size={14} /> },
    ];

    const closePrompt = () => setPendingLeave(null);

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
                        onClick={() => guarded(handleLogout)}
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
                                onClick={() => guarded(() => setActiveTab(tab.id))}
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
                    trashed={trashed}
                    loadedAt={loadedAt}
                    onTrash={handleTrash}
                    onRestore={(id) => void restore(id, false)}
                    onDeleteForever={(id) => void deleteForever(id)}
                />
            )}

            {activeTab === "editor" && (
                <EditorTab
                    post={post}
                    setPost={draft.setPost}
                    manualSlug={manualSlug}
                    setManualSlug={setManualSlug}
                    posts={posts}
                    dirty={dirty}
                    saving={saving}
                    savedAt={draft.savedAt}
                    slugLocked={stored.wasPublic}
                    slugStatus={slugStatus}
                    articleId={articleId}
                    hasBackup={draft.restorable !== null}
                    onRestore={draft.restore}
                    onDismissBackup={draft.dismissRestore}
                    onSave={save}
                    onBack={() => guarded(() => setActiveTab("articles"))}
                    onPreview={handlePreview}
                    onShare={handleShare}
                    onRestoreRevision={handleRestoreRevision}
                />
            )}

            {activeTab === "media" && <MediaTab posts={posts} />}

            <ShareDialog open={shareOpen} postId={post.id} onClose={() => setShareOpen(false)} />

            {activeTab === "settings" && (
                <SettingsTab postCount={posts.length} onSaved={() => refreshPublicSite("config")} />
            )}

            <ConfirmDialog
                open={pendingLeave !== null}
                title="You have unsaved changes"
                description="Leaving now will lose them. You can save first, or keep editing."
                onClose={closePrompt}
                actions={[
                    { label: "Keep editing", onClick: closePrompt },
                    {
                        label: "Discard changes",
                        tone: "danger",
                        onClick: () => {
                            const proceed = pendingLeave;
                            draft.discard();
                            closePrompt();
                            proceed?.();
                        },
                    },
                    {
                        label: post.published === true ? "Update & leave" : "Save draft & leave",
                        tone: "primary",
                        onClick: async () => {
                            const proceed = pendingLeave;
                            closePrompt();
                            const saved = await save(post.published === true ? "update" : "draft");
                            if (saved) proceed?.();
                        },
                    },
                ]}
            />
        </div>
    );
}
