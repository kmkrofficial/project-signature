"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "deepSystem" | "technicalBlueprint";

interface ToggleThemeCoordinates {
    clientX?: number;
    clientY?: number;
}

interface ThemeContextType {
    theme: "dark" | "light";
    isDark: boolean;
    toggleTheme: (coords?: ToggleThemeCoordinates | React.MouseEvent) => void;
    selectTheme: (theme: "dark" | "light") => void;
    hasSelectedTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const isCurrentLight = document.documentElement.classList.contains("light-mode") || savedTheme === "light";
        const initialTheme = isCurrentLight ? "light" : "dark";
        setTheme(initialTheme);

        if (initialTheme === "light") {
            document.documentElement.classList.add("light-mode");
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light-mode");
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
                setTheme(e.newValue);
                if (e.newValue === "light") {
                    document.documentElement.classList.add("light-mode");
                    document.documentElement.classList.remove("dark");
                } else {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light-mode");
                }
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const applyThemeChange = (newTheme: "dark" | "light") => {
        setTheme(newTheme);
        try {
            localStorage.setItem("theme", newTheme);
        } catch {
            // Safe fallback
        }
        if (newTheme === "light") {
            document.documentElement.classList.add("light-mode");
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light-mode");
        }
    };

    const toggleTheme = (coords?: ToggleThemeCoordinates | React.MouseEvent) => {
        const nextTheme = theme === "dark" ? "light" : "dark";

        // Check if View Transitions API is supported and not reduced-motion
        const isAppearanceTransition =
            typeof document !== "undefined" &&
            "startViewTransition" in document &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!isAppearanceTransition) {
            applyThemeChange(nextTheme);
            return;
        }

        let x = coords?.clientX;
        let y = coords?.clientY;

        // If triggered via keyboard or missing coordinates, center of viewport
        if (typeof x !== "number" || typeof y !== "number" || (x === 0 && y === 0)) {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            applyThemeChange(nextTheme);
        });

        transition.ready
            .then(() => {
                const clipPath = [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ];
                try {
                    document.documentElement.animate(
                        {
                            clipPath,
                        },
                        {
                            duration: 500,
                            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                            pseudoElement: "::view-transition-new(root)",
                        }
                    );
                } catch {
                    // Fallback gracefully if pseudoElement animation is unsupported
                }
            })
            .catch(() => {
                // Prevent unhandled rejections if view transition is cancelled or skipped
            });
    };

    const selectTheme = (newTheme: "dark" | "light") => {
        applyThemeChange(newTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: theme === "dark",
                toggleTheme,
                selectTheme,
                hasSelectedTheme: true,
            }}
        >
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
