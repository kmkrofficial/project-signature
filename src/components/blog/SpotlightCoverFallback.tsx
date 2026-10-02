"use client";

import React from "react";
import { Layers, Cloud, BookOpen, Terminal, Sparkles } from "lucide-react";

interface SpotlightCoverFallbackProps {
    title?: string;
    category?: string;
    tags?: string[];
}

export function SpotlightCoverFallback({ category, tags = [] }: SpotlightCoverFallbackProps) {
    const cat = (category || "").toLowerCase();

    // Determine theme colors and icon based on category (optimized for both light and dark themes)
    let gradient = "from-cyan-100/90 via-sky-50 to-indigo-100/80 dark:from-cyan-950/70 dark:via-slate-900 dark:to-indigo-950/70";
    let accentBorder = "border-cyan-500/30 dark:border-cyan-500/30";
    let accentGlow = "bg-cyan-500/15 dark:bg-cyan-500/20";
    let icon = <Terminal size={32} className="text-cyan-600 dark:text-cyan-400" />;
    let label = category || "Editorial";

    if (cat.includes("artificial") || cat.includes("intelligence") || cat.includes("ai")) {
        gradient = "from-purple-100/90 via-fuchsia-50 to-cyan-100/80 dark:from-purple-950/70 dark:via-slate-900 dark:to-cyan-950/60";
        accentBorder = "border-purple-500/30 dark:border-purple-500/40";
        accentGlow = "bg-purple-500/15 dark:bg-purple-500/20";
        icon = <Sparkles size={32} className="text-purple-600 dark:text-purple-400" />;
        label = "AI & Systems";
    } else if (cat.includes("web") || cat.includes("software")) {
        gradient = "from-blue-100/90 via-slate-50 to-teal-100/80 dark:from-blue-950/70 dark:via-slate-900 dark:to-teal-950/60";
        accentBorder = "border-teal-500/30 dark:border-teal-500/40";
        accentGlow = "bg-teal-500/15 dark:bg-teal-500/20";
        icon = <Layers size={32} className="text-teal-600 dark:text-teal-400" />;
        label = "Software Architecture";
    } else if (cat.includes("cloud") || cat.includes("data")) {
        gradient = "from-sky-100/90 via-blue-50 to-indigo-100/80 dark:from-sky-950/70 dark:via-slate-900 dark:to-blue-950/60";
        accentBorder = "border-sky-500/30 dark:border-sky-500/40";
        accentGlow = "bg-sky-500/15 dark:bg-sky-500/20";
        icon = <Cloud size={32} className="text-sky-600 dark:text-sky-400" />;
        label = "Cloud & Data";
    } else if (cat.includes("guide") || cat.includes("tip")) {
        gradient = "from-amber-100/90 via-orange-50 to-rose-100/80 dark:from-amber-950/70 dark:via-slate-900 dark:to-rose-950/60";
        accentBorder = "border-amber-500/30 dark:border-amber-500/40";
        accentGlow = "bg-amber-500/15 dark:bg-amber-500/20";
        icon = <BookOpen size={32} className="text-amber-600 dark:text-amber-400" />;
        label = "Guides & Craft";
    }

    return (
        <div className={`relative w-full h-full min-h-[260px] md:min-h-[320px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden select-none`}>
            {/* Geometric Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.10] dark:opacity-[0.14]"
                style={{
                    backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Ambient Radial Blur Glow */}
            <div className={`absolute w-44 h-44 rounded-full ${accentGlow} blur-3xl pointer-events-none`} />

            {/* Diagonal Tech Lines Accent */}
            <svg
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none stroke-current"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line x1="0" y1="0" x2="100%" y2="100%" strokeWidth="1" strokeDasharray="6 6" />
                <line x1="100%" y1="0" x2="0" y2="100%" strokeWidth="1" strokeDasharray="6 6" />
            </svg>

            {/* Central Glassmorphic Badge */}
            <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center max-w-[80%]">
                <div className={`p-4 rounded-2xl bg-white/85 dark:bg-card/60 backdrop-blur-xl border ${accentBorder} shadow-lg dark:shadow-2xl transition-transform duration-500 group-hover:scale-110`}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-slate-700 dark:text-muted-foreground/80 font-semibold">
                        {label}
                    </span>
                    <p className="text-xs font-mono text-slate-500 dark:text-muted-foreground/60 line-clamp-1">
                        {tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
                    </p>
                </div>
            </div>

            {/* Subtle Editorial Watermark */}
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-400 dark:text-muted-foreground/40 tracking-wider">
                THE SIGNATURE • EDITORIAL
            </div>
        </div>
    );
}
