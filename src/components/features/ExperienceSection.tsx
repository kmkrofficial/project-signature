"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { FileText, GitCommit, Terminal } from "lucide-react";

export function ExperienceSection() {
    return (
        <Section id="experience">
            <Container>
                <div className="flex items-center gap-2 mb-12">
                    <FileText className="text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                    <div className="h-px flex-1 bg-border ml-4" />
                </div>

                <div className="relative border-l border-border ml-3 md:ml-6 space-y-12">
                    {PORTFOLIO_CONFIG.experience.map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-8 md:pl-12"
                        >
                            {/* Timeline Node */}
                            <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary ring-4 ring-background" />

                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
                                {/* Metadata */}
                                <div className="md:w-48 flex-shrink-0 pt-1">
                                    <div className="font-mono text-sm text-primary mb-1">{exp.period}</div>
                                    <div className="text-muted-foreground text-sm">{exp.company}</div>
                                    <div className="text-xs text-muted-foreground/50 font-mono mt-2">ID: {exp.id.toUpperCase()}</div>
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 bg-card border border-border p-6 rounded-lg relative overflow-hidden group-hover:border-primary/30 transition-colors">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />

                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        {exp.role}
                                        <span className="text-xs font-normal font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                                            v.{PORTFOLIO_CONFIG.experience.length - index}.0
                                        </span>
                                    </h3>

                                    <p className="text-muted-foreground mb-4">{exp.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {exp.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-primary mt-1">›</span>
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-wrap gap-2">
                                        {exp.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="text-xs font-mono px-2 py-1 rounded border border-border bg-secondary/20 text-muted-foreground"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
