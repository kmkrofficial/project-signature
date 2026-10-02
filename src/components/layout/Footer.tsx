"use client";

import React, { useState, useEffect } from "react";
import { Github, Linkedin, Twitter, Mail, Rss } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { SocialsModal } from "@/components/features/SocialsModal";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [links, setLinks] = useState<Record<string, string>>({
        github: "https://github.com/keerthiraajan",
        linkedin: "https://linkedin.com/in/keerthiraajan",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const docRef = doc(db, "config", "site");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLinks((prev) => ({ ...prev, ...(docSnap.data() as Record<string, string>) }));
                }
            } catch (error) {
                console.error("Error fetching footer links:", error);
            }
        };
        fetchLinks();
    }, []);

    return (
        <footer className="border-t border-border bg-background/40 mt-6 sm:mt-8 py-5 sm:py-6 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Brand & Copyright */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <Link href="/" className="flex items-baseline gap-1 text-foreground hover:text-primary transition-colors">
                            <span className="font-signature text-lg text-primary font-bold">Keerthi&apos;s</span>
                            <span className="font-bold text-sm">Signature</span>
                        </Link>
                        <span className="text-muted-foreground/40">•</span>
                        <span>© {currentYear}</span>
                    </div>

                    {/* Social & Contact Actions */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        {links.github && (
                            <a
                                href={links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                                title="GitHub"
                                aria-label="GitHub"
                            >
                                <Github size={16} />
                            </a>
                        )}

                        {links.linkedin && (
                            <a
                                href={links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                                title="LinkedIn"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={16} />
                            </a>
                        )}

                        {links.twitter && (
                            <a
                                href={links.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                                title="Twitter"
                                aria-label="Twitter"
                            >
                                <Twitter size={16} />
                            </a>
                        )}

                        <Link
                            href="/feed.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title="RSS Feed"
                            aria-label="RSS Feed"
                        >
                            <Rss size={16} />
                        </Link>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-colors"
                            title="Contact"
                            aria-label="Contact"
                        >
                            <Mail size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <SocialsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </footer>
    );
}
