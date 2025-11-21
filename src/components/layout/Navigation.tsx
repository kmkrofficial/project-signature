"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, User, Code, Cpu, BookOpen, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
    { name: "Core", path: "/", id: "hero", icon: Home },
    { name: "Skills", path: "#skills", id: "skills", icon: Cpu },
    { name: "Logs", path: "#experience", id: "experience", icon: User },
    { name: "Modules", path: "#projects", id: "projects", icon: Code },
    { name: "Research", path: "/blog", id: "blog", icon: BookOpen },
];

export function Navigation() {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        if (pathname !== "/") {
            setActiveSection("blog");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        // Observe sections
        const sections = ["hero", "skills", "experience", "projects", "achievements"];
        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [pathname]);

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.nav
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden md:flex flex-col fixed left-0 top-0 h-full w-20 border-r border-border bg-background/80 backdrop-blur-md z-50 items-center py-8"
            >
                <div className="mb-12">
                    <div className="w-10 h-10 bg-primary rounded-sm animate-pulse-slow shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                </div>

                <div className="flex flex-col gap-8 flex-1 w-full items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === "/" ? activeSection === item.id : pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={clsx(
                                    "p-3 rounded-lg transition-all duration-300 relative group w-12 h-12 flex items-center justify-center",
                                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                <item.icon size={24} />

                                {/* Tooltip */}
                                <span className="absolute left-14 bg-card px-3 py-1.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-sm font-mono z-50 shadow-xl">
                                    {item.name}
                                </span>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 w-1 h-full bg-primary rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors mt-auto"
                >
                    {theme === "deepSystem" ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </motion.nav>

            {/* Mobile Bottom Nav */}
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-lg border-t border-border z-50 px-6 py-4 flex justify-between items-center"
            >
                {navItems.map((item) => {
                    const isActive = pathname === "/" ? activeSection === item.id : pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={clsx(
                                "flex flex-col items-center gap-1",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] uppercase tracking-wider">{item.name}</span>
                        </Link>
                    )
                })}
                <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center gap-1 text-muted-foreground"
                >
                    {theme === "deepSystem" ? <Sun size={20} /> : <Moon size={20} />}
                    <span className="text-[10px] uppercase tracking-wider">Theme</span>
                </button>
            </motion.nav>
        </>
    );
}
