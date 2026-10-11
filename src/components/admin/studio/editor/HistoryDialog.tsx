"use client";

import React, { useEffect, useRef, useState } from "react";
import { History, Loader2, RotateCcw, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { listRevisions, type Revision, type SaveIntent } from "../posts-client";

const REASON_LABEL: Record<SaveIntent, string> = {
    draft: "Saved draft",
    publish: "Published",
    update: "Updated",
    unpublish: "Unpublished",
};

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface Props {
    open: boolean;
    postId: string | undefined;
    onClose: () => void;
    /** Loads the chosen version into the editor. It stays unsaved until the writer saves. */
    onRestore: (revision: Revision) => void;
}

/** The last explicit saves of an article, newest first. */
export function HistoryDialog({ open, postId, onClose, onRestore }: Props) {
    const { addToast } = useToast();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!open || !postId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const result = await listRevisions(postId);
                if (!cancelled) setRevisions(result);
            } catch {
                if (!cancelled) addToast("Could not load the version history", "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, postId, addToast]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => e.target === dialogRef.current && onClose()}
            aria-labelledby="history-dialog-title"
            className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-lg max-h-[80vh] p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 id="history-dialog-title" className="flex items-center gap-2 text-base font-bold text-foreground">
                            <History size={16} className="text-primary" aria-hidden="true" />
                            Version history
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Each time you save, publish or update, a version is kept (the latest 20). Restoring loads
                            it into the editor; nothing changes until you save.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="press p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-10 flex justify-center text-primary">
                        <Loader2 size={20} className="animate-spin" />
                    </div>
                ) : revisions.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No saved versions yet. They appear after you save, publish or update.
                    </p>
                ) : (
                    <ul className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
                        {revisions.map((revision, index) => {
                            const older = revisions[index + 1];
                            const delta = older ? words(revision.content) - words(older.content) : null;
                            return (
                                <li
                                    key={revision.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/20 px-3 py-2.5"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="text-xs font-medium text-foreground">
                                            {REASON_LABEL[revision.reason]} ·{" "}
                                            {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
                                                revision.savedAt
                                            )}
                                        </p>
                                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                                            {words(revision.content)} words
                                            {delta !== null && delta !== 0 && (
                                                <span className={delta > 0 ? "text-emerald-400" : "text-red-400"}>
                                                    {" "}
                                                    ({delta > 0 ? "+" : "−"}
                                                    {Math.abs(delta)})
                                                </span>
                                            )}
                                            {" · "}
                                            {revision.title}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onRestore(revision);
                                            onClose();
                                        }}
                                        className="press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 text-xs font-semibold text-foreground cursor-pointer shrink-0"
                                    >
                                        <RotateCcw size={12} /> Restore
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </dialog>
    );
}
