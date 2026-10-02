"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Complete and fade out progress bar when pathname changes
        if (visible) {
            setProgress(100);
            const timer = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("a");
            if (!target) return;

            const href = target.getAttribute("href");
            if (
                href &&
                href.startsWith("/") &&
                !href.startsWith("/#") &&
                !target.getAttribute("target") &&
                href !== window.location.pathname
            ) {
                setVisible(true);
                setProgress(15);
                setTimeout(() => setProgress(75), 100);
            }
        };

        document.addEventListener("click", handleClick, { passive: true });
        return () => document.removeEventListener("click", handleClick);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] pointer-events-none bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    transitionProperty: "width, opacity",
                }}
            />
        </div>
    );
}
