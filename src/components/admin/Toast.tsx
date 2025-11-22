"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`w-full max-w-md px-6 py-4 rounded-lg shadow-2xl border ${type === "success"
                ? "bg-green-500/10 border-green-500/50 text-green-500"
                : "bg-red-500/10 border-red-500/50 text-red-500"
                }`}
        >
            <div className="flex items-center gap-3">
                {type === "success" ? (
                    <CheckCircle size={20} />
                ) : (
                    <XCircle size={20} />
                )}
                <p className="flex-1 font-mono text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="hover:opacity-70 transition-opacity"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
