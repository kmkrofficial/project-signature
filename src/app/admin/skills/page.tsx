"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import Link from "next/link";

const CATEGORIES = [
    "AI & ML",
    "Cybersecurity",
    "Data Structures & Algorithms",
    "Cloud & DevOps",
    "Web Technologies",
    "Other"
];

interface Skill {
    id: string;
    name: string;
    category: string;
    associatedProjects?: string[];
}

export default function SkillsAdminPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "Web Technologies",
        associatedProjects: "",
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "skills"));
            const skillsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Skill[];
            setSkills(skillsData);
        } catch (error) {
            showError("Failed to load skills");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showError("Skill name is required");
            return;
        }

        try {
            setLoading(true);
            const skillData = {
                name: formData.name,
                category: formData.category,
                associatedProjects: formData.associatedProjects.split(",").map(p => p.trim()).filter(Boolean),
            };

            if (editingId) {
                await updateDoc(doc(db, "skills", editingId), skillData);
                showSuccess("Skill updated successfully");
            } else {
                await addDoc(collection(db, "skills"), skillData);
                showSuccess("Skill created successfully");
            }

            setFormData({ name: "", category: "Web Technologies", associatedProjects: "" });
            setEditingId(null);
            setShowForm(false);
            await fetchSkills();
        } catch (error) {
            showError("Failed to save skill. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (skill: Skill) => {
        setEditingId(skill.id);
        setFormData({
            name: skill.name || "",
            category: skill.category || "Web Technologies",
            associatedProjects: Array.isArray(skill.associatedProjects) ? skill.associatedProjects.join(", ") : "",
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) {
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, "skills", id));
            showSuccess("Skill deleted successfully");

            // Update local state to remove the deleted item without refetching/reordering
            setSkills(prev => prev.filter(skill => skill.id !== id));
        } catch (error) {
            showError("Failed to delete skill");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

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
                    <h1 className="text-3xl font-bold text-foreground">Skills Manager</h1>
                    <p className="text-muted-foreground mt-1">Manage your technical skills</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", category: "Web Technologies", associatedProjects: "" });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    <span>New Skill</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Skill" : "Create Skill"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Skill Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Associated Projects (comma-separated)"
                                value={formData.associatedProjects}
                                onChange={(e) => setFormData({ ...formData, associatedProjects: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                E.g. Portfolio, E-commerce App, AI Chatbot
                            </p>
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
                        {editingId && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: "", category: "Web Technologies", associatedProjects: "" });
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

            {/* Skills by Category */}
            {loading && skills.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : skills.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    No skills yet. Create your first skill above.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                        <div key={category}>
                            <h3 className="text-lg font-bold mb-3 text-primary">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categorySkills.map((skill) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-bold">{skill.name}</h4>
                                                {skill.associatedProjects && skill.associatedProjects.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                        Used in: {skill.associatedProjects.join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(skill)}
                                                    disabled={loading}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(skill.id)}
                                                    disabled={loading}
                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
