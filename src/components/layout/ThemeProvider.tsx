"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

interface ToggleThemeCoordinates {
    clientX?: number;
    clientY?: number;
}

interface ThemeContextType {
    theme: Theme;
    toggleTheme: (coords?: ToggleThemeCoordinates) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** The <html> class (set pre-paint by the inline script in app/layout.tsx) is the source of truth. */
function readTheme(): Theme {
    return document.documentElement.classList.contains("light-mode") ? "light" : "dark";
}

function applyTheme(theme: Theme, persist: boolean): void {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light-mode", theme === "light");
    if (!persist) return;
    try {
        localStorage.setItem("theme", theme);
    } catch {
        // Storage unavailable; the theme still applies for this page view
    }
}

function subscribe(onChange: () => void): () => void {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as const);

    // Keep tabs in sync when the theme changes elsewhere
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
                applyTheme(e.newValue, false);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const toggleTheme = useCallback((coords?: ToggleThemeCoordinates) => {
        const nextTheme: Theme = readTheme() === "dark" ? "light" : "dark";

        // Hidden documents never paint, so a view transition there would never finish
        const canAnimate =
            "startViewTransition" in document &&
            !document.hidden &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!canAnimate) {
            applyTheme(nextTheme, true);
            return;
        }

        // Circular reveal from the click point (viewport centre for keyboard activation)
        const x = coords?.clientX || window.innerWidth / 2;
        const y = coords?.clientY || window.innerHeight / 2;
        const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const root = document.documentElement;
        root.classList.add("theme-reveal");
        const transition = document.startViewTransition(() => applyTheme(nextTheme, true));
        const cleanup = () => root.classList.remove("theme-reveal");
        transition.finished.then(cleanup, cleanup);
        transition.ready
            .then(() => {
                document.documentElement.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                    { duration: 500, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
                );
            })
            .catch(() => {
                // Transition skipped or unsupported pseudo-element animation; the theme is already applied
            });
    }, []);

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
