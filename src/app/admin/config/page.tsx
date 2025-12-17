"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/admin/Toast";
import Link from "next/link";

export default function ConfigAdminPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        siteTitle: "",
        siteDescription: "",
        github: "",
        linkedin: "",
        twitter: "",
        email: "",
        buymeacoffee: "",
        resumeLink: "",
        ogImageUrl: "",
    });
    const { toasts, removeToast, showSuccess, showError } = useToast();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, "config", "site");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    name: data.name || "",
                    title: data.title || "",
                    siteTitle: data.siteTitle || "",
                    siteDescription: data.siteDescription || "",
                    github: data.github || "",
                    linkedin: data.linkedin || "",
                    twitter: data.twitter || "",
                    email: data.email || "",
                    buymeacoffee: data.buymeacoffee || "",
                    resumeLink: data.resumeLink || "",
                    ogImageUrl: data.ogImageUrl || "",
                });
            }
        } catch (error) {
            showError("Failed to load configuration");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.siteTitle.trim()) {
            showError("Site title is required");
            return;
        }

        try {
            setLoading(true);
            const docRef = doc(db, "config", "site");
            await setDoc(docRef, {
                ...formData,
                updatedAt: new Date().toISOString(),
            });
            showSuccess("Configuration saved successfully");
        } catch (error) {
            showError("Failed to save configuration. Please try again.");
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
                    <h1 className="text-3xl font-bold text-foreground">Site Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage site-wide settings</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">General Settings</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                    placeholder="e.g. Keerthi Raajan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Title / Specialization
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                    placeholder="e.g. Full-Stack AI Engineer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Site Title (Browser Tab)
                            </label>
                            <input
                                type="text"
                                value={formData.siteTitle}
                                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="Your Name | Title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                About / Summary
                            </label>
                            <textarea
                                value={formData.siteDescription}
                                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary h-24"
                                placeholder="Brief description of your portfolio"
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-6 mt-8">Social Links</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                GitHub URL
                            </label>
                            <input
                                type="text"
                                value={formData.github}
                                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="https://github.com/username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                LinkedIn URL
                            </label>
                            <input
                                type="text"
                                value={formData.linkedin}
                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Twitter/X URL
                            </label>
                            <input
                                type="text"
                                value={formData.twitter}
                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="https://twitter.com/username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Buy Me A Coffee Link
                            </label>
                            <input
                                type="text"
                                value={formData.buymeacoffee}
                                onChange={(e) => setFormData({ ...formData, buymeacoffee: e.target.value })}
                                className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                                placeholder="https://buymeacoffee.com/username"
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-6 mt-8">Additional</h2>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Resume/CV Link
                        </label>
                        <input
                            type="text"
                            value={formData.resumeLink}
                            onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            placeholder="https://drive.google.com/... or /resume.pdf"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">
                            LinkedIn OG Image URL
                        </label>
                        <input
                            type="text"
                            value={formData.ogImageUrl}
                            onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                            className="w-full bg-secondary/20 border border-border rounded p-3 text-foreground focus:outline-none focus:border-primary"
                            placeholder="https://example.com/image.png"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Image to be displayed when sharing on LinkedIn (not visible on site).</p>
                    </div>

                    <div className="flex gap-2 mt-8 pt-6 border-t border-border">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {loading ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
