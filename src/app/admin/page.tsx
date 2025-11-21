"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, FileText, Code, Cpu, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const adminModules = [
    { title: "Blog Posts", icon: FileText, count: 12, status: "Active" },
    { title: "Projects", icon: Code, count: 8, status: "Deployed" },
    { title: "Skills", icon: Cpu, count: 24, status: "Indexed" },
    { title: "Configuration", icon: Settings, count: 1, status: "Stable" },
];

export default function AdminDashboard() {
    const router = useRouter();

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
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                    <LogOut size={18} />
                    <span>Terminate Session</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminModules.map((module, index) => (
                    <motion.div
                        key={module.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 text-primary rounded">
                                <module.icon size={24} />
                            </div>
                            <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                {module.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{module.title}</h3>
                        <p className="text-muted-foreground text-sm">{module.count} Items</p>

                        <div className="mt-4 w-full h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 group-hover:w-full transition-all duration-500" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Area Placeholder */}
            <div className="bg-card border border-border rounded-lg p-8 min-h-[400px] flex items-center justify-center text-muted-foreground border-dashed">
                Select a module to begin configuration...
            </div>
        </div>
    );
}
