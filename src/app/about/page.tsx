import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
    Github,
    Linkedin,
    Mail,
    Rss,
    ArrowUpRight,
    Sparkles,
    Cpu,
    Server,
    Layers,
    BookOpen
} from "lucide-react";
import { LiveGitHubSection } from "@/components/portfolio/LiveGitHubSection";

export const metadata: Metadata = {
    title: "About | Signature",
    description: "About Keerthi Raajan and Signature—a technical publication focused on software architecture, systems, and AI.",
};

const CINZEL_S_PATH = "M20.36 32.83L20.83 33.19Q18.77 36.49 18.77 39.95L18.77 39.95Q18.77 43.71 21.50 46.81L21.50 46.81Q23 48.56 25.29 49.54Q27.59 50.52 30.32 50.52Q33.06 50.52 35.22 49.49L35.22 49.49Q39.56 47.38 39.56 42.58L39.56 42.58Q39.56 40.77 38.35 38.76Q37.13 36.75 34.71 35.15L34.71 35.15L25.94 29.27Q20.83 26.07 20.83 21.01L20.83 21.01Q20.83 20.49 20.88 19.98L20.88 19.98Q21.19 16 24.05 13.50Q26.92 11 31.72 11L31.72 11Q34.66 11 38.84 11.52L38.84 11.52L42.04 11.52L41.36 19.10L40.90 19.10Q40.85 16.42 38.84 14.79Q36.82 13.17 33.52 13.17L33.52 13.17Q29.50 13.17 27.69 15.59L27.69 15.59Q26.81 16.83 26.81 18.28Q26.81 19.72 27.69 20.73Q28.57 21.73 30.48 22.92L30.48 22.92L40.13 29.21Q43.07 31.12 44.72 33.70L44.72 33.70Q46.68 36.75 46.68 39.95L46.68 39.95Q46.68 42.01 45.83 44.31Q44.98 46.60 43.04 48.56Q41.11 50.52 38.06 51.76Q35.02 53 31.33 53Q27.64 53 24.65 51.71L24.65 51.71Q19.13 49.39 17.63 43.61L17.63 43.61Q17.32 42.37 17.32 41.03L17.32 41.03Q17.32 36.70 20.36 32.83L20.36 32.83Z";

const TOPICS = [
    {
        icon: Server,
        title: "Systems & Architecture",
        description: "Deep dives on high-throughput backend services, distributed data pipelines, and protocol migrations.",
    },
    {
        icon: Cpu,
        title: "Artificial Intelligence",
        description: "Practical engineering around LLM pipelines, autonomous agent workflows, and edge deployment.",
    },
    {
        icon: Layers,
        title: "Engineering Craft & Guides",
        description: "Lessons learned while designing, debugging, and maintaining modern production software.",
    },
];

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-10 sm:pb-16 space-y-10 sm:space-y-12">
            {/* 1. Header Profile */}
            <section className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border/80 overflow-hidden shadow-xs">
                {/* Ambient Subtle Topaz Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Monogram Seal */}
                    <div className="relative shrink-0">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-primary/40 flex items-center justify-center shadow-lg shadow-black/30 overflow-hidden">
                            <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14" fill="none">
                                <defs>
                                    <linearGradient id="aboutSGrad" x1="16" y1="11" x2="48" y2="53" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#fef08a" />
                                        <stop offset="50%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#d97706" />
                                    </linearGradient>
                                    <radialGradient id="aboutAura" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                <rect width="64" height="64" fill="url(#aboutAura)" />
                                <path d={CINZEL_S_PATH} fill="url(#aboutSGrad)" />
                            </svg>
                        </div>
                    </div>

                    {/* Author Intro */}
                    <div className="flex-1 space-y-1.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            Keerthi Raajan K M
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground font-sans">
                            Software Engineer & Systems Builder
                        </p>
                    </div>
                </div>

                {/* Social Connect Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-border/60">
                    <a
                        href="https://github.com/kmkrofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200"
                    >
                        <Github size={14} className="text-primary" />
                        <span>GitHub</span>
                        <ArrowUpRight size={11} className="text-muted-foreground" />
                    </a>

                    <a
                        href="https://linkedin.com/in/keerthiraajan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200"
                    >
                        <Linkedin size={14} className="text-primary" />
                        <span>LinkedIn</span>
                        <ArrowUpRight size={11} className="text-muted-foreground" />
                    </a>

                    <a
                        href="mailto:kmkrworks@gmail.com"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200"
                    >
                        <Mail size={14} className="text-primary" />
                        <span>Email</span>
                    </a>

                    <a
                        href="/feed.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200 ml-auto"
                    >
                        <Rss size={14} className="text-amber-500" />
                        <span>RSS Feed</span>
                    </a>
                </div>
            </section>

            {/* 2. Personal Story & Background */}
            <section className="space-y-4 text-sm sm:text-base text-foreground/90 leading-relaxed">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    About Me
                </h2>
                <p>
                    I&apos;m Keerthi Raajan, a software engineer with a deep interest in backend architectures, distributed data systems, and modern AI engineering.
                </p>
                <p className="text-muted-foreground">
                    Over the years, I&apos;ve enjoyed building resilient systems, working with cloud infrastructure, and exploring edge computing. When developing software, I gravitate toward understanding how things work under the hood—from packet transport and memory synchronization to cache invalidation and agentic workflows.
                </p>
                <p className="text-muted-foreground">
                    Outside of building, writing is how I clarify my own thinking and share insights with other developers.
                </p>
            </section>

            {/* 3. Topics Explored on Signature */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        What You&apos;ll Find on Signature
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    This publication covers the technical areas I spend most of my time exploring:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        return (
                            <div
                                key={topic.title}
                                className="p-5 rounded-xl bg-card border border-border/80 flex flex-col justify-between hover:border-primary/40 transition-colors"
                            >
                                <div className="space-y-2.5">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        {topic.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {topic.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. Live Open Source Codebase Feed */}
            <LiveGitHubSection />

            {/* 5. Publication Ethos */}
            <section className="p-6 sm:p-7 rounded-2xl bg-secondary/30 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Publication Ethos</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                    An Independent Technical Journal
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Signature was created as an honest, unfiltered space for technical writing. There are no marketing funnels, sponsored placements, or shallow summaries. Every article is written with care, curiosity, and a focus on practical engineering insights.
                </p>
            </section>
        </div>
    );
}
