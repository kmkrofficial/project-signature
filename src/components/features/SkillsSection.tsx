"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Cpu, ChevronDown, ChevronUp, FolderGit2, X, Terminal } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "@/components/layout/ThemeProvider";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";

const CATEGORIES = [
    "AI & ML",
    "Cybersecurity",
    "Data Structures & Algorithms",
    "Cloud & DevOps",
    "Web Technologies",
    "Other"
];

export function SkillsSection() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";
    const [skills, setSkills] = useState<any[]>([]);
    const [openCategory, setOpenCategory] = useState<string | null>("AI & ML");
    const [selectedSkill, setSelectedSkill] = useState<any | null>(null);



    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "skills"));
                if (!querySnapshot.empty) {
                    setSkills(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    // Fallback to PORTFOLIO_CONFIG if Firestore is empty
                    const configSkills = PORTFOLIO_CONFIG.skills.flatMap(category =>
                        category.items.map(item => ({
                            id: item.name.toLowerCase().replace(/\s+/g, '-'),
                            name: item.name,
                            category: category.category,
                            // Map proficiency or other fields if needed, though new schema doesn't use them directly
                            // associatedProjects can be empty or mocked if needed
                            associatedProjects: []
                        }))
                    );
                    setSkills(configSkills);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
                // Fallback on error as well
                const configSkills = PORTFOLIO_CONFIG.skills.flatMap(category =>
                    category.items.map(item => ({
                        id: item.name.toLowerCase().replace(/\s+/g, '-'),
                        name: item.name,
                        category: category.category,
                        associatedProjects: []
                    }))
                );
                setSkills(configSkills);
            }
        };
        fetchSkills();
    }, []);

    const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <section id="skills" className="py-12 relative overflow-hidden">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Cpu size={20} />
                        <span className="font-mono text-sm tracking-wider">
                            {isDark ? "SYSTEM_DEPENDENCIES" : "Skills & Tools"}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {isDark ? "Technical Arsenal" : "My Tech Stack"}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((category, index) => {
                        const categorySkills = groupedSkills[category] || [];
                        if (categorySkills.length === 0) return null;

                        return (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-all duration-300 group flex flex-col"
                            >
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground group-hover:text-primary transition-colors">
                                    <Terminal size={16} className="text-primary" />
                                    {category}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {categorySkills.map((skill) => (
                                        <button
                                            key={skill.id}
                                            onClick={() => setSelectedSkill(skill)}
                                            className="px-3 py-1.5 text-xs font-mono rounded bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex items-center gap-2"
                                        >
                                            {skill.name}
                                            {skill.associatedProjects && skill.associatedProjects.length > 0 && (
                                                <span className="w-1 h-1 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Container>

            {/* Project Association Modal */}
            <AnimatePresence>
                {selectedSkill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Cpu size={20} className="text-primary" />
                                    {selectedSkill.name}
                                </h3>
                                <button
                                    onClick={() => setSelectedSkill(null)}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
                                    Associated Projects
                                </h4>
                                {selectedSkill.associatedProjects && selectedSkill.associatedProjects.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedSkill.associatedProjects.map((project: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded bg-secondary/20 border border-border">
                                                <FolderGit2 size={18} className="text-primary" />
                                                <span>{project}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        No specific projects linked to this skill yet.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
