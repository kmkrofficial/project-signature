"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { Award, Book, GraduationCap } from "lucide-react";

export function AchievementsSection() {
    return (
        <Section id="achievements">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Education */}
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <GraduationCap className="text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">Kernel Training</h2>
                        </div>

                        <div className="space-y-6">
                            {PORTFOLIO_CONFIG.education.map((edu, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                                >
                                    <div className="p-2 rounded bg-secondary text-primary">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{edu.degree}</h3>
                                        <div className="text-muted-foreground text-sm">{edu.institution}</div>
                                        <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                                            <span className="text-primary">{edu.year}</span>
                                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500">
                                                Score: {edu.grade}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Publications */}
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <Book className="text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">System Documentation</h2>
                        </div>

                        <div className="space-y-6">
                            {PORTFOLIO_CONFIG.publications.map((pub, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Book size={64} />
                                    </div>

                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                        {pub.title}
                                    </h3>
                                    <div className="text-muted-foreground text-sm mb-4">
                                        Published in <span className="font-semibold text-foreground">{pub.publisher}</span>
                                    </div>

                                    <a
                                        href={pub.link}
                                        className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:underline"
                                    >
                                        Read Paper <Award size={14} />
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
