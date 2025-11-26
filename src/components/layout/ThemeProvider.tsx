"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "deepSystem" | "technicalBlueprint";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    hasSelectedTheme: boolean;
    selectTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("deepSystem");
    const [hasSelectedTheme, setHasSelectedTheme] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            setHasSelectedTheme(true);
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "technicalBlueprint") {
            root.classList.add("light-mode");
        } else {
            root.classList.remove("light-mode");
        }
        if (hasSelectedTheme) {
            localStorage.setItem("theme", theme);
        }
    }, [theme, hasSelectedTheme]);

    const toggleTheme = () => {
        const newTheme = theme === "deepSystem" ? "technicalBlueprint" : "deepSystem";

        // Create transition overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "9999";
        // The overlay color should be the NEW theme's background to "wipe" it in
        overlay.style.backgroundColor = newTheme === "deepSystem" ? "#0a0a0a" : "#f0f9ff";

        // Start from right (off-screen)
        overlay.style.transform = "translateX(100%)";
        overlay.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

        document.body.appendChild(overlay);

        // Force reflow
        overlay.getBoundingClientRect();

        // Animate in (cover screen)
        requestAnimationFrame(() => {
            overlay.style.transform = "translateX(0%)";
        });

        // Wait for cover, then switch theme, then animate out?
        // Actually, if we wipe IN the new color, we can just leave it there?
        // No, because it's an overlay. We need to remove it.

        // Better: Wipe IN, switch theme behind it, then fade out? 
        // Or Wipe IN (cover), switch theme, Wipe OUT (reveal)?
        // Let's do Wipe IN -> Switch -> Wipe OUT to the left.

        setTimeout(() => {
            setTheme(newTheme);
            setHasSelectedTheme(true);

            // Continue moving to the left (wipe away)
            // But if we move to left, it reveals what's behind.
            // Since we switched theme, what's behind is the NEW theme.
            // So it will look like the overlay passes through.

            // Wait a tiny bit for React to render the new theme
            setTimeout(() => {
                overlay.style.transform = "translateX(-100%)";

                // Remove after animation
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 500);
            }, 50);

        }, 500); // Wait for first animation to finish
    };

    const selectTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        setHasSelectedTheme(true);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, hasSelectedTheme, selectTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
