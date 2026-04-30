"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("App error boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
            <div className="max-w-md w-full text-center">
                <AlertTriangle className="mx-auto mb-4 text-red-500" size={56} aria-hidden="true" />
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground mb-6 font-mono text-sm">
                    An unexpected error occurred. You can try again or return home.
                </p>
                {error?.digest && (
                    <p className="text-xs text-muted-foreground/60 mb-6 font-mono break-all">
                        ref: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <RotateCw size={16} aria-hidden="true" /> Try again
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 border border-border rounded font-medium flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
                    >
                        <Home size={16} aria-hidden="true" /> Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
