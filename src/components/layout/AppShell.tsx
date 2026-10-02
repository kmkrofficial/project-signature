"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/blog/SearchModal";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseAnalytics } from "@/components/providers/FirebaseAnalytics";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const [searchOpen, setSearchOpen] = useState(false);

    // Global Cmd+K / Ctrl+K shortcut listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <ThemeProvider>
            {/* CSS-Only Ambient Horizon & Grid Background */}
            <div className="bg-ambient-glow" aria-hidden="true" />
            <div className="bg-grid-pattern" aria-hidden="true" />
            <div className="top-hairline" aria-hidden="true" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {!isAdmin && <Header onOpenSearch={() => setSearchOpen(true)} />}

                <main className="flex-1">
                    {children}
                </main>

                {!isAdmin && <Footer />}
            </div>

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            <Analytics />
            <SpeedInsights />
            <FirebaseAnalytics />
        </ThemeProvider>
    );
}
