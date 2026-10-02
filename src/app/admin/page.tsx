"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { auth, db, storage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    Timestamp,
    orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import Link from "next/link";
import NextImage from "next/image";
import {
    FileText,
    Plus,
    LogOut,
    ArrowLeft,
    Edit3,
    Trash2,
    Save,
    X,
    Image as ImageIcon,
    Copy,
    Check,
    Loader2,
    ExternalLink,
    Search,
    Eye,
    Settings,
    Sparkles,
    UploadCloud,
    BarChart3,
    Layers,
    CheckCircle2,
    Database
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { clsx } from "clsx";
import type { BlogPost } from "@/types/blog";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface StoredImage {
    name: string;
    url: string;
    fullPath?: string;
    size?: string;
}

const CATEGORIES = [
    "Artificial Intelligence",
    "Web & Software",
    "Cloud & Data",
    "Guides & Tips",
];

export default function AdminStudio() {
    const router = useRouter();
    const { addToast } = useToast();
    const { theme } = useTheme();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<"articles" | "editor" | "media" | "settings">("articles");

    // Articles State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Editor State
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
        title: "",
        slug: "",
        excerpt: "",
        coverImage: "",
        content: "",
        category: CATEGORIES[0],
        tags: [],
        published: true,
        featured: false,
    });
    const [tagInput, setTagInput] = useState("");
    const [manualSlug, setManualSlug] = useState(false);
    const [saving, setSaving] = useState(false);

    // Media State
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const isUsingEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

    // Stats
    const stats = {
        total: posts.length,
        published: posts.filter((p) => p.published !== false).length,
        drafts: posts.filter((p) => p.published === false).length,
        views: posts.reduce((acc, p) => acc + (p.views || 0), 0),
    };

    // Calculate word count & reading time
    const wordCount = currentPost.content ? currentPost.content.trim().split(/\s+/).filter(Boolean).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true);
        try {
            const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
            setPosts(fetched);
        } catch (error: unknown) {
            console.error("Firestore query error:", error);
            addToast("Failed to load articles from Firestore", "error");
        } finally {
            setLoadingPosts(false);
        }
    }, [addToast]);

    const fetchImages = useCallback(async () => {
        setLoadingImages(true);
        try {
            const listRef = ref(storage, "media");
            const res = await listAll(listRef);
            const urls = await Promise.all(
                res.items.map(async (itemRef) => ({
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    url: await getDownloadURL(itemRef),
                }))
            );
            setImages(urls);
        } catch (err: unknown) {
            console.warn("Storage list notice:", err);
        } finally {
            setLoadingImages(false);
        }
    }, []);

    // Load initial data from Firebase
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Load media when tab activated
    useEffect(() => {
        if (activeTab === "media") {
            fetchImages();
        }
    }, [activeTab, fetchImages]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch {
            // ignore
        }
        if (typeof window !== "undefined") {
            localStorage.removeItem("admin_last_accessed");
        }
        router.push("/admin/login");
    };

    // Auto-generate slug from title unless manual override
    const handleTitleChange = (val: string) => {
        const autoSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        setCurrentPost((prev) => ({
            ...prev,
            title: val,
            slug: manualSlug ? prev.slug : autoSlug,
        }));
    };

    // Tag Chip Handlers
    const handleAddTag = (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const clean = tagInput.trim().replace(/^#|,/g, "");
            if (!currentPost.tags?.includes(clean)) {
                setCurrentPost((prev) => ({ ...prev, tags: [...(prev.tags || []), clean] }));
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setCurrentPost((prev) => ({
            ...prev,
            tags: prev.tags?.filter((t) => t !== tagToRemove) || [],
        }));
    };

    const handleCreateNew = () => {
        setCurrentPost({
            title: "",
            slug: "",
            excerpt: "",
            coverImage: "",
            content: "",
            category: CATEGORIES[0],
            tags: [],
            published: true,
            featured: false,
        });
        setTagInput("");
        setManualSlug(false);
        setActiveTab("editor");
    };

    const handleEditPost = (post: BlogPost) => {
        setCurrentPost(post);
        setTagInput("");
        setManualSlug(true);
        setActiveTab("editor");
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            await deleteDoc(doc(db, "blog", id));
            setPosts((prev) => prev.filter((p) => p.id !== id));
            addToast("Article deleted successfully", "success");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Delete error:", msg);
            addToast("Failed to delete article: " + msg, "error");
        }
    };

    const handleSavePost = async () => {
        if (!currentPost.title || !currentPost.slug || !currentPost.content) {
            addToast("Title, slug, and content are required", "error");
            return;
        }

        setSaving(true);
        const postPayload = {
            title: currentPost.title.trim(),
            slug: currentPost.slug.trim(),
            excerpt: currentPost.excerpt || "",
            coverImage: currentPost.coverImage || "",
            content: currentPost.content,
            category: currentPost.category || CATEGORIES[0],
            tags: currentPost.tags || [],
            published: currentPost.published !== false,
            featured: Boolean(currentPost.featured),
            views: currentPost.views || 0,
            likes: currentPost.likes || 0,
            updatedAt: Timestamp.now(),
        };

        try {
            if (currentPost.id) {
                await setDoc(doc(db, "blog", currentPost.id), postPayload, { merge: true });
                addToast("Article updated successfully!", "success");
            } else {
                const newDocRef = doc(collection(db, "blog"));
                await setDoc(newDocRef, {
                    ...postPayload,
                    id: newDocRef.id,
                    createdAt: Timestamp.now(),
                });
                addToast("New article published successfully!", "success");
            }

            await fetchPosts();
            setActiveTab("articles");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Save error:", msg);
            addToast("Failed to save article: " + msg, "error");
        } finally {
            setSaving(false);
        }
    };

    // Client-side canvas compression for media uploads to Firebase Storage
    const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            // Compress image on client canvas before upload (max 1600px, 82% quality)
            const compressedBlob: Blob = await new Promise((resolve) => {
                const img = new window.Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let { width, height } = img;
                    const MAX_SIZE = 1600;
                    if (width > MAX_SIZE || height > MAX_SIZE) {
                        if (width > height) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        } else {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (b) => resolve(b || file),
                        file.type === "image/png" ? "image/png" : "image/webp",
                        0.82
                    );
                };
            });

            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storagePath = `media/${Date.now()}_${cleanName}`;
            const fileRef = ref(storage, storagePath);

            await uploadBytes(fileRef, compressedBlob);
            const downloadUrl = await getDownloadURL(fileRef);

            const newImg: StoredImage = {
                name: file.name,
                url: downloadUrl,
                fullPath: storagePath,
                size: (compressedBlob.size / 1024).toFixed(1) + " KB",
            };

            setImages((prev) => [newImg, ...prev]);
            addToast("Media uploaded to Firebase Storage!", "success");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("Upload error:", msg);
            addToast("Failed to upload image: " + msg, "error");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCopyMarkdownSnippet = (url: string, name: string) => {
        const snippet = `![${name.replace(/\.[^/.]+$/, "")}](${url})`;
        navigator.clipboard.writeText(snippet);
        setCopiedUrl(url);
        addToast("Markdown image code copied to clipboard!", "success");
        setTimeout(() => setCopiedUrl(null), 2500);
    };

    const filteredPosts = posts.filter((p) => {
        const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

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
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Author & Publication Dashboard
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        title="View Public Publication"
                    >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">View Site</span>
                    </Link>

                    <ThemeToggle size="sm" />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-red-500/30 bg-secondary/30 hover:bg-red-500/10 text-xs font-medium text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
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
                    <button
                        type="button"
                        onClick={() => setActiveTab("articles")}
                        className={clsx(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                            activeTab === "articles"
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <FileText size={14} />
                        <span>Articles</span>
                        <span
                            className={clsx(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                                activeTab === "articles"
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-secondary text-muted-foreground"
                            )}
                        >
                            {posts.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("editor")}
                        className={clsx(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                            activeTab === "editor"
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <Edit3 size={14} />
                        <span>{currentPost.id ? "Edit Article" : "Write Article"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("media")}
                        className={clsx(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                            activeTab === "media"
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <ImageIcon size={14} />
                        <span>Media</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("settings")}
                        className={clsx(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
                            activeTab === "settings"
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <Settings size={14} />
                        <span>Settings</span>
                    </button>
                </nav>

                {activeTab === "articles" && (
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>New Article</span>
                    </button>
                )}
            </div>

            {/* TAB 1: ARTICLES LIST */}
            {activeTab === "articles" && (
                <div className="space-y-6">
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 rounded-xl bg-card border border-border/80">
                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                <span className="text-xs font-mono uppercase tracking-wider">Total</span>
                                <Layers size={14} />
                            </div>
                            <div className="text-2xl font-bold font-mono text-foreground">{stats.total}</div>
                            <span className="text-[11px] text-muted-foreground">Articles in catalog</span>
                        </div>

                        <div className="p-4 rounded-xl bg-card border border-border/80">
                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                <span className="text-xs font-mono uppercase tracking-wider">Published</span>
                                <CheckCircle2 size={14} className="text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold font-mono text-emerald-400">{stats.published}</div>
                            <span className="text-[11px] text-muted-foreground">Live on publication</span>
                        </div>

                        <div className="p-4 rounded-xl bg-card border border-border/80">
                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                <span className="text-xs font-mono uppercase tracking-wider">Drafts</span>
                                <Edit3 size={14} className="text-amber-400" />
                            </div>
                            <div className="text-2xl font-bold font-mono text-amber-400">{stats.drafts}</div>
                            <span className="text-[11px] text-muted-foreground">Work in progress</span>
                        </div>

                        <div className="p-4 rounded-xl bg-card border border-border/80">
                            <div className="flex items-center justify-between text-muted-foreground mb-2">
                                <span className="text-xs font-mono uppercase tracking-wider">Reads</span>
                                <BarChart3 size={14} className="text-primary" />
                            </div>
                            <div className="text-2xl font-bold font-mono text-primary">{stats.views.toLocaleString()}</div>
                            <span className="text-[11px] text-muted-foreground">Total impressions</span>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80">
                        {/* Search Input */}
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

                        {/* Category Selector Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                            {["All", ...CATEGORIES].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategoryFilter(cat)}
                                    className={clsx(
                                        "px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer",
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
                    {loadingPosts ? (
                        <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-3">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <p className="text-xs font-mono">Loading articles from Firestore...</p>
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
                                onClick={handleCreateNew}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>New Article</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-4 sm:p-5 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
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
                                            <span>{post.views || 0} views</span>
                                            <span>•</span>
                                            <span>
                                                {post.createdAt?.seconds
                                                    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                                                    : "Recent"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="p-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                            title="View Public Post"
                                        >
                                            <Eye size={14} />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleEditPost(post)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground transition-all cursor-pointer"
                                        >
                                            <Edit3 size={13} />
                                            <span>Edit</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeletePost(post.id)}
                                            className="p-2 rounded-lg border border-border hover:border-red-500/30 bg-secondary/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                                            title="Delete Article"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: WRITING STUDIO / EDITOR */}
            {activeTab === "editor" && (
                <div className="space-y-6">
                    {/* Editor Header Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/80">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab("articles")}
                                className="p-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Back to Articles"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <h2 className="text-sm font-bold text-foreground">
                                    {currentPost.id ? "Edit Article" : "Write New Article"}
                                </h2>
                                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                                    <span>{wordCount} words</span>
                                    <span>•</span>
                                    <span>{readingTime} min read</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-end">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={Boolean(currentPost.featured)}
                                    onChange={(e) =>
                                        setCurrentPost((prev) => ({ ...prev, featured: e.target.checked }))
                                    }
                                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <span className={currentPost.featured ? "text-primary font-medium" : ""}>
                                    Spotlight Story
                                </span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={currentPost.published !== false}
                                    onChange={(e) =>
                                        setCurrentPost((prev) => ({ ...prev, published: e.target.checked }))
                                    }
                                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <span className={currentPost.published !== false ? "text-emerald-400 font-medium" : ""}>
                                    {currentPost.published !== false ? "Publish Live" : "Keep as Draft"}
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleSavePost}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                <span>{saving ? "Saving..." : "Save to Firebase"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Metadata Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-5 rounded-xl border border-border/80">
                        {/* Title */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Article Title *
                            </label>
                            <input
                                type="text"
                                value={currentPost.title || ""}
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
                                    value={currentPost.slug || ""}
                                    readOnly={!manualSlug}
                                    onChange={(e) =>
                                        setCurrentPost((prev) => ({
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
                                value={currentPost.category || CATEGORIES[0]}
                                onChange={(e) => setCurrentPost((prev) => ({ ...prev, category: e.target.value }))}
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
                                value={currentPost.excerpt || ""}
                                onChange={(e) => setCurrentPost((prev) => ({ ...prev, excerpt: e.target.value }))}
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
                                {currentPost.tags?.map((t) => (
                                    <span
                                        key={t}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-secondary text-primary border border-border"
                                    >
                                        #{t}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(t)}
                                            className="hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
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
                                    placeholder={currentPost.tags?.length ? "Add another tag..." : "e.g. Nextjs, QUIC, Caching"}
                                    className="flex-1 min-w-[140px] px-2 py-1 bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-1.5 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Cover Image URL (Editorial Spotlight Hero)
                                </label>
                                <span className="text-[11px] text-muted-foreground/70 font-mono">
                                    Optional • Generates dynamic abstract gradient if empty
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="url"
                                    value={currentPost.coverImage || ""}
                                    onChange={(e) => setCurrentPost((prev) => ({ ...prev, coverImage: e.target.value }))}
                                    placeholder="https://images.unsplash.com/... or paste image URL"
                                    className="flex-1 px-3.5 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                                />
                                {currentPost.coverImage && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPost((prev) => ({ ...prev, coverImage: "" }))}
                                        className="px-2.5 py-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                                        title="Clear Image"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {currentPost.coverImage && (
                                <div className="mt-2 relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-border/80 bg-secondary/20">
                                    <NextImage
                                        src={currentPost.coverImage}
                                        alt="Cover preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <span className="absolute bottom-2 right-2 text-[10px] bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-foreground font-mono">
                                        Preview
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Markdown Canvas Editor */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span className="font-semibold uppercase tracking-wider">Markdown & Raw HTML Canvas</span>
                            <span className="font-mono text-[11px]">Supports raw &lt;details&gt;, &lt;iframe&gt;, and GitHub Markdown</span>
                        </div>
                        <div data-color-mode={theme === "light" ? "light" : "dark"} className="rounded-xl overflow-hidden border border-border/80">
                            <MDEditor
                                value={currentPost.content || ""}
                                onChange={(val) => setCurrentPost((prev) => ({ ...prev, content: val || "" }))}
                                height={520}
                                preview="live"
                            />
                        </div>
                    </div>

                    {/* Bottom Sticky Action Bar */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab("articles")}
                            className="px-3.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancel & Discard
                        </button>

                        <button
                            type="button"
                            onClick={handleSavePost}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            <span>{saving ? "Saving Changes..." : "Save to Firebase"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 3: MEDIA ASSETS */}
            {activeTab === "media" && (
                <div className="space-y-6">
                    {/* Media Upload Banner */}
                    <div className="p-6 rounded-2xl bg-card border border-dashed border-border/80 text-center hover:border-primary/50 transition-colors">
                        <UploadCloud size={32} className="mx-auto text-primary mb-3" />
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                            Upload Media to Publication Bucket
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                            Images are automatically pre-compressed via client canvas (max 1600px, 82% WebP) before upload to conserve bandwidth.
                        </p>

                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md">
                            {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            <span>{uploadingImage ? "Compressing & Uploading..." : "Select Image from Disk"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadMedia}
                                disabled={uploadingImage}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Images Grid */}
                    {loadingImages ? (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <p className="text-xs font-mono">Loading media assets from Firebase Storage...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                            No uploaded media yet. Upload diagrams, architecture schematics, or post covers above.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-all flex flex-col justify-between"
                                >
                                    <div className="h-44 w-full bg-secondary/50 relative overflow-hidden flex items-center justify-center">
                                        <NextImage
                                            src={img.url}
                                            alt={img.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {img.size && (
                                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white backdrop-blur-sm">
                                                {img.size}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3.5 space-y-2">
                                        <p className="text-xs font-medium text-foreground truncate" title={img.name}>
                                            {img.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyMarkdownSnippet(img.url, img.name)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground transition-all cursor-pointer"
                                        >
                                            {copiedUrl === img.url ? (
                                                <>
                                                    <Check size={13} className="text-emerald-400" />
                                                    <span>Copied Snippet!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={13} />
                                                    <span>Copy Markdown Snippet</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: SETTINGS & DIAGNOSTICS */}
            {activeTab === "settings" && (
                <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
                        <div className="flex items-center gap-2.5 text-foreground font-semibold text-sm">
                            <Database size={16} className="text-primary" />
                            <span>Backend & Environment Details</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Overview of current runtime environment, authentication, and Firestore connectivity.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                                <span className="text-muted-foreground">Backend:</span>
                                <span className={isUsingEmulator ? "text-primary font-bold" : "text-emerald-400 font-bold"}>
                                    {isUsingEmulator ? "Firebase Emulator Suite" : "Firebase Cloud"}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                                <span className="text-muted-foreground">Admin Account:</span>
                                <span className="text-foreground">{auth.currentUser?.email || "Authenticated"}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                                <span className="text-muted-foreground">Articles in Firestore:</span>
                                <span className="text-foreground">{posts.length} articles</span>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between">
                                <span className="text-muted-foreground">Emulator UI:</span>
                                {isUsingEmulator ? (
                                    <a
                                        href="http://127.0.0.1:4000"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>localhost:4000</span>
                                        <ExternalLink size={11} />
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
