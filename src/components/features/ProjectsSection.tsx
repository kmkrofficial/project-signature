"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { Box, ExternalLink, Maximize2, Terminal, X } from "lucide-react";
import { clsx } from "clsx";

export function ProjectsSection() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Section id="projects" className="bg-secondary/5">
            <Container>
                <div className="flex items-center gap-2 mb-12">
                    <Box className="text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">Deployed Modules</h2>
                    <div className="h-px flex-1 bg-border ml-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PORTFOLIO_CONFIG.projects.map((project) => (
                        <motion.div
                            key={project.id}
                            layoutId={`card-${project.id}`}
                            onClick={() => setSelectedId(project.id)}
                            className="cursor-pointer group relative bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded bg-primary/10 text-primary">
                                    <project.icon size={24} />
                                </div>
                                <Maximize2 size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <motion.h3 layoutId={`title-${project.id}`} className="text-xl font-bold mb-2">
                                {project.name}
                            </motion.h3>

                            <motion.p layoutId={`desc-${project.id}`} className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                {project.description}
                            </motion.p>

                            <div className="flex flex-wrap gap-2">
                                {project.tech.slice(0, 3).map((tech) => (
                                    <span key={tech} className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div
                                layoutId={`card-${selectedId}`}
                                className="w-full max-w-2xl bg-card border border-primary/30 rounded-lg shadow-2xl overflow-hidden"
                            >
                                {(() => {
                                    const project = PORTFOLIO_CONFIG.projects.find(p => p.id === selectedId)!;
                                    return (
                                        <>
                                            {/* Terminal Header */}
                                            <div className="bg-secondary/50 p-3 flex items-center justify-between border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    <Terminal size={16} className="text-primary" />
                                                    <span className="text-xs font-mono text-muted-foreground">root@system:~/modules/{project.id}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                                                    className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div>
                                                        <motion.h3 layoutId={`title-${project.id}`} className="text-2xl font-bold mb-1">
                                                            {project.name}
                                                        </motion.h3>
                                                        <span className="text-sm text-primary font-mono">{project.type}</span>
                                                    </div>
                                                    <project.icon size={32} className="text-muted-foreground/20" />
                                                </div>

                                                <motion.p layoutId={`desc-${project.id}`} className="text-muted-foreground mb-8">
                                                    {project.description}
                                                </motion.p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Metrics</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {Object.entries(project.metrics).map(([key, value]) => (
                                                                <div key={key} className="bg-secondary/20 p-3 rounded border border-border">
                                                                    <div className="text-xs text-muted-foreground mb-1">{key}</div>
                                                                    <div className="text-lg font-mono text-primary">{value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tech Stack</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.tech.map((tech) => (
                                                                <span key={tech} className="text-xs font-mono px-2 py-1 rounded border border-primary/20 text-primary bg-primary/5">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors">
                                                        <ExternalLink size={16} />
                                                        Launch Module
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Container>
        </Section>
    );
}
