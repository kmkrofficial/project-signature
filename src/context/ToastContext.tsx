"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { ToastContainer, ToastAction, ToastType } from "@/components/ui/Toast";

interface ToastContextType {
    addToast: (message: string, type: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; action?: ToastAction }>>([]);

    const addToast = useCallback((message: string, type: ToastType, action?: ToastAction) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, action }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
