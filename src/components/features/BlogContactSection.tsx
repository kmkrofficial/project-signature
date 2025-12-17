"use client";

import React, { useState, useEffect } from "react";
import { Github, Linkedin, Twitter, Coffee, Send, Loader2, CheckCircle, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

export function BlogContactSection() {
    const [links, setLinks] = useState<any>({});
    const [emailForm, setEmailForm] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        fetchLinks();
    }, []);

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
        <Section className="py-20 border-t border-border bg-secondary/5">
            <Container>
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Header & Socials */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Mail size={20} />
                                <span className="font-mono text-sm tracking-wider">CONTACT</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Have a question, proposal, or just want to discuss the latest in AI?
                                Feel free to reach out. I'm always open to discussing new projects and ideas.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {links.github && (
                                <a href={links.github} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group">
                                    <Github className="text-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-medium">GitHub</span>
                                </a>
                            )}

                            {links.linkedin && (
                                <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group">
                                    <Linkedin className="text-blue-500" />
                                    <span className="font-medium">LinkedIn</span>
                                </a>
                            )}

                            {links.twitter && (
                                <a href={links.twitter} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group">
                                    <Twitter className="text-sky-500" />
                                    <span className="font-medium">Twitter / X</span>
                                </a>
                            )}

                            {links.buymeacoffee && (
                                <a href={links.buymeacoffee} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-all group">
                                    <Coffee className="text-yellow-500" />
                                    <span className="font-medium text-yellow-500">Buy Me A Coffee</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="flex-1">
                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                            <h3 className="text-lg font-bold mb-6">Send Message</h3>

                            {sent ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <CheckCircle className="text-green-500 mb-4" size={48} />
                                    <h4 className="text-xl font-bold text-green-500 mb-2">Message Sent</h4>
                                    <p className="text-muted-foreground">Thank you for reaching out. I'll get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendEmail} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Name</label>
                                        <input
                                            type="text"
                                            value={emailForm.name}
                                            onChange={e => setEmailForm({ ...emailForm, name: e.target.value })}
                                            className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Email</label>
                                        <input
                                            type="email"
                                            value={emailForm.email}
                                            onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                                            className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-80">Message</label>
                                        <textarea
                                            value={emailForm.message}
                                            onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                                            className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-32 resize-none"
                                            placeholder="How can I help you?"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 p-3 mt-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 font-medium"
                                    >
                                        {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                        <span>Send Message</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
