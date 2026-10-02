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

            // 1. Save to Firebase (Backup)
            await addDoc(collection(db, "messages"), {
                to: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "kmkrworks@gmail.com",
                from: emailForm.email,
                name: emailForm.name,
                message: emailForm.message,
                createdAt: Timestamp.now(),
                read: false
            });

            // 2. Send actual email via API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: emailForm.name,
                    email: emailForm.email,
                    message: emailForm.message
                }),
            });

            if (!response.ok) {
                console.warn("Email API failed, but saved to database.");
            }

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
                        className="bg-card border border-border rounded-2xl w-[95%] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-card z-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Get in Touch</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Feel free to connect or send a direct note.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Social Links */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                    Connect & Follow
                                </h3>

                                {links.github && (
                                    <a href={links.github} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/50 transition-colors group">
                                        <Github className="text-foreground group-hover:text-primary transition-colors" size={18} />
                                        <span className="font-medium text-sm">GitHub</span>
                                    </a>
                                )}

                                {links.linkedin && (
                                    <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/50 transition-colors group">
                                        <Linkedin className="text-blue-500" size={18} />
                                        <span className="font-medium text-sm">LinkedIn</span>
                                    </a>
                                )}

                                {links.twitter && (
                                    <a href={links.twitter} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/50 transition-colors group">
                                        <Twitter className="text-sky-500" size={18} />
                                        <span className="font-medium text-sm">Twitter / X</span>
                                    </a>
                                )}

                                {links.buymeacoffee && (
                                    <a href={links.buymeacoffee} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors group border border-yellow-500/20">
                                        <Coffee className="text-yellow-500" size={18} />
                                        <span className="font-medium text-sm text-yellow-500">Buy Me A Coffee</span>
                                    </a>
                                )}
                            </div>

                            {/* Direct Message Form */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Send a Message
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                    Have a question, feedback, or want to collaborate? Leave a message below.
                                </p>

                                {sent ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <CheckCircle className="text-emerald-500 mb-2" size={40} />
                                        <h4 className="text-base font-semibold text-foreground">Message Sent!</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Thanks for reaching out. I’ll get back to you shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendEmail} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={emailForm.name}
                                            onChange={e => setEmailForm({ ...emailForm, name: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Your email address"
                                            value={emailForm.email}
                                            onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                            required
                                        />
                                        <textarea
                                            placeholder="Your message..."
                                            value={emailForm.message}
                                            onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                                            className="w-full bg-secondary/20 border border-border rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary h-28 resize-none transition-colors"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="w-full flex items-center justify-center gap-2 p-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm shadow-sm"
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                            <span>Send Message</span>
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
