"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

/** Safety net if CSS animations are disabled and the progress bar never finishes. */
const MAX_LIFETIME_MS = 15000;
const LEAVE_FALLBACK_MS = 450;

export function Toast({ id, message, type, onClose }: ToastProps) {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLeaving(true), MAX_LIFETIME_MS);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!leaving) return;
        const timer = setTimeout(() => onClose(id), LEAVE_FALLBACK_MS);
        return () => clearTimeout(timer);
    }, [leaving, id, onClose]);

    const accent = type === "success" ? "emerald" : type === "error" ? "red" : "primary";

    return (
        <div
            className={clsx("toast-row", leaving && "toast-leave")}
            onAnimationEnd={(event) => event.animationName === "toast-collapse" && onClose(id)}
        >
            <div className="toast-inner">
                <div className="pb-3">
                    <div
                        role={type === "error" ? "alert" : "status"}
                        className={clsx(
                            "toast-card toast-in relative overflow-hidden w-full max-w-sm px-4 py-3 rounded-xl border border-l-4 border-border bg-card/95 text-foreground shadow-lg backdrop-blur-md flex items-start gap-3 pointer-events-auto",
                            type === "success" && "border-l-emerald-500",
                            type === "error" && "border-l-red-500",
                            type === "info" && "border-l-primary"
                        )}
                    >
                        {type === "error" ? (
                            <XCircle size={18} className="animate-pop text-red-500 mt-0.5 shrink-0 [animation-delay:80ms]" />
                        ) : (
                            <CheckCircle
                                size={18}
                                className={clsx("animate-pop mt-0.5 shrink-0 [animation-delay:80ms]", type === "success" ? "text-emerald-500" : "text-primary")}
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug break-words">{message}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setLeaving(true)}
                            aria-label="Dismiss notification"
                            className="press text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <span
                            aria-hidden="true"
                            onAnimationEnd={(event) => {
                                event.stopPropagation();
                                setLeaving(true);
                            }}
                            className={clsx(
                                "toast-timer absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-60",
                                accent === "emerald" && "bg-emerald-500",
                                accent === "red" && "bg-red-500",
                                accent === "primary" && "bg-primary"
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-1 right-4 left-4 sm:left-auto sm:bottom-3 sm:right-6 z-[100] flex flex-col sm:w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={removeToast} />
            ))}
        </div>
    );
}
