import React from "react";
import type { Metadata } from "next";
import {
    GraduationCap,
    FileText,
    Github,
    Linkedin,
    Mail,
    Cpu,
    Server,
    Terminal,
    Sparkles,
    ArrowUpRight,
    CheckCircle2
} from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/lib/portfolio-config";
import { LiveGitHubSection } from "@/components/portfolio/LiveGitHubSection";

export const metadata: Metadata = {
    title: "About | Signature",
    description: "Systems architecture, edge-deployed AI models, and technical dispatches from Keerthi Raajan.",
};

const CINZEL_S_PATH = "M20.36 32.83L20.83 33.19Q18.77 36.49 18.77 39.95L18.77 39.95Q18.77 43.71 21.50 46.81L21.50 46.81Q23 48.56 25.29 49.54Q27.59 50.52 30.32 50.52Q33.06 50.52 35.22 49.49L35.22 49.49Q39.56 47.38 39.56 42.58L39.56 42.58Q39.56 40.77 38.35 38.76Q37.13 36.75 34.71 35.15L34.71 35.15L25.94 29.27Q20.83 26.07 20.83 21.01L20.83 21.01Q20.83 20.49 20.88 19.98L20.88 19.98Q21.19 16 24.05 13.50Q26.92 11 31.72 11L31.72 11Q34.66 11 38.84 11.52L38.84 11.52L42.04 11.52L41.36 19.10L40.90 19.10Q40.85 16.42 38.84 14.79Q36.82 13.17 33.52 13.17L33.52 13.17Q29.50 13.17 27.69 15.59L27.69 15.59Q26.81 16.83 26.81 18.28Q26.81 19.72 27.69 20.73Q28.57 21.73 30.48 22.92L30.48 22.92L40.13 29.21Q43.07 31.12 44.72 33.70L44.72 33.70Q46.68 36.75 46.68 39.95L46.68 39.95Q46.68 42.01 45.83 44.31Q44.98 46.60 43.04 48.56Q41.11 50.52 38.06 51.76Q35.02 53 31.33 53Q27.64 53 24.65 51.71L24.65 51.71Q19.13 49.39 17.63 43.61L17.63 43.61Q17.32 42.37 17.32 41.03L17.32 41.03Q17.32 36.70 20.36 32.83L20.36 32.83Z";

