"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/Toast";
import Link from "next/link";

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        tags: "",
        published: false,
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "blog"));
            const postsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        } catch (error) {
            showError("Failed to load blog posts");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            showError("Title is required");
            return;
        }
        if (!formData.slug.trim()) {
            showError("Slug is required");
            return;
        }
        if (!formData.excerpt.trim()) {
            showError("Excerpt is required");
            return;
        }

        try {
            setLoading(true);
            const postData = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content: formData.content,
                tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
                published: formData.published,
                updatedAt: Timestamp.now(),
            };

            if (editingId) {
                await updateDoc(doc(db, "blog", editingId), postData);
                showSuccess("Blog post updated successfully");
            } else {
                await addDoc(collection(db, "blog"), {
                    ...postData,
                    createdAt: Timestamp.now(),
                });
                showSuccess("Blog post created successfully");
            }

            setFormData({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
            setEditingId(null);
            setShowForm(false);
            await fetchPosts();
        } catch (error) {
            showError("Failed to save blog post. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post: any) => {
        setEditingId(post.id);
        setFormData({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
            published: post.published || false,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) {
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, "blog", id));
            showSuccess("Blog post deleted successfully");
            await fetchPosts();
        } catch (error) {
            showError("Failed to delete blog post");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublished = async (post: any) => {
        try {
            await updateDoc(doc(db, "blog", post.id), {
                published: !post.published,
            });
            showSuccess(`Post ${!post.published ? "published" : "unpublished"}`);
            await fetchPosts();
        } catch (error) {
            showError("Failed to update status");
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="flex items-center gap-4 border-b border-border pb-6">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">Blog Manager</h1>
                    <p className="text-muted-foreground mt-1">Manage your blog posts</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    <span>New Post</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Post" : "Create Post"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Post Title *"
                            value={formData.title}
                            onChange={(e) => {
                                const title = e.target.value;
                                setFormData({
                                    ...formData,
                                    title,
                                    slug: !editingId ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : formData.slug
                                });
                            }}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="URL Slug *"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <textarea
                        placeholder="Excerpt (short summary) *"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full mt-4 bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-20"
                    />
                    <textarea
                        placeholder="Content (Markdown supported)"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full mt-4 bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-64 font-mono text-sm"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <label className="flex items-center gap-2 px-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.published}
                                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-foreground">Published</span>
                        </label>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {loading ? "Saving..." : "Save"}
                        </button>
                        {editingId && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
                                    setShowForm(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-secondary"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Posts List */}
            {loading && posts.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    No blog posts yet. Create your first post above.
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{post.title}</h3>
                                        <span
                                            className={`text-xs font-mono px-2 py-1 rounded ${post.published
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-yellow-500/10 text-yellow-500"
                                                }`}
                                        >
                                            {post.published ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>
                                    <p className="text-xs text-muted-foreground">Slug: /{post.slug}</p>
                                    {post.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {post.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => togglePublished(post)}
                                        disabled={loading}
                                        className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                        title={post.published ? "Unpublish" : "Publish"}
                                    >
                                        {post.published ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        disabled={loading}
                                        className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        disabled={loading}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
