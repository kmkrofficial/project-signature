"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000); // 5 seconds auto-dismiss
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, x: 0, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`w-full max-w-sm px-4 py-3 rounded border shadow-lg backdrop-blur-md flex items-start gap-3 pointer-events-auto
                ${type === "success"
                    ? "bg-card/95 border-l-4 border-l-green-500 border-border text-foreground"
                    : "bg-card/95 border-l-4 border-l-red-500 border-border text-foreground"
                }`}
        >
            {type === "success" ? (
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
            ) : (
                <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
                <p className="font-mono text-sm leading-tight break-words">{message}</p>
            </div>

            <button
                onClick={() => onClose(id)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
