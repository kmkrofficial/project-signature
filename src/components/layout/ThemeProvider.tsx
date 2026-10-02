"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "deepSystem" | "technicalBlueprint";

interface ThemeContextType {
    theme: "dark" | "light";
    isDark: boolean;
    toggleTheme: () => void;
    selectTheme: (theme: "dark" | "light") => void;
    hasSelectedTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "technicalBlueprint") {
            setTheme("light");
            document.documentElement.classList.add("light-mode");
        } else {
            setTheme("dark");
            document.documentElement.classList.remove("light-mode");
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);

        if (nextTheme === "light") {
            document.documentElement.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
        }
    };

    const selectTheme = (newTheme: "dark" | "light") => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "light") {
            document.documentElement.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
        }
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
