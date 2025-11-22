"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/Toast";
import Link from "next/link";

export default function ProjectsAdminPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tech: "",
        link: "",
        github: "",
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "portfolio"));
            const projectsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(projectsData);
        } catch (error) {
            showError("Failed to load projects");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!formData.title.trim()) {
            showError("Project title is required");
            return;
        }
        if (!formData.description.trim()) {
            showError("Project description is required");
            return;
        }
        if (!formData.tech.trim()) {
            showError("Tech stack is required");
            return;
        }

        try {
            setLoading(true);
            const projectData = {
                title: formData.title,
                description: formData.description,
                tech: formData.tech.split(",").map((t) => t.trim()).filter(Boolean),
                link: formData.link || "",
                github: formData.github || "",
            };

            if (editingId) {
                // Update existing
                await updateDoc(doc(db, "portfolio", editingId), projectData);
                showSuccess("Project updated successfully");
            } else {
                // Create new
                await addDoc(collection(db, "portfolio"), projectData);
                showSuccess("Project created successfully");
            }

            setFormData({ title: "", description: "", tech: "", link: "", github: "" });
            setEditingId(null);
            setShowForm(false);
            await fetchProjects();
        } catch (error) {
            showError("Failed to save project. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project: any) => {
        setEditingId(project.id);
        setFormData({
            title: project.title || "",
            description: project.description || "",
            tech: Array.isArray(project.tech) ? project.tech.join(", ") : "",
            link: project.link || "",
            github: project.github || "",
        });
        setShowForm(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, "portfolio", id));
            showSuccess("Project deleted successfully");
            await fetchProjects();
        } catch (error) {
            showError("Failed to delete project");
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
                    <h1 className="text-3xl font-bold text-foreground">Projects Manager</h1>
                    <p className="text-muted-foreground mt-1">Manage your portfolio projects</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: "", description: "", tech: "", link: "", github: "" });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Project" : "Create Project"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Project Title *"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Tech Stack (comma-separated) *"
                            value={formData.tech}
                            onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Live Link (optional)"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="GitHub Link (optional)"
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>
                    <textarea
                        placeholder="Description *"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full mt-4 bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-32"
                    />
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
                                    setFormData({ title: "", description: "", tech: "", link: "", github: "" });
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

            {/* List */}
            {loading && projects.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.length === 0 ? (
                        <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                            No projects yet. Create your first project above.
                        </div>
                    ) : (
                        projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{project.title}</h3>
                                        <p className="text-muted-foreground mt-2">{project.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {project.tech?.map((tech: string) => (
                                                <span
                                                    key={tech}
                                                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        {(project.link || project.github) && (
                                            <div className="flex gap-3 mt-3 text-sm">
                                                {project.link && (
                                                    <a
                                                        href={project.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Live Demo →
                                                    </a>
                                                )}
                                                {project.github && (
                                                    <a
                                                        href={project.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        GitHub →
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            disabled={loading}
                                            className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
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
