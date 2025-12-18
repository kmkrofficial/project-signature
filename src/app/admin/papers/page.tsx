"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileStack, Edit, Trash2, Save, X, ArrowLeft, Loader2, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import Link from "next/link";

export default function PapersAdminPage() {
    const [papers, setPapers] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        authors: string;
        publication: string;
        year: number | string;
        doi: string;
        abstract: string;
        tags: string;
        published: boolean;
    }>({
        title: "",
        authors: "",
        publication: "",
        year: new Date().getFullYear(),
        doi: "",
        abstract: "",
        tags: "",
        published: true,
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "papers"));
            const papersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPapers(papersData);
        } catch (error) {
            showError("Failed to load research papers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!formData.title.trim()) {
            showError("Paper title is required");
            return;
        }
        if (!formData.authors.trim()) {
            showError("Authors are required");
            return;
        }
        if (!formData.publication.trim()) {
            showError("Publication name is required");
            return;
        }

        try {
            setLoading(true);
            const baseData = {
                title: formData.title,
                authors: formData.authors.split(",").map((a) => a.trim()).filter(Boolean),
                publication: formData.publication,
                year: Number(formData.year),
                doi: formData.doi || "",
                abstract: formData.abstract || "",
                tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
                published: formData.published,
                updatedAt: Timestamp.now(),
            };

            if (editingId) {
                // Update existing
                await updateDoc(doc(db, "papers", editingId), baseData);
                showSuccess("Paper updated successfully");
            } else {
                // Create new
                await addDoc(collection(db, "papers"), {
                    ...baseData,
                    createdAt: Timestamp.now(),
                });
                showSuccess("Paper created successfully");
            }

            setFormData({
                title: "",
                authors: "",
                publication: "",
                year: new Date().getFullYear(),
                doi: "",
                abstract: "",
                tags: "",
                published: true,
            });
            setEditingId(null);
            setShowForm(false);
            await fetchPapers();
        } catch (error) {
            showError("Failed to save paper. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (paper: any) => {
        setEditingId(paper.id);
        setFormData({
            title: paper.title || "",
            authors: Array.isArray(paper.authors) ? paper.authors.join(", ") : "",
            publication: paper.publication || "",
            year: paper.year || new Date().getFullYear(),
            doi: paper.doi || "",
            abstract: paper.abstract || "",
            tags: Array.isArray(paper.tags) ? paper.tags.join(", ") : "",
            published: paper.published !== false,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this paper?")) {
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, "papers", id));
            showSuccess("Paper deleted successfully");
            await fetchPapers();
        } catch (error) {
            showError("Failed to delete paper");
            console.error(error);
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold text-foreground">Research Papers</h1>
                    <p className="text-muted-foreground mt-1">Manage your publications and research work</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            title: "",
                            authors: "",
                            publication: "",
                            year: new Date().getFullYear(),
                            doi: "",
                            abstract: "",
                            tags: "",
                            published: true,
                        });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    <span>New Paper</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? "Edit Research Paper" : "Add Research Paper"}
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Paper Title *"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Authors (comma-separated) *"
                            value={formData.authors}
                            onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Publication/Conference *"
                                value={formData.publication}
                                onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                                className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                                type="number"
                                placeholder="Year"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value === "" ? "" : parseInt(e.target.value) })}
                                className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="DOI or Link (optional)"
                            value={formData.doi}
                            onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <textarea
                            placeholder="Abstract"
                            value={formData.abstract}
                            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-32"
                        />
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="published"
                                checked={formData.published}
                                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="published" className="text-sm text-foreground">
                                Published (visible on website)
                            </label>
                        </div>
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
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: "",
                                    authors: "",
                                    publication: "",
                                    year: new Date().getFullYear(),
                                    doi: "",
                                    abstract: "",
                                    tags: "",
                                    published: true,
                                });
                                setShowForm(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-secondary"
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {loading && papers.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {papers.length === 0 ? (
                        <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                            No research papers yet. Add your first publication above.
                        </div>
                    ) : (
                        papers.map((paper) => (
                            <motion.div
                                key={paper.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{paper.title}</h3>
                                            {!paper.published && (
                                                <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
                                        </p>
                                        <p className="text-sm text-primary mb-3">
                                            {paper.publication} • {paper.year}
                                        </p>
                                        {paper.abstract && (
                                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                                {paper.abstract}
                                            </p>
                                        )}
                                        {paper.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {paper.tags.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2 py-1 bg-secondary rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {paper.doi && (
                                            <a
                                                href={paper.doi}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View Publication →
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(paper)}
                                            disabled={loading}
                                            className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(paper.id)}
                                            disabled={loading}
                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
