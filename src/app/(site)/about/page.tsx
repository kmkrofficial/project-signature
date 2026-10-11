import React from "react";
import type { Metadata } from "next";
import {
    Mail,
    Rss,
    ArrowUpRight,
    Sparkles,
    Cpu,
    Server,
    Layers,
    BookOpen
} from "lucide-react";
import { GitHubRepos } from "@/components/about/GitHubRepos";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSiteConfig } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
    title: "About",
    alternates: { canonical: "/about" },
    description: "Signature is a notebook of how software actually behaves in production: the failures, trade-offs and small discoveries behind systems and AI.",
};

const CINZEL_S_PATH = "M20.36 32.83L20.83 33.19Q18.77 36.49 18.77 39.95L18.77 39.95Q18.77 43.71 21.50 46.81L21.50 46.81Q23 48.56 25.29 49.54Q27.59 50.52 30.32 50.52Q33.06 50.52 35.22 49.49L35.22 49.49Q39.56 47.38 39.56 42.58L39.56 42.58Q39.56 40.77 38.35 38.76Q37.13 36.75 34.71 35.15L34.71 35.15L25.94 29.27Q20.83 26.07 20.83 21.01L20.83 21.01Q20.83 20.49 20.88 19.98L20.88 19.98Q21.19 16 24.05 13.50Q26.92 11 31.72 11L31.72 11Q34.66 11 38.84 11.52L38.84 11.52L42.04 11.52L41.36 19.10L40.90 19.10Q40.85 16.42 38.84 14.79Q36.82 13.17 33.52 13.17L33.52 13.17Q29.50 13.17 27.69 15.59L27.69 15.59Q26.81 16.83 26.81 18.28Q26.81 19.72 27.69 20.73Q28.57 21.73 30.48 22.92L30.48 22.92L40.13 29.21Q43.07 31.12 44.72 33.70L44.72 33.70Q46.68 36.75 46.68 39.95L46.68 39.95Q46.68 42.01 45.83 44.31Q44.98 46.60 43.04 48.56Q41.11 50.52 38.06 51.76Q35.02 53 31.33 53Q27.64 53 24.65 51.71L24.65 51.71Q19.13 49.39 17.63 43.61L17.63 43.61Q17.32 42.37 17.32 41.03L17.32 41.03Q17.32 36.70 20.36 32.83L20.36 32.83Z";

const TOPICS = [
    {
        icon: Server,
        title: "Where systems bend",
        description: "Caches that stampede, queues that back up, migrations that go quiet. What breaks under load, and why.",
    },
    {
        icon: Cpu,
        title: "AI, minus the hype",
        description: "What changes when a model becomes one component among many, with timeouts, retries and a budget.",
    },
    {
        icon: Layers,
        title: "Field notes",
        description: "Short, practical write-ups for the problem you are staring at right now.",
    },
];

export default async function AboutPage() {
    const config = await getSiteConfig();
    const personJsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: config.author,
        url: absoluteUrl("/about"),
        jobTitle: "Software Engineer",
        sameAs: [config.github, config.linkedin, config.twitter].filter(Boolean),
    };

    return (
        <PageContainer className="space-y-10 sm:space-y-12">
            <JsonLd data={personJsonLd} />
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
                            Notes on systems, AI and the code in between
                        </p>
                    </div>
                </div>

                {/* Social Connect Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-border/60">
                    <a
                        href="https://github.com/kmkrofficial"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group lift press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40"
                    >
                        <GitHubIcon size={13} className="text-primary" />
                        <span>GitHub</span>
                        <ArrowUpRight size={11} className="text-muted-foreground transition-transform duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>

                    <a
                        href="https://linkedin.com/in/keerthiraajan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group lift press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40"
                    >
                        <LinkedInIcon size={13} className="text-primary" />
                        <span>LinkedIn</span>
                        <ArrowUpRight size={11} className="text-muted-foreground transition-transform duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>

                    <a
                        href="mailto:kmkrworks@gmail.com"
                        className="group lift press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40"
                    >
                        <Mail size={14} className="text-primary" />
                        <span>Email</span>
                    </a>

                    <a
                        href="/feed.xml"
                        className="group lift press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 ml-auto"
                    >
                        <Rss size={14} className="text-amber-500" />
                        <span>RSS Feed</span>
                    </a>
                </div>
            </section>

            {/* 2. What this place is for */}
            <section className="reveal space-y-4 text-sm sm:text-base text-foreground/90 leading-relaxed">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Why this exists
                </h2>
                <p>
                    Most software writing stops at the moment things work. I have always been more pulled by what happens next: the 3 a.m. surprise, the assumption that quietly stopped being true, the fix that took one line and two days to find.
                </p>
                <p className="text-muted-foreground">
                    Signature is my recollection of those moments. Every article begins with a problem I actually sat in front of, and I try to put you in that chair with me. You get the first hunch, the theory I was sure about, the thing that proved me wrong, and the quiet click when it finally made sense.
                </p>
                <p className="text-muted-foreground">
                    I leave the dead ends in on purpose. They are usually where I learned the most, and a tidy write-up that hides them makes the answer look easier than it was. If I lost an afternoon to a wrong turn, you should get to skip it, and see why it was tempting.
                </p>
                <p className="text-muted-foreground">
                    I write because explaining something is how I find out whether I really understand it. If a piece leaves you with one idea you can use on Monday, or just the feeling that someone else got stuck here too, it did its job.
                </p>
            </section>

            {/* 3. Topics Explored on Signature */}
            <section className="reveal space-y-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        What you&apos;ll find here
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Three recurring threads, each written to be read in one sitting:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        return (
                            <div
                                key={topic.title}
                                className="group lift p-5 rounded-xl bg-card border border-border/80 flex flex-col justify-between hover:border-primary/40"
                            >
                                <div className="space-y-2.5">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-110">
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
            <GitHubRepos />

            {/* 5. How it is written */}
            <section className="reveal p-6 sm:p-7 rounded-2xl bg-secondary/30 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>How it is written</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Independent, unhurried, ad-free
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    No sponsors, no funnels, no listicles. Articles are published when they are ready, corrected in the open when they are wrong, and written for a reader who is smart but short on time.
                </p>
            </section>
        </PageContainer>
    );
}
