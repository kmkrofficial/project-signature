"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { Activity, Code2, Cpu, Database, Layers, Server, Terminal } from "lucide-react";
import { clsx } from "clsx";

const categoryIcons: Record<string, React.ReactNode> = {
    "AI / ML": <Cpu size={20} />,
    "Backend Engineering": <Server size={20} />,
    "Frontend & Cloud": <Layers size={20} />,
};

// Simple color mapping for tech stacks (in a real app, use actual SVGs)
const techColors: Record<string, string> = {
    "python": "text-blue-400",
    "pytorch": "text-orange-500",
    "langchain": "text-green-500",
    "tensorflow": "text-orange-400",
    "opencv": "text-red-500",
    "java": "text-red-400",
    "fastapi": "text-teal-400",
    "redis": "text-red-500",
    "kafka": "text-gray-400",
    "postgresql": "text-blue-300",
    "nextjs": "text-white",
    "react": "text-cyan-400",
    "docker": "text-blue-500",
    "gcp": "text-yellow-400",
    "typescript": "text-blue-400",
};

export function SkillsSection() {
    return (
        <Section id="skills" className="bg-secondary/5 relative overflow-hidden">
            {/* Background Grid Animation */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

            <Container className="relative z-10">
                <div className="flex items-center gap-2 mb-16">
                    <Activity className="text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">System Dependencies</h2>
                    <div className="h-px flex-1 bg-border ml-4" />
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {PORTFOLIO_CONFIG.skills.map((category, catIndex) => (
                        <div key={category.category}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20">
                                    {categoryIcons[category.category] || <Terminal size={20} />}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{category.category}</h3>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((skill, index) => (
                                    <motion.div
                                        key={skill.name}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: (catIndex * 0.1) + (index * 0.05) }}
                                        viewport={{ once: true }}
                                        className="group relative bg-card/50 backdrop-blur-sm border border-border p-4 rounded-lg hover:border-primary/50 hover:bg-card transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx("p-2 rounded bg-secondary/50", techColors[skill.icon] || "text-primary")}>
                                                    <Code2 size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base">{skill.name}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <span className="text-primary font-mono">{skill.projectCount}</span>
                                                        <span>Modules Deployed</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Proficiency Ring (Mini) */}
                                            <div className="relative w-8 h-8 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="16" cy="16" r="14" className="stroke-secondary fill-none" strokeWidth="2" />
                                                    <circle
                                                        cx="16" cy="16" r="14"
                                                        className="stroke-primary fill-none"
                                                        strokeWidth="2"
                                                        strokeDasharray={88}
                                                        strokeDashoffset={88 - (88 * skill.proficiency) / 100}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar Visual */}
                                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(skill.projectCount / 15) * 100}%` }} // Normalized to max 15 projects
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
