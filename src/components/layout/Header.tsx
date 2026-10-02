"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Rss, Menu, X, Terminal } from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
    onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [shortcutLabel, setShortcutLabel] = useState("Ctrl + K");

    // Detect operating system for shortcut label (Cmd + K on macOS, Ctrl + K on others)
    useEffect(() => {
        if (typeof window !== "undefined" && typeof navigator !== "undefined") {
            const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);
            if (isMac) {
                requestAnimationFrame(() => setShortcutLabel("Cmd + K"));
            }
        }
    }, []);

    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        if (mobileOpen) {
            setMobileOpen(false);
        }
    }

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileOpen]);

    const navLinks = [
        { name: "Articles", href: "/", isActive: pathname === "/" || pathname.startsWith("/blog") },
        { name: "About & Work", href: "/about", isActive: pathname.startsWith("/about") },
        { name: "RSS", href: "/feed.xml", isExternal: true },
    ];

    return (
        <header className="sticky top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand / Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group transition-transform active:scale-[0.98]"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold tracking-tight text-lg text-foreground group-hover:text-primary transition-colors">
                        The Signature
                    </span>
                    <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground border border-border/80 px-1.5 py-0.5 rounded bg-secondary/50">
                        Blog
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => {
                        const active = link.isActive;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                target={link.isExternal ? "_blank" : undefined}
                                rel={link.isExternal ? "noopener noreferrer" : undefined}
                                className={clsx(
                                    "relative px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 rounded-full flex items-center gap-1.5 border shadow-2xs group",
                                    active
                                        ? "bg-primary/10 border-primary/50 dark:border-primary/60 text-primary font-semibold shadow-primary/10"
                                        : "bg-secondary/40 dark:bg-zinc-900/50 border-slate-300 dark:border-zinc-700/90 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40 dark:hover:border-primary/50"
                                )}
                            >
                                {active && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                                <span>{link.name}</span>
                                {link.isExternal && (
                                    <Rss
                                        size={13}
                                        className={clsx(
                                            "transition-colors",
                                            active
                                                ? "text-primary"
                                                : "text-amber-500 group-hover:text-amber-400"
                                        )}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Action Controls */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Search Trigger */}
                    {onOpenSearch && (
                        <button
                            onClick={onOpenSearch}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700/80 bg-secondary/40 hover:bg-secondary hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs font-mono transition-all duration-150"
                            title={`Search (${shortcutLabel})`}
                        >
                            <Search size={14} />
                            <span>Search</span>
                            <kbd className="hidden lg:inline-block bg-background px-1.5 py-0.5 rounded text-[10px] border border-slate-300 dark:border-zinc-700 text-muted-foreground font-mono">
                                {shortcutLabel}
                            </kbd>
                        </button>
                    )}

                    {/* Admin Link */}
                    <Link
                        href="/admin"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        title="Admin Studio"
                    >
                        <Terminal size={18} />
                    </Link>

                    {/* Theme Switch Toggle */}
                    <ThemeToggle />
                </div>

                {/* Mobile Right Controls */}
                <div className="flex items-center gap-1.5 md:hidden">
                    {onOpenSearch && (
                        <button
                            onClick={onOpenSearch}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                    )}

                    <ThemeToggle size="sm" />

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg"
                        aria-label="Open menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-6 py-6"
                    >
                        <nav className="flex flex-col gap-2.5">
                            {navLinks.map((link) => {
                                const active = link.isActive;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        target={link.isExternal ? "_blank" : undefined}
                                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                                        className={clsx(
                                            "flex items-center justify-between py-2.5 text-sm font-medium rounded-xl px-3.5 transition-all border",
                                            active
                                                ? "bg-primary/10 border-primary/50 dark:border-primary/60 text-primary font-semibold shadow-xs"
                                                : "bg-secondary/30 dark:bg-zinc-900/50 border-slate-300 dark:border-zinc-700/80 text-foreground hover:bg-secondary/60 hover:border-primary/40"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                            <span>{link.name}</span>
                                        </span>
                                        {link.isExternal && <Rss size={15} className="text-amber-500" />}
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-slate-300/60 dark:bg-zinc-800 my-1.5" />
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 py-2.5 px-3.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-zinc-700/80 bg-secondary/30 dark:bg-zinc-900/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                            >
                                <Terminal size={16} />
                                <span>Admin Studio</span>
                            </Link>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
