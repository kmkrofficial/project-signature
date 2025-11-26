"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Box, ExternalLink, Maximize2, Terminal, X, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Project {
    id: string;
    title: string;
    description: string;
    tech: string[];
    link?: string;
    github?: string;
}

export function ProjectsSection() {
    const { theme } = useTheme();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "portfolio"));
            const projectsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title || "",
                description: doc.data().description || "",
                tech: doc.data().tech || [],
                link: doc.data().link,
                github: doc.data().github,
            }));
            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedProject = projects.find(p => p.id === selectedId);

    return (
        <Section id="projects" className="bg-secondary/5 !py-8 !md:py-12">
            <Container>
                <div className="flex items-center gap-2 mb-8">
                    <Box className="text-primary" />
                    <h2 className="text-3xl font-bold tracking-tight">
                        {theme === "deepSystem" ? "Deployed Modules" : "Featured Projects"}
                    </h2>
                    <div className="h-px flex-1 bg-border ml-4" />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <Box className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <p className="text-muted-foreground text-lg">No projects deployed yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                layoutId={`card-${project.id}`}
                                onClick={() => setSelectedId(project.id)}
                                className="cursor-pointer group relative bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors h-full flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded bg-primary/10 text-primary">
                                        <Terminal size={24} />
                                    </div>
                                    <Maximize2 size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <motion.h3 className="text-xl font-bold mb-2">
                                    {project.title}
                                </motion.h3>

                                <motion.p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                                    {project.description}
                                </motion.p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {project.tech.slice(0, 3).map((tech) => (
                                        <span key={tech} className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                            {tech}
                                        </span>
                                    ))}
                                    {project.tech.length > 3 && (
                                        <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                                            +{project.tech.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {selectedId && selectedProject && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                layoutId={`card-${selectedId}`}
                                className="w-full max-w-2xl bg-card border border-primary/30 rounded-lg shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Terminal Header */}
                                <div className="bg-secondary/50 p-3 flex items-center justify-between border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={16} className="text-primary" />
                                        <span className="text-xs font-mono text-muted-foreground">root@system:~/modules/{selectedProject.id}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <motion.h3 className="text-2xl font-bold mb-1">
                                                {selectedProject.title}
                                            </motion.h3>
                                        </div>
                                        <Terminal size={32} className="text-muted-foreground/20" />
                                    </div>

                                    <motion.p className="text-muted-foreground mb-8">
                                        {selectedProject.description}
                                    </motion.p>

                                    <div className="space-y-4 mb-8">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tech Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tech.map((tech) => (
                                                <span key={tech} className="text-xs font-mono px-2 py-1 rounded border border-primary/20 text-primary bg-primary/5">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {selectedProject.link && (
                                            <a
                                                href={selectedProject.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-primary text-primary-foreground rounded font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                                Live Demo
                                            </a>
                                        )}
                                        {selectedProject.github && (
                                            <a
                                                href={selectedProject.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 border border-border rounded font-bold text-sm flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
                                            >
                                                <ExternalLink size={16} />
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Container>
        </Section>
    );
}
