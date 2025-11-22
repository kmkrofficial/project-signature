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
        setTheme((prev) => (prev === "deepSystem" ? "technicalBlueprint" : "deepSystem"));
        setHasSelectedTheme(true);
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
