"use client";

import React, { useEffect, useId, useRef } from "react";
import { clsx } from "clsx";

export interface ConfirmAction {
    label: string;
    onClick: () => void;
    tone?: "primary" | "danger" | "neutral";
}

interface Props {
    open: boolean;
    title: string;
    description?: React.ReactNode;
    actions: ConfirmAction[];
    /** Called when the dialog is dismissed (Esc, backdrop click, or after an action). */
    onClose: () => void;
}

/** Small native <dialog> prompt, animated by the shared `.confirm-dialog` rules in globals.css. */
export function ConfirmDialog({ open, title, description, actions, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => e.target === dialogRef.current && onClose()}
            aria-labelledby={titleId}
            className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                    <h2 id={titleId} className="text-base font-bold text-foreground">
                        {title}
                    </h2>
                    {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className={clsx(
                                "press px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer",
                                action.tone === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
                                action.tone === "danger" &&
                                    "border border-red-500/40 text-red-400 hover:bg-red-500/10",
                                (!action.tone || action.tone === "neutral") &&
                                    "border border-border bg-secondary/40 text-foreground hover:bg-secondary"
                            )}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </dialog>
    );
}
