"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, doc, setDoc, deleteDoc, Timestamp, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Loader2, Plus, LogOut, ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    createdAt: any;
    published?: boolean;
}

export default function CMSPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [view, setView] = useState<"list" | "editor">("list");
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
    const [saving, setSaving] = useState(false);

    // Auth check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/admin/login");
            } else {
                setUser(currentUser);
                fetchPosts();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedPosts: BlogPost[] = [];
            querySnapshot.forEach((doc) => {
                fetchedPosts.push({ id: doc.id, ...doc.data() } as BlogPost);
            });
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    const handleCreateNew = () => {
        setCurrentPost({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            tags: [],
            published: true,
        });
        setView("editor");
    };

    const handleEdit = (post: BlogPost) => {
        setCurrentPost(post);
        setView("editor");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, "blog", id));
                fetchPosts();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleSave = async () => {
        if (!currentPost.title || !currentPost.slug || !currentPost.content) {
            alert("Title, Slug, and Content are required");
            return;
        }

        setSaving(true);
        try {
            const postData = {
                title: currentPost.title,
                slug: currentPost.slug,
                excerpt: currentPost.excerpt || "",
                content: currentPost.content,
                tags: currentPost.tags || [],
                published: currentPost.published !== false,
                updatedAt: Timestamp.now(),
            };

            if (currentPost.id) {
                // Update existing
                await setDoc(doc(db, "blog", currentPost.id), postData, { merge: true });
            } else {
                // Create new
                await setDoc(doc(collection(db, "blog")), {
                    ...postData,
                    published: true,
                    createdAt: Timestamp.now(),
                });
            }

            setView("list");
            fetchPosts();
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post: " + error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pt-20 pb-10">
            <Container>
                <header className="flex justify-between items-center mb-10 border-b border-border pb-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-3xl font-bold font-mono">CMS // DASHBOARD</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                {view === "list" && (
                    <MotionDiv>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={handleCreateNew}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <Plus size={18} />
                                New Post
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-4 border border-border rounded bg-card flex justify-between items-center hover:border-primary transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                        <p className="text-sm text-muted-foreground font-mono">/{post.slug}</p>
                                        <div className="flex gap-2 mt-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="p-2 hover:bg-secondary rounded text-blue-500"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 hover:bg-secondary rounded text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {posts.length === 0 && (
                                <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded">
                                    No posts found. Create one to get started.
                                </div>
                            )}
                        </div>
                    </MotionDiv>
                )}

                {view === "editor" && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setView("list")}
                                className="p-2 hover:bg-secondary rounded"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold">
                                {currentPost.id ? "Edit Post" : "New Post"}
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    value={currentPost.title}
                                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                    className="w-full p-2 rounded bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Post Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    type="text"
                                    value={currentPost.slug}
                                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                                    className="w-full p-2 rounded bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none font-mono"
                                    placeholder="post-slug"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Short Description</label>
                            <textarea
                                value={currentPost.excerpt || ""}
                                onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                className="w-full p-2 rounded bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none h-20 resize-none"
                                placeholder="Brief summary of the post..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={currentPost.tags?.join(", ")}
                                onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                                className="w-full p-2 rounded bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
                                placeholder="react, typescript, tutorial"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="published"
                                checked={currentPost.published !== false}
                                onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                                className="w-4 h-4 rounded border-border bg-secondary"
                            />
                            <label htmlFor="published" className="text-sm font-medium cursor-pointer">Published (Visible on site)</label>
                        </div>

                        <div className="space-y-2" data-color-mode="dark">
                            <label className="text-sm font-medium">Content (Markdown)</label>
                            <MDEditor
                                value={currentPost.content}
                                onChange={(val) => setCurrentPost({ ...currentPost, content: val || "" })}
                                height={500}
                                className="bg-card"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                onClick={() => setView("list")}
                                className="px-4 py-2 rounded text-muted-foreground hover:bg-secondary flex items-center gap-2"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Post
                            </button>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}

function MotionDiv({ children }: { children: React.ReactNode }) {
    // Simple wrapper to avoid framer-motion complexity if not needed immediately, 
    // or we can import framer-motion similarly to other files.
    // For now, let's just render the list directly.
    return <div>{children}</div>
}
