"use client";

import React, { useEffect, useState } from "react";

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId: number;

        const updateProgress = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const current = (window.scrollY / totalHeight) * 100;
                setProgress(Math.min(100, Math.max(0, current)));
            }
        };

        const onScroll = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateProgress);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        updateProgress();

        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary via-amber-400 to-yellow-300 transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
