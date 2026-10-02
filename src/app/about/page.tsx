import React from "react";
import type { Metadata } from "next";
import {
    GraduationCap,
    FileText,
    Github,
    Linkedin,
    Mail,
    Shield,
    Globe,
    Server,
    Terminal,
    Code,
    Cpu,
    Sparkles,
    ArrowUpRight
} from "lucide-react";
import { PORTFOLIO_CONFIG } from "@/lib/portfolio-config";

export const metadata: Metadata = {
    title: "About the Author | Keerthi's Signature",
    description: "Background, engineering philosophy, selected projects, and career timeline of Keerthi Raajan.",
};

const PROJECT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    "log-sentinel": Shield,
    "vision360": Globe,
    "seas": Server,
    "chatty": Terminal,
};

export default function AboutPage() {
    const personal = PORTFOLIO_CONFIG.personal;
    const projects = PORTFOLIO_CONFIG.projects;
    const experience = PORTFOLIO_CONFIG.experience;
    const skills = PORTFOLIO_CONFIG.skills;
    const education = PORTFOLIO_CONFIG.education;
    const publications = PORTFOLIO_CONFIG.publications;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            {/* Header / Executive Bio */}
            <section className="mb-16 border-b border-border/60 pb-14">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-wider uppercase mb-2">
                            <Sparkles size={14} />
                            <span>Software Developer & Builder</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                            {personal.name}
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground mt-2">
                            {personal.title} • {personal.location}
                        </p>
                    </div>

                    {/* Socials & Connect */}
                    <div className="flex items-center gap-2.5">
                        {personal.social.github && (
                            <a
                                href={personal.social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary hover:text-foreground text-muted-foreground transition-colors"
                                title="GitHub"
                            >
                                <Github size={18} />
                            </a>
                        )}
                        {personal.social.linkedin && (
                            <a
                                href={personal.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary hover:text-foreground text-muted-foreground transition-colors"
                                title="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                        )}
                        <a
                            href={`mailto:${personal.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity"
                        >
                            <Mail size={16} />
                            <span>Contact Me</span>
                        </a>
                    </div>
                </div>

                <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    <p>
                        I build reliable software and intelligent tools that solve everyday problems. My work focuses on creating fast, dependable web applications and integrating practical AI features that genuinely help people.
                    </p>
                    <p>
                        Over the past several years, I have built systems supporting millions of users, designed high-performance cloud tools, and developed award-winning AI projects for computer vision and security.
                    </p>
                </div>
            </section>

            {/* Selected Projects Showcase */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Selected Projects
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Featured projects, web apps, and award-winning solutions.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => {
                        const Icon = PROJECT_ICONS[project.id] || Code;
                        return (
                            <div
                                key={project.id}
                                className="p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            <Icon size={20} />
                                        </div>
                                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/50">
                                            {project.type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                                        {project.name}
                                    </h3>

                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {project.description}
                                    </p>

                                    {/* Metrics Highlight */}
                                    {project.metrics && (
                                        <div className="grid grid-cols-2 gap-2 mb-5 p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs font-mono">
                                            {Object.entries(project.metrics).map(([k, v]) => (
                                                <div key={k}>
                                                    <span className="text-muted-foreground block text-[10px] uppercase">{k}</span>
                                                    <span className="text-foreground font-semibold">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                                    {project.tech.map((t) => (
                                        <span
                                            key={t}
                                            className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] font-mono text-muted-foreground"
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

            {/* Career Timeline */}
            <section className="mb-16">
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Work Experience
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Career journey and past roles.
                    </p>
                </div>

                <div className="relative border-l border-border/80 ml-3 sm:ml-4 space-y-10 pl-6 sm:pl-8">
                    {experience.map((job) => (
                        <div key={job.id} className="relative group">
                            {/* Dot on timeline */}
                            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        {job.role}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {job.company}
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-md border border-border/50 self-start sm:self-auto">
                                    {job.period}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                {job.description}
                            </p>

                            {job.achievements && job.achievements.length > 0 && (
                                <ul className="space-y-1.5 mb-4 text-xs sm:text-sm text-muted-foreground">
                                    {job.achievements.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">▹</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {job.tech.map((t) => (
                                    <span
                                        key={t}
                                        className="px-2 py-0.5 rounded-md bg-secondary/40 text-[11px] font-mono text-muted-foreground"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technical Skills Matrix */}
            <section className="mb-16">
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Skills & Technologies
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tools, languages, and technologies I work with.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {skills.map((category) => (
                        <div
                            key={category.category}
                            className="p-5 rounded-2xl bg-card border border-border/80"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                                <Cpu size={16} />
                                <span>{category.category}</span>
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {category.items.map((item) => (
                                    <span
                                        key={item.name}
                                        className="px-2.5 py-1 rounded-lg bg-secondary/50 text-xs font-mono text-foreground border border-border/60 hover:border-primary/40 transition-colors"
                                    >
                                        {item.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education & Publications */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Education */}
                    <div>
                        <div className="flex items-center gap-2 text-foreground font-bold text-xl mb-4">
                            <GraduationCap size={20} className="text-primary" />
                            <h3>Education</h3>
                        </div>

                        <div className="space-y-4">
                            {education.map((edu, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-card border border-border/80">
                                    <h4 className="font-bold text-foreground text-sm">{edu.degree}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{edu.institution}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground">
                                        <span>{edu.year}</span>
                                        {edu.grade && (
                                            <span className="text-primary font-medium">{edu.grade}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Publications */}
                    <div>
                        <div className="flex items-center gap-2 text-foreground font-bold text-xl mb-4">
                            <FileText size={20} className="text-primary" />
                            <h3>Publications</h3>
                        </div>

                        <div className="space-y-4">
                            {publications.map((pub, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-card border border-border/80 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm">{pub.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {pub.publisher} • {pub.year}
                                        </p>
                                    </div>
                                    {pub.link && pub.link !== "#" && (
                                        <a
                                            href={pub.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                                        >
                                            <span>Read Paper</span>
                                            <ArrowUpRight size={12} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
