"use client";

import React, { useRef } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { clsx } from "clsx";

interface ThemeToggleProps {
    className?: string;
    size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isDark = theme === "dark";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        let x = e.clientX;
        let y = e.clientY;

        // Fallback to button center coordinates if clicked via keyboard or missing coordinates
        if ((!x && !y) || (x === 0 && y === 0)) {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect) {
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight / 2;
            }
        }

        toggleTheme({ clientX: x, clientY: y });
    };

    const isSmall = size === "sm";

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
            className={clsx(
                "relative inline-flex items-center shrink-0 cursor-pointer select-none rounded-full p-0.5",
                "border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
                isDark
                    ? "bg-secondary/90 border-border/80 hover:border-primary/50 text-muted-foreground"
                    : "bg-amber-100/70 border-amber-200/80 hover:border-amber-300 text-amber-700",
                isSmall ? "w-12 h-6" : "w-14 h-7.5",
                className
            )}
        >
            {/* Stationary Background Track Icons */}
            <span
                aria-hidden="true"
                className={clsx(
                    "absolute flex items-center justify-between w-full pointer-events-none transition-opacity duration-200",
                    isSmall ? "px-1.5" : "px-2"
                )}
            >
                <Sun
                    size={isSmall ? 10 : 12}
                    className={clsx(
                        "transition-all duration-200",
                        !isDark ? "text-amber-500 opacity-100" : "text-muted-foreground/30 opacity-40"
                    )}
                />
                <Moon
                    size={isSmall ? 10 : 12}
                    className={clsx(
                        "transition-all duration-200",
                        isDark ? "text-cyan-400 opacity-100" : "text-muted-foreground/30 opacity-40"
                    )}
                />
            </span>

            {/* Sliding Switch Knob / Thumb */}
            <span
                aria-hidden="true"
                className={clsx(
                    "pointer-events-none flex items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    isSmall
                        ? isDark
                            ? "translate-x-6.5 w-4.5 h-4.5"
                            : "translate-x-0.5 w-4.5 h-4.5"
                        : isDark
                            ? "translate-x-7 w-6 h-6"
                            : "translate-x-0.5 w-6 h-6",
                    isDark
                        ? "bg-slate-900 border border-slate-700/80 text-cyan-300 shadow-md shadow-black/60"
                        : "bg-white border border-amber-200 text-amber-500 shadow-md shadow-amber-500/20"
                )}
            >
                {isDark ? (
                    <Moon size={isSmall ? 10 : 12} className="stroke-[2.2] animate-in fade-in zoom-in-75 duration-200" />
                ) : (
                    <Sun size={isSmall ? 10 : 12} className="stroke-[2.2] animate-in fade-in zoom-in-75 duration-200" />
                )}
            </span>
        </button>
    );
}
