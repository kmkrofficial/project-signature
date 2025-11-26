"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Briefcase, Calendar, Terminal } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Experience {
    id: string;
    role: string;
    company: string;
    period: string;
    description: string;
    achievements?: string[];
    techStack?: string[];
}

export function ExperienceSection() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";
    const [experience, setExperience] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "experience"));
                setExperience(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience)));
            } catch (error) {
                console.error("Error fetching experience:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExperience();
    }, []);

    return (
        <section id="experience" className="py-12 bg-secondary/5">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Terminal size={20} />
                        <span className="font-mono text-sm tracking-wider">
                            {isDark ? "SYSTEM_LOGS" : "Experience"}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {isDark ? "Professional Experience" : "Work History"}
                    </h2>
                </motion.div>

                <div className="space-y-8">
                    {experience.map((job, index) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card border border-border p-6 md:p-8 rounded-lg hover:border-primary/50 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="p-3 bg-primary/10 rounded text-primary h-fit w-fit">
                                    <Briefcase size={24} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                {job.role}
                                            </h3>
                                            <p className="text-lg text-muted-foreground">{job.company}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded w-fit">
                                            <Calendar size={14} />
                                            {job.period}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        {job.description}
                                    </p>

                                    {job.achievements && job.achievements.length > 0 && (
                                        <div className="mb-6 space-y-2">
                                            {job.achievements.map((achievement: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="text-primary mt-1">▹</span>
                                                    <span>{achievement}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {job.techStack && job.techStack.map((tech: string) => (
                                            <span
                                                key={tech}
                                                className="text-xs font-mono px-2 py-1 rounded bg-primary/5 border border-primary/20 text-primary"
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
        </section>
    );
}
