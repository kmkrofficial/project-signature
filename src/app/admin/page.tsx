"use client";

import React, { useState, useEffect } from "react";
import { Settings, FileText, Code, Cpu, LogOut, FileStack, Database, Loader2, Briefcase, GraduationCap, Image as ImageIcon } from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

interface ModuleCounts {
    blog: number;
    projects: number;
    skills: number;
    papers: number;
    experience: number;
    education: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [counts, setCounts] = useState<ModuleCounts>({
        blog: 0,
        projects: 0,
        skills: 0,
        papers: 0,
        experience: 0,
        education: 0,
    });
    const [imageCount, setImageCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            setLoading(false); // Show UI immediately

            // Fetch all collections in parallel
            const [blogSnap, projectsSnap, skillsSnap, papersSnap, expSnap, eduSnap] = await Promise.all([
                getDocs(collection(db, "blog")),
                getDocs(collection(db, "portfolio")),
                getDocs(collection(db, "skills")),
                getDocs(collection(db, "papers")),
                getDocs(collection(db, "experience")),
                getDocs(collection(db, "education")),
            ]);

            // Fetch image count from new API - REMOVED to save API calls
            // This is an expensive list operation just for a dashboard number.
            // setCounts handles the rest.

            setCounts({
                blog: blogSnap.size,
                projects: projectsSnap.size,
                skills: skillsSnap.size,
                papers: papersSnap.size,
                experience: expSnap.size,
                education: eduSnap.size,
            });
        } catch (error) {
            console.error("Error fetching counts:", error);
            setLoading(false);
        }
    };

    const adminModules = [
        {
            title: "Blog CMS",
            icon: FileText,
            count: counts.blog,
            status: "Active",
            path: "/cms",
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Image Management",
            icon: ImageIcon,
            count: imageCount,
            status: "Stored",
            path: "/admin/images",
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
        },
        {
            title: "Projects",
            icon: Code,
            count: counts.projects,
            status: "Deployed",
            path: "/admin/projects",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "System Dependencies",
            description: "Manage technical skills",
            icon: Cpu,
            count: counts.skills,
            status: "Indexed",
            path: "/admin/skills",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Research Papers",
            icon: FileStack,
            count: counts.papers,
            status: "Published",
            path: "/admin/papers",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
        {
            title: "System Logs",
            description: "Manage professional experience",
            icon: Briefcase,
            count: counts.experience,
            status: "Logged",
            path: "/admin/experience",
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10",
        },
        {
            title: "Kernel Training",
            description: "Manage education and certifications",
            icon: GraduationCap,
            count: counts.education,
            status: "Certified",
            path: "/admin/education",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Configuration",
            icon: Settings,
            count: 1,
            status: "Stable",
            path: "/admin/config",
            color: "text-gray-500",
            bgColor: "bg-gray-500/10",
        },
    ];

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/admin/login");
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, Administrator.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModules.map((module) => (
                    <div
                        key={module.title}
                        onClick={() => router.push(module.path)}
                        className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded transition-colors ${module.bgColor} ${module.color} group-hover:bg-opacity-80`}>
                                <module.icon size={24} />
                            </div>
                            <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                {module.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{module.title}</h3>
                        <p className="text-muted-foreground text-sm">
                            {module.count} {module.count === 1 ? "Item" : "Items"}
                        </p>

                        <div className="mt-4 w-full h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 group-hover:w-full transition-all duration-500" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Database size={20} className="text-primary" />
                    <h2 className="text-lg font-bold">Database Overview</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-bold text-primary">
                            {Object.values(counts).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Total Items</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-500">{counts.blog}</p>
                        <p className="text-xs text-muted-foreground mt-1">Blog Posts</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-500">{counts.projects}</p>
                        <p className="text-xs text-muted-foreground mt-1">Projects</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-purple-500">{counts.skills}</p>
                        <p className="text-xs text-muted-foreground mt-1">Skills</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
