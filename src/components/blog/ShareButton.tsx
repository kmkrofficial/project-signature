"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ShareButtonProps {
    title: string;
}

/** Native share sheet where supported (mobile), copy-link fallback elsewhere. */
export function ShareButton({ title }: ShareButtonProps) {
    const { addToast } = useToast();

    const share = async () => {
        const url = window.location.href.split("#")[0];
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            addToast("Link copied to clipboard", "success");
        } catch {
            addToast("Couldn't copy the link", "error");
        }
    };

    return (
        <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer active:scale-95"
        >
            <Share2 size={16} />
            <span>Share</span>
        </button>
    );
}
