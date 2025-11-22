"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Coffee, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

export function ThemeWelcome() {
    const { selectTheme } = useTheme();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="max-w-4xl w-full p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Select Your Experience
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Choose how you'd like to view this portfolio.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Technical / Developer Option */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        onClick={() => selectTheme("deepSystem")}
                        className="group relative p-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/30 transition-all duration-300 text-left"
                    >
                        <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-xl group-hover:bg-cyan-500/10 transition-all" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Terminal className="text-cyan-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Technical / Developer</h3>
                            <p className="text-gray-400 mb-6">
                                Terminal aesthetics, system logs, and deep technical details.
                                <br />
                                <span className="text-xs text-cyan-500 mt-2 block font-mono">MODE: DEEP_SYSTEM</span>
                            </p>
                            <div className="flex items-center gap-2 text-cyan-400 font-medium group-hover:translate-x-2 transition-transform">
                                <span>Initialize System</span>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    </motion.button>

                    {/* Casual / Visitor Option */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={() => selectTheme("technicalBlueprint")}
                        className="group relative p-8 rounded-2xl border border-blue-200/30 bg-white/5 hover:bg-white/10 transition-all duration-300 text-left"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-hover:bg-blue-500/10 transition-all" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-blue-100/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Coffee className="text-blue-300" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Casual / Visitor</h3>
                            <p className="text-gray-400 mb-6">
                                Clean interface, friendly language, and visual storytelling.
                                <br />
                                <span className="text-xs text-blue-300 mt-2 block font-mono">MODE: VISUAL_STORY</span>
                            </p>
                            <div className="flex items-center gap-2 text-blue-300 font-medium group-hover:translate-x-2 transition-transform">
                                <span>Let's Explore</span>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
