"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Linkedin, Twitter, Mail, Coffee, Send, Loader2, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";

interface SocialsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SocialsModal({ isOpen, onClose }: SocialsModalProps) {
    const [links, setLinks] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [emailForm, setEmailForm] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLinks();
        }
    }, [isOpen]);

    const fetchLinks = async () => {
        try {
            const docRef = doc(db, "config", "site");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setLinks(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching links:", error);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForm.name || !emailForm.email || !emailForm.message) return;

        try {
            setSending(true);
            await addDoc(collection(db, "messages"), {
                to: "kmkrworks@gmail.com",
                from: emailForm.email,
                name: emailForm.name,
                message: emailForm.message,
                createdAt: Timestamp.now(),
                read: false
            });
            setSent(true);
            setEmailForm({ name: "", email: "", message: "" });
            setTimeout(() => setSent(false), 3000);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-2xl font-bold">Initialize Communications</h2>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* Social Links */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                                    Secure Channels
                                </h3>

                                {links.github && (
                                    <a href={links.github} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                                        <Github className="text-foreground group-hover:text-primary transition-colors" />
                                        <span className="font-medium">GitHub</span>
                                    </a>
                                )}

                                {links.linkedin && (
                                    <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                                        <Linkedin className="text-blue-500" />
                                        <span className="font-medium">LinkedIn</span>
                                    </a>
                                )}

                                {links.twitter && (
                                    <a href={links.twitter} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group">
                                        <Twitter className="text-sky-500" />
                                        <span className="font-medium">Twitter / X</span>
                                    </a>
                                )}

                                {links.buymeacoffee && (
                                    <a href={links.buymeacoffee} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors group border border-yellow-500/20">
                                        <Coffee className="text-yellow-500" />
                                        <span className="font-medium text-yellow-500">Buy Me A Coffee</span>
                                    </a>
                                )}
                            </div>

                            {/* Direct Message Form */}
                            <div>
                                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                                    Direct Transmission
                                </h3>

                                {sent ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <CheckCircle className="text-green-500 mb-2" size={48} />
                                        <h4 className="text-lg font-bold text-green-500">Message Sent</h4>
                                        <p className="text-sm text-muted-foreground">Transmission successful.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendEmail} className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Identity (Name)"
                                            value={emailForm.name}
                                            onChange={e => setEmailForm({ ...emailForm, name: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded p-3 text-sm focus:outline-none focus:border-primary"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Return Address (Email)"
                                            value={emailForm.email}
                                            onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded p-3 text-sm focus:outline-none focus:border-primary"
                                            required
                                        />
                                        <textarea
                                            placeholder="Transmission Content..."
                                            value={emailForm.message}
                                            onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded p-3 text-sm focus:outline-none focus:border-primary h-32 resize-none"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            <span>Transmit Message</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
