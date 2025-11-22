import { useState, useCallback } from "react";
import { ToastType } from "@/components/admin/Toast";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string) => {
        addToast(message, "success");
    }, [addToast]);

    const showError = useCallback((message: string) => {
        addToast(message, "error");
    }, [addToast]);

    return { toasts, removeToast, showSuccess, showError };
}
