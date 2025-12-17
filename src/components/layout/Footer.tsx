"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Terminal, Sparkles, Github, Linkedin, Twitter, Coffee, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SocialsModal } from "@/components/features/SocialsModal";

export function Footer() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";
    const currentYear = new Date().getFullYear();
    const [links, setLinks] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
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
        fetchLinks();
    }, []);

    return (
        <footer id="site-footer" className="py-8 border-t border-border bg-background transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-5">

                    {/* Connect With Me Section */}
                    <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="font-mono text-xs tracking-wider uppercase">Connect With Me</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {links.github && (
                                <a href={links.github} target="_blank" rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-card border border-border hover:border-primary/50 hover:text-primary transition-all group" title="GitHub">
                                    <Github size={20} />
                                </a>
                            )}

                            {links.linkedin && (
                                <a href={links.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-card border border-border hover:border-primary/50 hover:text-blue-500 transition-all group" title="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                            )}

                            {links.twitter && (
                                <a href={links.twitter} target="_blank" rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-card border border-border hover:border-primary/50 hover:text-sky-500 transition-all group" title="Twitter">
                                    <Twitter size={20} />
                                </a>
                            )}

                            {links.buymeacoffee && (
                                <a href={links.buymeacoffee} target="_blank" rel="noopener noreferrer"
                                    className="p-3 rounded-full bg-card border border-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-500 hover:bg-yellow-500/5 transition-all group" title="Buy Me A Coffee">
                                    <Coffee size={20} />
                                </a>
                            )}

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20"
                                title="Send Message"
                            >
                                <Mail size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full max-w-2xl bg-border/50" />

                    {/* Existing Footer Content */}
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
                        <div className="flex items-center gap-2 justify-center">
                            {isDark ? <Terminal size={16} /> : <Sparkles size={16} />}
                            <p className="font-mono tracking-wider">
                                {isDark
                                    ? "SYSTEM STATUS: ONLINE // ALL SYSTEMS NOMINAL"
                                    : "Thanks for visiting! Have a great day!"}
                            </p>
                        </div>
                        <p className="opacity-50">
                            © {currentYear} Keerthi Raajan K M. {isDark ? "Architected with Next.js & React Three Fiber." : "Crafted with Next.js & React Three Fiber."}
                        </p>
                    </div>
                </div>
            </div>

            <SocialsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </footer>
    );
}
