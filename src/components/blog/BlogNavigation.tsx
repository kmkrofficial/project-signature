"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, User, Sun, Moon, BookOpen } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

export function BlogNavigation() {
    const { theme, toggleTheme } = useTheme();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6 justify-between">
            <Link href="/blog" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-primary transition-colors">
                <BookOpen size={24} />
                <span>SYSTEM LOGS</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors border border-border rounded-full px-4 py-2 hover:border-primary/50"
                >
                    <User size={14} />
                    <span>ABOUT AUTHOR</span>
                    <ArrowLeft size={14} className="rotate-180" />
                </Link>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                >
                    {theme === "deepSystem" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </nav >
    );
}