export default function AboutPage() {
    const personal = PORTFOLIO_CONFIG.personal;
    const metrics = PORTFOLIO_CONFIG.metrics;
    const flagship = PORTFOLIO_CONFIG.flagshipSystems;
    const experience = PORTFOLIO_CONFIG.experience;
    const arsenal = PORTFOLIO_CONFIG.arsenal;
    const education = PORTFOLIO_CONFIG.education;
    const publications = PORTFOLIO_CONFIG.publications;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
            {/* 1. Hero: The Monogram Identity (Zero Headshot Photos) */}
            <section className="relative p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
                {/* Ambient Topaz Top Glow */}
                <div className="absolute -top-24 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    {/* Brand Monogram Squircle */}
                    <div className="flex items-center gap-6">
                        <div className="relative group shrink-0">
                            {/* Outer pulsing ring */}
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/30 to-amber-500/20 blur-sm group-hover:blur-md transition-all duration-300" />
                            
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border border-primary/40 flex items-center justify-center shadow-xl shadow-black/40 overflow-hidden">
                                <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
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

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono font-medium text-primary mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span>Signature • Author</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                {personal.name}
                            </h1>
                            <p className="text-sm sm:text-base font-medium text-primary/90 mt-1">
                                {personal.title}
                            </p>
                        </div>
                    </div>

                    {/* Social Uplink Pills */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <a
                            href={personal.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200"
                        >
                            <Github size={15} className="text-primary" />
                            <span>GitHub</span>
                            <ArrowUpRight size={12} className="text-muted-foreground" />
                        </a>

                        <a
                            href={personal.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/80 bg-secondary/40 hover:bg-secondary text-xs font-mono text-foreground hover:border-primary/40 transition-all duration-200"
                        >
                            <Linkedin size={15} className="text-primary" />
                            <span>LinkedIn</span>
                            <ArrowUpRight size={12} className="text-muted-foreground" />
                        </a>

                        <a
                            href={personal.social.email}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
                        >
                            <Mail size={15} />
                            <span>Contact</span>
                        </a>
                    </div>
                </div>

                {/* Tagline / Ethos Statement */}
                <div className="mt-8 pt-6 border-t border-border/60">
                    <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed max-w-3xl">
                        &ldquo;{personal.tagline}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-3xl">
                        {personal.summary}
                    </p>
                </div>
            </section>

            {/* 2. High-Impact Metric Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={idx}
                            className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200 group flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-primary">
                                    {metric.value}
                                </span>
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">
                                    {metric.label}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {metric.detail}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* 3. Flagship Systems Bento Grid */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div>
                        <div className="flex items-center gap-2">
                            <Cpu size={18} className="text-primary" />
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Flagship Systems Architecture
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Engineered AI architectures, distributed edge frameworks, and defense solutions.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {flagship.map((sys) => {
                        const Icon = sys.icon;
                        return (
                            <div
                                key={sys.id}
                                className="group relative p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-secondary text-primary border border-primary/20">
                                            {sys.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                            {sys.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                                            {sys.summary}
                                        </p>
                                    </div>

                                    {/* System Metrics */}
                                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs font-mono">
                                        {Object.entries(sys.metrics).map(([key, val]) => (
                                            <div key={key}>
                                                <span className="text-[10px] text-muted-foreground uppercase block truncate">
                                                    {key}
                                                </span>
                                                <span className="text-xs font-bold text-foreground truncate block">
                                                    {val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-border/40 flex flex-wrap gap-1.5">
                                    {sys.tech.map((t) => (
                                        <span
                                            key={t}
                                            className="px-2 py-0.5 text-[11px] font-mono rounded bg-secondary/80 text-muted-foreground"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. Live GitHub Repositories Embed */}
            <LiveGitHubSection />

            {/* 5. Systems Engineering Experience (NetApp & Zoho) */}
            <section className="space-y-6">
                <div className="pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <Server size={18} className="text-primary" />
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Systems Engineering Milestones
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        High-availability distributed architectures, automated NAS infrastructure, and production deployments.
                    </p>
                </div>

                <div className="space-y-6">
                    {experience.map((job) => (
                        <div
                            key={job.id}
                            className="p-6 sm:p-7 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {job.role}
                                    </h3>
                                    <p className="text-sm font-semibold text-primary">
                                        {job.company}
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground px-2.5 py-1 rounded-md bg-secondary/80 border border-border/60 self-start sm:self-auto">
                                    {job.period}
                                </span>
                            </div>

                            <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                                {job.description}
                            </p>

                            <ul className="space-y-2 mb-4">
                                {job.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
                                {job.tech.map((t) => (
                                    <span
                                        key={t}
                                        className="px-2 py-0.5 rounded-md bg-secondary/60 text-[11px] font-mono text-muted-foreground"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Technical Arsenal */}
            <section className="space-y-6">
                <div className="pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <Terminal size={18} className="text-primary" />
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Technical Arsenal
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Frameworks, languages, systems primitives, and platforms utilized in production.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-card border border-border/80">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-3">
                            AI & Deep Learning
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {arsenal.ai_ml.map((tool) => (
                                <span
                                    key={tool}
                                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-secondary/60 text-foreground border border-border/50"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/80">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-3">
                            Cloud & DevOps
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {arsenal.cloud_devops.map((tool) => (
                                <span
                                    key={tool}
                                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-secondary/60 text-foreground border border-border/50"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/80">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-3">
                            Web & Microservices
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {arsenal.web_systems.map((tool) => (
                                <span
                                    key={tool}
                                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-secondary/60 text-foreground border border-border/50"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/80">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-3">
                            Data & Storage Infrastructure
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {arsenal.data_infra.map((tool) => (
                                <span
                                    key={tool}
                                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-secondary/60 text-foreground border border-border/50"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Education & Elsevier Research */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Foundation */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-bold text-lg pb-2 border-b border-border/40">
                        <GraduationCap size={20} className="text-primary" />
                        <h3>Academic Foundation</h3>
                    </div>

                    <div className="space-y-4">
                        {education.map((edu, idx) => (
                            <div key={idx} className="space-y-1">
                                <h4 className="font-bold text-foreground text-sm">{edu.degree}</h4>
                                <p className="text-xs text-primary font-medium">{edu.institution}</p>
                                <p className="text-xs text-muted-foreground">{edu.detail} • <span className="font-mono">{edu.year}</span></p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Published Research */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-bold text-lg pb-2 border-b border-border/40">
                        <FileText size={20} className="text-primary" />
                        <h3>Published Research</h3>
                    </div>

                    <div className="space-y-4">
                        {publications.map((pub, idx) => (
                            <div key={idx} className="space-y-1">
                                <h4 className="font-bold text-foreground text-sm">{pub.title}</h4>
                                <p className="text-xs text-primary font-medium">{pub.publisher} • <span className="font-mono">{pub.year}</span></p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{pub.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Behind Signature: Publication Ethos */}
            <section className="p-6 sm:p-8 rounded-2xl bg-secondary/30 border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Behind Signature</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                    A Pure Technical Canvas
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    This publication is not an agency pitch, a marketing funnel, or a corporate brochure. It is an unvarnished technical chronicle—capturing real system overcomings, deep architectural post-mortems, edge AI experiments, and lessons learned while scaling distributed backends. Everything published here is built with craft, curiosity, and uncompromising attention to detail.
                </p>
            </section>
        </div>
    );
}
