"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ShareButtonProps {
    title: string;
}

/** Native share sheet where supported (mobile), copy-link fallback elsewhere. */
export function ShareButton({ title }: ShareButtonProps) {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(resetTimer.current), []);

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
            setCopied(true);
            clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopied(false), 1800);
            addToast("Link copied to clipboard", "success");
        } catch {
            addToast("Couldn't copy the link", "error");
        }
    };

    return (
        <button
            type="button"
            onClick={share}
            className="group press inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer"
        >
            {copied ? (
                <Check key="check" size={16} className="animate-pop text-emerald-500" />
            ) : (
                <Share2 key="share" size={16} className="transition-transform duration-200 ease-smooth group-hover:-translate-y-0.5" />
            )}
            <span>{copied ? "Copied" : "Share"}</span>
        </button>
    );
}
