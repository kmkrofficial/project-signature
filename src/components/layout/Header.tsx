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
                <Link
                    href="/"
                    className="flex items-baseline gap-2 group transition-transform active:scale-[0.98] select-none py-1"
                >
                    <span className="font-signature text-3xl sm:text-[34px] text-primary -rotate-2 group-hover:scale-105 transition-transform duration-200 origin-bottom-left leading-none">
                        Keerthi&apos;s
                    </span>
                    <span className="font-extrabold tracking-tight text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-none">
                        Signature
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
                                        ? "bg-primary/10 border-primary/50 text-primary font-semibold shadow-primary/10"
                                        : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/40"
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
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/60 hover:bg-secondary hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs font-mono transition-all duration-150 cursor-pointer"
                            title={`Search (${shortcutLabel})`}
                        >
                            <Search size={14} />
                            <span>Search</span>
                            <kbd className="hidden lg:inline-block bg-background px-1.5 py-0.5 rounded text-[10px] border border-border text-muted-foreground font-mono">
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
                                                ? "bg-primary/10 border-primary/50 text-primary font-semibold shadow-xs"
                                                : "bg-secondary/60 border-border text-foreground hover:bg-secondary hover:border-primary/40"
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
                            <div className="h-px bg-border my-1.5" />
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 py-2.5 px-3.5 text-sm font-medium rounded-xl border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
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
