"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { BlogNavigation } from "@/components/blog/BlogNavigation";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseAnalytics } from "@/components/providers/FirebaseAnalytics";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCMS = pathname?.startsWith("/cms");
    const isBlog = pathname?.startsWith("/blog");

    return (
        <ThemeProvider>
            {!isCMS && (isBlog ? <BlogNavigation /> : <Navigation />)}

            <main className={!isCMS && !isBlog ? "lg:pl-20 min-h-screen" : "min-h-screen"}>
                {children}
            </main>

            <Analytics />
            <SpeedInsights />
            <FirebaseAnalytics />
        </ThemeProvider>
    );
}
