"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

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
        <div
            role={type === "error" ? "alert" : "status"}
            className={`toast-in w-full max-w-sm px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 pointer-events-auto
                ${type === "success"
                    ? "bg-card/95 border-l-4 border-l-emerald-500 border-border text-foreground"
                    : type === "error"
                    ? "bg-card/95 border-l-4 border-l-red-500 border-border text-foreground"
                    : "bg-card/95 border-l-4 border-l-primary border-border text-foreground"
                }`}
        >
            {type === "success" ? (
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            ) : type === "error" ? (
                <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            ) : (
                <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug break-words">{message}</p>
            </div>

            <button
                type="button"
                onClick={() => onClose(id)}
                aria-label="Dismiss notification"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            >
                <X size={16} />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3 sm:w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={removeToast} />
            ))}
        </div>
    );
}
