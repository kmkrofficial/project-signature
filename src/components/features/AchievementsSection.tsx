"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { GraduationCap, FileText, ExternalLink, Download, Calendar, Award } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useTheme } from "@/components/layout/ThemeProvider";

export function AchievementsSection() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";
    const [education, setEducation] = useState<any[]>([]);
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eduSnap, papersSnap] = await Promise.all([
                    getDocs(collection(db, "education")),
                    getDocs(collection(db, "papers"))
                ]);

                setEducation(eduSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setPapers(papersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching achievements:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <section id="achievements" className="py-12 relative overflow-hidden">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Award size={20} />
                        <span className="font-mono text-sm tracking-wider">
                            {isDark ? "SYSTEM_ACCOLADES" : "Achievements"}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {isDark ? "Kernel Training & Documentation" : "Education & Research"}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Education Column */}
                    {/* Education Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded text-primary">
                                <GraduationCap size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">
                                {isDark ? "Kernel Training" : "Education"}
                            </h3>
                        </div>

                        <div className="relative border-l-2 border-border ml-3 space-y-0">
                            {education.map((edu, index) => (
                                <motion.div
                                    key={edu.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-8 pb-12 last:pb-0 group"
                                >
                                    {/* Marker Dot */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-primary group-hover:scale-110 transition-all duration-300" />

                                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">
                                        {edu.degree}
                                    </h4>
                                    <p className="text-lg text-muted-foreground mt-1">{edu.institution}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm font-mono text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {edu.year}
                                        </span>
                                        {edu.grade && (
                                            <span className="text-primary">
                                                Score: {edu.grade}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Research Papers Column */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded text-primary">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">
                                {isDark ? "System Documentation" : "Research Papers"}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {papers.map((paper, index) => (
                                <motion.div
                                    key={paper.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                {paper.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {paper.abstract}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {paper.tags && paper.tags.map((tag: string) => (
                                                    <span key={tag} className="text-xs px-2 py-1 bg-secondary rounded font-mono text-muted-foreground">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {paper.link && (
                                            <a
                                                href={paper.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-primary/10 text-primary rounded transition-colors"
                                            >
                                                <ExternalLink size={20} />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container >
        </section >
    );
}
