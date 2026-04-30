"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function BlogError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Blog error boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} aria-hidden="true" />
                <h2 className="text-xl font-bold mb-2">Failed to load blog</h2>
                <p className="text-muted-foreground mb-6 font-mono text-sm">{error.message || "Unknown error"}</p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <RotateCw size={16} aria-hidden="true" /> Retry
                    </button>
                    <Link
                        href="/blog"
                        className="px-4 py-2 border border-border rounded hover:border-primary hover:text-primary transition-colors"
                    >
                        Back to blog
                    </Link>
                </div>
            </div>
        </div>
    );
}
