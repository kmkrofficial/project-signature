"use client";

import React, { useState, useEffect } from "react";
import { Github, Linkedin, Twitter, Mail, Rss, Coffee } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { SocialsModal } from "@/components/features/SocialsModal";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [links, setLinks] = useState<any>({
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
                    setLinks((prev: any) => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error fetching footer links:", error);
            }
        };
        fetchLinks();
    }, []);

    return (
        <footer className="border-t border-border/60 bg-card/30 mt-20 py-12 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Author Brand & Philosophy */}
                    <div className="text-center md:text-left">
                        <Link href="/" className="font-bold text-foreground hover:text-primary transition-colors">
                            Keerthi Raajan
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            Thoughts and essays on distributed architecture, full-stack AI, and systems engineering.
                        </p>
                    </div>

                    {/* Center: Social Connect */}
                    <div className="flex items-center gap-3">
                        {links.github && (
                            <a
                                href={links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="GitHub"
                            >
                                <Github size={18} />
                            </a>
                        )}

                        {links.linkedin && (
                            <a
                                href={links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        )}

                        {links.twitter && (
                            <a
                                href={links.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="Twitter"
                            >
                                <Twitter size={18} />
                            </a>
                        )}

                        <Link
                            href="/feed.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="RSS Feed"
                        >
                            <Rss size={18} />
                        </Link>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Contact"
                        >
                            <Mail size={18} />
                        </button>
                    </div>

                    {/* Right: Copyright */}
                    <div className="text-center md:text-right text-xs text-muted-foreground">
                        <p>© {currentYear} Keerthi Raajan. All rights reserved.</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                            Crafted with Next.js & Tailwind CSS. Hosted on Vercel.
                        </p>
                    </div>
                </div>
            </div>

            <SocialsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </footer>
    );
}
