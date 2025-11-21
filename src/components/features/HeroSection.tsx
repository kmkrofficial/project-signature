"use client";

import React from "react";
import { motion } from "framer-motion";
import { NetworkCore } from "./NetworkCore";
import { ParticleBackground } from "./ParticleBackground";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { ArrowRight, Terminal } from "lucide-react";

export function HeroSection() {
    return (
        <section id="hero" className="relative h-screen flex items-center overflow-hidden">
            <ParticleBackground />
            <NetworkCore />

            <Container className="relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 text-primary mb-4"
                    >
                        <Terminal size={18} />
                        <span className="font-mono text-sm tracking-wider">SYSTEM ONLINE // V.2.0.24</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        <span className="text-foreground">{PORTFOLIO_CONFIG.personal.name}</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 text-glow">
                            {PORTFOLIO_CONFIG.personal.title}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
                    >
                        {PORTFOLIO_CONFIG.personal.summary}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a
                            href="#projects"
                            className="group relative px-6 py-3 bg-primary/10 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                        >
                            <span>Initialize Comms</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>

                        <a
                            href="#experience"
                            className="px-6 py-3 border border-border text-muted-foreground rounded hover:border-primary hover:text-primary transition-colors"
                        >
                            View System Logs
                        </a>
                    </motion.div>
                </div>
            </Container>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
