"use client";

import React, { useState, useEffect } from "react";

import { MessageSquareText } from "lucide-react";
import { SocialsModal } from "@/components/features/SocialsModal";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingContactButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.getElementById('site-footer');
            if (!footer) return;

            const rect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Hide if footer is visible in the viewport
            if (rect.top <= windowHeight) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20, rotate: -20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            rotate: 0,
                            transition: {
                                type: "spring",
                                stiffness: 260,
                                damping: 20
                            }
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.5,
                            y: 20,
                            transition: { duration: 0.2 }
                        }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsModalOpen(true)}
                        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 border border-primary/20 flex items-center justify-center transition-shadow duration-300 group"
                        title="Open Communications"
                        aria-label="Contact Me"
                    >
                        <MessageSquareText size={24} className="group-hover:scale-110 transition-transform" />

                        {/* Ripple effect or pulse ring */}
                        <span className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20 pointer-events-none" />
                    </motion.button>
                )}
            </AnimatePresence>

            <SocialsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
