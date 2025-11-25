"use client";

import React, { useEffect, useState } from "react";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/components/layout/ThemeProvider";

export function CustomCursor() {
    const { theme } = useTheme();
    const isDark = theme === "deepSystem";

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring animation for the cursor movement
    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isClicked, setIsClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        // Hide default cursor
        document.body.style.cursor = "none";

        // Add style for links and buttons to show pointer
        const style = document.createElement('style');
        style.innerHTML = `
            a, button, [role="button"], input, select, textarea {
                cursor: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.body.style.cursor = "auto";
            document.head.removeChild(style);
        };
    }, [cursorX, cursorY]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: "-50%",
                translateY: "-50%",
            }}
        >
            <motion.div
                animate={{
                    scale: isClicked ? 0.8 : 1,
                    rotate: isClicked ? 45 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex items-center justify-center"
            >
                {isDark ? (
                    // Dark Mode: Tech Square
                    <div className="w-6 h-6 border-2 border-cyan-500 bg-cyan-500/10 backdrop-blur-[1px]" />
                ) : (
                    // Light Mode: Soft Circle
                    <div className="w-6 h-6 border-2 border-blue-600 rounded-full bg-blue-600/10 backdrop-blur-[1px]" />
                )}

                {/* Center Dot */}
                <div className={`absolute w-1 h-1 ${isDark ? "bg-cyan-400" : "bg-blue-600"} ${isDark ? "" : "rounded-full"}`} />
            </motion.div>
        </motion.div>
    );
}
