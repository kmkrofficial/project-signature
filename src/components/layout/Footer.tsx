"use client";

import React from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Terminal, Sparkles } from "lucide-react";

export function Footer() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border bg-background transition-colors duration-300">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                    {isDark ? <Terminal size={16} /> : <Sparkles size={16} />}
                    <p className="font-mono tracking-wider">
                        {isDark
                            ? "SYSTEM STATUS: ONLINE // ALL SYSTEMS NOMINAL"
                            : "Thanks for visiting! Have a great day!"}
                    </p>
                </div>
                <p className="opacity-50">
                    © {currentYear} Keerthi Raajan K M. {isDark ? "Architected" : "Crafted"} with Next.js & React Three Fiber.
                </p>
            </div>
        </footer>
    );
}
