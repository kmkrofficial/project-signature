"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/Toast";
import Link from "next/link";

export default function EducationAdminPage() {
    const [education, setEducation] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        degree: "",
        institution: "",
        year: "",
        grade: "",
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchEducation();
    }, []);

    const fetchEducation = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "education"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEducation(data);
        } catch (error) {
            showError("Failed to load education records");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.degree.trim() || !formData.institution.trim()) {
            showError("Degree and Institution are required");
            return;
        }

        try {
            setLoading(true);
            const data = {
                degree: formData.degree,
                institution: formData.institution,
                year: formData.year,
                grade: formData.grade,
            };

            if (editingId) {
                await updateDoc(doc(db, "education", editingId), data);
                showSuccess("Record updated successfully");
            } else {
                await addDoc(collection(db, "education"), data);
                showSuccess("Record created successfully");
            }

            setFormData({ degree: "", institution: "", year: "", grade: "" });
            setEditingId(null);
            setShowForm(false);
            await fetchEducation();
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
            degree: item.degree || "",
            institution: item.institution || "",
            year: item.year || "",
            grade: item.grade || "",
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
            await deleteDoc(doc(db, "education", id));
            showSuccess("Record deleted successfully");
            await fetchEducation();
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
                    <h1 className="text-3xl font-bold text-foreground">Kernel Training</h1>
                    <p className="text-muted-foreground mt-1">Manage education and certifications</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ degree: "", institution: "", year: "", grade: "" });
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Degree / Certification *"
                            value={formData.degree}
                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Institution *"
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Year (e.g. 2020 - 2024)"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder="Grade / Score"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
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
                                setFormData({ degree: "", institution: "", year: "", grade: "" });
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
            {loading && education.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : education.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    No education records yet. Add your first record above.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {education.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded bg-primary/10 text-primary">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{item.degree}</h3>
                                        <p className="text-muted-foreground">{item.institution}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm font-mono">
                                            <span className="text-primary">{item.year}</span>
                                            {item.grade && (
                                                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                                                    Score: {item.grade}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
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
