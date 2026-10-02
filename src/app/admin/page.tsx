"use client";

import React, { useState, useEffect } from "react";
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
    orderBy,
    getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import Link from "next/link";
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
    Heart,
    SlidersHorizontal,
    Settings,
    Sparkles,
    UploadCloud,
    FolderKanban
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { clsx } from "clsx";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category?: string;
    tags: string[];
    createdAt: any;
    published?: boolean;
    featured?: boolean;
    views?: number;
    likes?: number;
}

interface StoredImage {
    name: string;
    url: string;
    fullPath: string;
}

const CATEGORIES = [
    "AI & Machine Learning",
    "Systems & Architecture",
    "Backend & Cloud",
    "Engineering Craft",
];

export default function AdminStudio() {
    const router = useRouter();
    const { addToast } = useToast();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<"articles" | "editor" | "media" | "config">("articles");

    // Articles State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Editor State
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: CATEGORIES[0],
        tags: [],
        published: true,
        featured: false,
    });
    const [tagInput, setTagInput] = useState("");
    const [saving, setSaving] = useState(false);

    // Media State
    const [images, setImages] = useState<StoredImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Site Config State
    const [siteConfig, setSiteConfig] = useState({
        siteTitle: "Keerthi Raajan | Engineering Journal",
        siteDescription: "Technical essays on distributed systems, AI integration, and architecture.",
        github: "https://github.com/keerthiraajan",
        linkedin: "https://linkedin.com/in/keerthiraajan",
        twitter: "",
    });
    const [savingConfig, setSavingConfig] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchPosts();
        fetchConfig();
    }, []);

    // Fetch Images when switching to media tab
    useEffect(() => {
        if (activeTab === "media" && images.length === 0) {
            fetchImages();
        }
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
            const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
            setPosts(fetched);
        } catch (error) {
            console.error("Error fetching posts:", error);
            addToast("Failed to load posts", "error");
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const docSnap = await getDoc(doc(db, "config", "site"));
            if (docSnap.exists()) {
                setSiteConfig((prev) => ({ ...prev, ...docSnap.data() }));
            }
        } catch (err) {
            console.error("Error fetching config:", err);
        }
    };

    const fetchImages = async () => {
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
        } catch (err) {
            console.warn("Storage list notice:", err);
        } finally {
            setLoadingImages(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    // Auto-generate slug from title
    const handleTitleChange = (val: string) => {
        const autoSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        setCurrentPost((prev) => ({
            ...prev,
            title: val,
            // Only auto-update slug if it was empty or matched a previous auto-generated pattern
            slug: prev.id ? prev.slug : autoSlug,
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
            content: "",
            category: CATEGORIES[0],
            tags: [],
            published: true,
            featured: false,
        });
        setTagInput("");
        setActiveTab("editor");
    };

    const handleEditPost = (post: BlogPost) => {
        setCurrentPost(post);
        setTagInput("");
        setActiveTab("editor");
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        try {
            await deleteDoc(doc(db, "blog", id));
            setPosts((prev) => prev.filter((p) => p.id !== id));
            addToast("Article deleted successfully", "success");
        } catch (err: any) {
            addToast("Failed to delete post: " + err.message, "error");
        }
    };

    const handleSavePost = async () => {
        if (!currentPost.title || !currentPost.slug || !currentPost.content) {
            addToast("Title, slug, and content are required", "error");
            return;
        }

        setSaving(true);
        try {
            const postPayload = {
                title: currentPost.title.trim(),
                slug: currentPost.slug.trim(),
                excerpt: currentPost.excerpt || "",
                content: currentPost.content,
                category: currentPost.category || CATEGORIES[0],
                tags: currentPost.tags || [],
                published: currentPost.published !== false,
                featured: Boolean(currentPost.featured),
                updatedAt: Timestamp.now(),
            };

            if (currentPost.id) {
                await setDoc(doc(db, "blog", currentPost.id), postPayload, { merge: true });
                addToast("Article updated!", "success");
            } else {
                await setDoc(doc(collection(db, "blog")), {
                    ...postPayload,
                    views: 0,
                    likes: 0,
                    createdAt: Timestamp.now(),
                });
                addToast("New article published!", "success");
            }

            fetchPosts();
            setActiveTab("articles");
        } catch (err: any) {
            console.error("Save error:", err);
            addToast("Failed to save post: " + err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // Client-side canvas compression for Firebase Storage upload
    const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            // Compress image on client canvas before upload (max 1600px, 82% quality)
            const compressedBlob = await new Promise<Blob>((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxDim = 1600;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => resolve(blob || file),
                        "image/webp",
                        0.82
                    );
                };
            });

            const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}.webp`;
            const fileRef = ref(storage, `media/${cleanFileName}`);

            await uploadBytes(fileRef, compressedBlob, {
                contentType: "image/webp",
                cacheControl: "public, max-age=31536000",
            });

            const downloadUrl = await getDownloadURL(fileRef);
            setImages((prev) => [{ name: cleanFileName, fullPath: `media/${cleanFileName}`, url: downloadUrl }, ...prev]);
            addToast("Image uploaded to Firebase Storage!", "success");
        } catch (err: any) {
            console.error("Upload error:", err);
            addToast("Failed to upload: " + err.message, "error");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteMedia = async (fullPath: string) => {
        if (!confirm("Delete this image from storage?")) return;
        try {
            await deleteObject(ref(storage, fullPath));
            setImages((prev) => prev.filter((img) => img.fullPath !== fullPath));
            addToast("Image deleted", "info");
        } catch (err: any) {
            addToast("Delete error: " + err.message, "error");
        }
    };

    const handleCopyMarkdown = (url: string, name: string) => {
        const snippet = `![${name}](${url})`;
        navigator.clipboard.writeText(snippet);
        setCopiedUrl(url);
        addToast("Markdown image code copied!", "success");
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await setDoc(doc(db, "config", "site"), siteConfig, { merge: true });
            addToast("Site configuration saved!", "success");
        } catch (err: any) {
            addToast("Error saving config: " + err.message, "error");
        } finally {
            setSavingConfig(false);
        }
    };

    const filteredPosts = posts.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-16">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary text-xs font-mono mb-1">
                        <Sparkles size={14} />
                        <span>Content Studio</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Admin Dashboard
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/30 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>View Live Blog</span>
                        <ExternalLink size={13} />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-xs text-rose-500 transition-colors"
                    >
                        <LogOut size={13} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="flex gap-2 border-b border-border/80 pb-3">
                <button
                    onClick={() => setActiveTab("articles")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                        activeTab === "articles"
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <FileText size={16} />
                    <span>Articles ({posts.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab("editor")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                        activeTab === "editor"
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Edit3 size={16} />
                    <span>{currentPost.id ? "Edit Post" : "Write Post"}</span>
                </button>

                <button
                    onClick={() => setActiveTab("media")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                        activeTab === "media"
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <ImageIcon size={16} />
                    <span>Media Storage</span>
                </button>

                <button
                    onClick={() => setActiveTab("config")}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors",
                        activeTab === "config"
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Settings size={16} />
                    <span>Site Settings</span>
                </button>
            </div>

            {/* TAB 1: ARTICLES LIST */}
            {activeTab === "articles" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-card border border-border/80 focus:border-primary/60 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} />
                            <span>New Article</span>
                        </button>
                    </div>

                    {loadingPosts ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl">
                            <p className="text-muted-foreground text-sm">No articles found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h3 className="font-bold text-base text-foreground truncate">{post.title}</h3>
                                            {!post.published && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Draft
                                                </span>
                                            )}
                                            {post.featured && (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-mono text-muted-foreground truncate">/{post.slug}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                            <span>{post.category}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} /> {post.views || 0}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Heart size={12} /> {post.likes || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                            title="View on site"
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleEditPost(post)}
                                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                            title="Edit article"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            title="Delete article"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: WRITING & EDITOR */}
            {activeTab === "editor" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border/80">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab("articles")}
                                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h2 className="text-xl font-bold text-foreground">
                                {currentPost.id ? "Edit Article" : "Compose New Article"}
                            </h2>
                        </div>

                        <button
                            onClick={handleSavePost}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>Save & Publish</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</label>
                            <input
                                type="text"
                                placeholder="Article Headline"
                                value={currentPost.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-card border border-border/80 focus:border-primary outline-none text-sm"
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL Slug</label>
                            <input
                                type="text"
                                placeholder="article-url-slug"
                                value={currentPost.slug}
                                onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-card border border-border/80 focus:border-primary outline-none font-mono text-xs text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Short Summary / Excerpt</label>
                        <textarea
                            placeholder="Brief summary appearing on homepage and SEO metadata..."
                            value={currentPost.excerpt || ""}
                            onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-card border border-border/80 focus:border-primary outline-none text-sm h-20 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                            <select
                                value={currentPost.category}
                                onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-card border border-border/80 focus:border-primary outline-none text-sm"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags Chip Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Tags (type & press Enter)
                            </label>
                            <div className="p-2 rounded-xl bg-card border border-border/80 min-h-[42px] flex flex-wrap items-center gap-1.5">
                                {currentPost.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-rose-500"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder="Add tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="bg-transparent text-xs outline-none flex-1 min-w-[100px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={currentPost.published !== false}
                                onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                                className="w-4 h-4 rounded text-primary focus:ring-0"
                            />
                            <span>Published (Publicly readable)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={Boolean(currentPost.featured)}
                                onChange={(e) => setCurrentPost({ ...currentPost, featured: e.target.checked })}
                                className="w-4 h-4 rounded text-primary focus:ring-0"
                            />
                            <span>Featured Deep-Dive</span>
                        </label>
                    </div>

                    {/* Markdown Editor */}
                    <div className="space-y-2 pt-2" data-color-mode="dark">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Content (Markdown + Raw HTML supported)
                            </label>
                            <span className="text-[11px] text-muted-foreground">
                                Supports `&lt;iframe&gt;`, `&lt;details&gt;`, code blocks, and markdown
                            </span>
                        </div>
                        <MDEditor
                            value={currentPost.content}
                            onChange={(val) => setCurrentPost({ ...currentPost, content: val || "" })}
                            height={520}
                            className="rounded-xl overflow-hidden border border-border/80"
                        />
                    </div>
                </div>
            )}

            {/* TAB 3: MEDIA & STORAGE */}
            {activeTab === "media" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/80">
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Firebase Media Storage</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Images are compressed client-side before upload to keep storage ultralight.
                            </p>
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
                            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                            <span>Upload Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadMedia}
                                disabled={uploadingImage}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {loadingImages ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl">
                            <p className="text-muted-foreground text-sm">No images in storage. Upload one above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.fullPath}
                                    className="p-2 rounded-xl bg-card border border-border/80 overflow-hidden flex flex-col justify-between group"
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary/50 relative mb-2">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-[11px] font-mono truncate text-muted-foreground mb-2" title={img.name}>
                                        {img.name}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
                                        <button
                                            onClick={() => handleCopyMarkdown(img.url, img.name)}
                                            className="flex-1 py-1 px-2 rounded-md bg-secondary/50 hover:bg-primary/10 hover:text-primary text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
                                            title="Copy markdown tag"
                                        >
                                            {copiedUrl === img.url ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            <span>Copy Code</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMedia(img.fullPath)}
                                            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10"
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: SITE CONFIG */}
            {activeTab === "config" && (
                <div className="max-w-2xl space-y-6">
                    <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-4">
                        <h3 className="font-bold text-lg text-foreground">Global Site Information</h3>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Site Title</label>
                            <input
                                type="text"
                                value={siteConfig.siteTitle}
                                onChange={(e) => setSiteConfig({ ...siteConfig, siteTitle: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-secondary/30 border border-border/80 text-sm focus:border-primary outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Description</label>
                            <textarea
                                value={siteConfig.siteDescription}
                                onChange={(e) => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-secondary/30 border border-border/80 text-sm focus:border-primary outline-none h-20 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GitHub URL</label>
                                <input
                                    type="text"
                                    value={siteConfig.github}
                                    onChange={(e) => setSiteConfig({ ...siteConfig, github: e.target.value })}
                                    className="w-full p-2.5 rounded-xl bg-secondary/30 border border-border/80 text-sm focus:border-primary outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={siteConfig.linkedin}
                                    onChange={(e) => setSiteConfig({ ...siteConfig, linkedin: e.target.value })}
                                    className="w-full p-2.5 rounded-xl bg-secondary/30 border border-border/80 text-sm focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSaveConfig}
                                disabled={savingConfig}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {savingConfig ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>Save Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
