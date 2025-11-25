"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Container } from "@/components/layout/Container";
import { PORTFOLIO_CONFIG } from "../../../lib/portfolio-config";
import { ArrowRight, Terminal, MessageCircle, Sparkles, Radio, Mail } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { ThemeWelcome } from "@/components/features/ThemeWelcome";
import { ParticleBackground } from "./ParticleBackground";
import { SocialsModal } from "./SocialsModal";
import Link from "next/link";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const NetworkCore = dynamic(() => import("./NetworkCore"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-background/50" />
});
const CreativeCore = dynamic(() => import("./CreativeCore"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-background/50" />
});

export function HeroSection() {
    const { theme, hasSelectedTheme } = useTheme();
    const isDark = theme === "deepSystem";
    const [showSocials, setShowSocials] = useState(false);
    const [heroData, setHeroData] = useState<any>(null);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const docRef = doc(db, "config", "site");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setHeroData(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching hero data:", error);
            }
        };
        fetchHeroData();
    }, []);

    const t = isDark ? PORTFOLIO_CONFIG.personal : PORTFOLIO_CONFIG.personal.casual;

    // Use fetched data if available, otherwise fallback to config
    const displayName = heroData?.name || t.name;
    const displayTitle = heroData?.title || t.title;
    const displaySummary = heroData?.siteDescription || t.summary; // Admin saves description as siteDescription

    const content = isDark ? {
        badge: "SYSTEM ONLINE // V.2.0.24",
        badgeIcon: <Terminal size={18} />,
    } : {
        badge: "HELLO THERE! 👋",
        badgeIcon: <Sparkles size={18} />,
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {!hasSelectedTheme && <ThemeWelcome />}

            {isDark ? <ParticleBackground /> : null}

            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                {isDark ? <NetworkCore /> : <CreativeCore />}
            </div>

            <Container className="relative z-10">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-2 text-primary mb-4">
                            {content.badgeIcon}
                            <span className="font-mono text-sm tracking-wider">{content.badge}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                            <span className="text-foreground">
                                {displayName}
                            </span>
                            <span className="block text-primary mt-2">
                                {displayTitle}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                            {displaySummary}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="#projects"
                                className="px-8 py-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all hover:scale-105 font-medium flex items-center gap-2"
                            >
                                {isDark ? <Terminal size={20} /> : <ArrowRight size={20} />}
                                {t.ctaPrimary}
                            </Link>

                            <button
                                onClick={() => setShowSocials(true)}
                                className="px-8 py-4 border border-primary/20 hover:bg-primary/10 rounded transition-all hover:scale-105 font-medium flex items-center gap-2 backdrop-blur-sm text-foreground"
                            >
                                {isDark ? <Radio size={20} /> : <Mail size={20} />}
                                {t.ctaSecondary}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </Container>

            <SocialsModal isOpen={showSocials} onClose={() => setShowSocials(false)} />

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
            >
                <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-primary rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
