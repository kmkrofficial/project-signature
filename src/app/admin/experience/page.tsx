"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2, Briefcase } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/Toast";
import Link from "next/link";

export default function ExperienceAdminPage() {
    const [experience, setExperience] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        period: "",
        description: "",
        achievements: "",
        techStack: "",
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchExperience();
    }, []);

    const fetchExperience = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "experience"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Sort by date logic if needed, for now just raw data
            setExperience(data);
        } catch (error) {
            showError("Failed to load experience records");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.company.trim() || !formData.role.trim()) {
            showError("Company and Role are required");
            return;
        }

        try {
            setLoading(true);
            const data = {
                company: formData.company,
                role: formData.role,
                period: formData.period,
                description: formData.description,
                achievements: formData.achievements.split("\n").map(a => a.trim()).filter(Boolean),
                techStack: formData.techStack.split(",").map(t => t.trim()).filter(Boolean),
            };

            if (editingId) {
                await updateDoc(doc(db, "experience", editingId), data);
                showSuccess("Record updated successfully");
            } else {
                await addDoc(collection(db, "experience"), data);
                showSuccess("Record created successfully");
            }

            setFormData({ company: "", role: "", period: "", description: "", achievements: "", techStack: "" });
            setEditingId(null);
            setShowForm(false);
            await fetchExperience();
        } catch (error) {
            showError("Failed to save record. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            company: item.company || "",
            role: item.role || "",
            period: item.period || "",
            description: item.description || "",
            achievements: Array.isArray(item.achievements) ? item.achievements.join("\n") : "",
            techStack: Array.isArray(item.techStack) ? item.techStack.join(", ") : "",
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) {
            return;
        }

        try {
            setLoading(true);
            await deleteDoc(doc(db, "experience", id));
            showSuccess("Record deleted successfully");
            await fetchExperience();
        } catch (error) {
            showError("Failed to delete record");
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
                    <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
                    <p className="text-muted-foreground mt-1">Manage professional experience</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ company: "", role: "", period: "", description: "", achievements: "", techStack: "" });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    <span>New Record</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Record" : "Create Record"}</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Company *"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                                type="text"
                                placeholder="Role *"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                                type="text"
                                placeholder="Period (e.g. Jan 2023 - Present)"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                            <input
                                type="text"
                                placeholder="Tech Stack (comma-separated)"
                                value={formData.techStack}
                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            />
                        </div>
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-24"
                        />
                        <textarea
                            placeholder="Achievements (one per line)"
                            value={formData.achievements}
                            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-32"
                        />
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
                                setFormData({ company: "", role: "", period: "", description: "", achievements: "", techStack: "" });
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
            {loading && experience.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : experience.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    No experience records yet. Add your first record above.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {experience.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 rounded bg-primary/10 text-primary mt-1">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold">{item.role}</h3>
                                                <p className="text-lg text-primary">{item.company}</p>
                                                <p className="text-sm text-muted-foreground font-mono mt-1">{item.period}</p>
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground mt-3 mb-3">{item.description}</p>

                                        {item.achievements && item.achievements.length > 0 && (
                                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                                                {item.achievements.map((achievement: string, i: number) => (
                                                    <li key={i}>{achievement}</li>
                                                ))}
                                            </ul>
                                        )}

                                        {item.techStack && item.techStack.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.techStack.map((tech: string) => (
                                                    <span key={tech} className="text-xs px-2 py-1 bg-secondary rounded font-mono">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        disabled={loading}
                                        className="p-2 hover:bg-primary/10 text-primary rounded transition-colors disabled:opacity-50"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
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
