"use client";

import React, { useEffect, useRef } from "react";
import NextImage from "next/image";
import { Loader2, X } from "lucide-react";
import { useMedia } from "../hooks/useMedia";

interface Props {
    open: boolean;
    onClose: () => void;
    onPick: (url: string) => void;
}

/** Pick an already uploaded image from the media library. */
export function MediaPicker({ open, onClose, onPick }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { images, loading } = useMedia(open);

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
            aria-label="Choose an image from the media library"
            className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[80vh] p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-foreground">Media library</h2>
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
                    <div className="py-12 flex justify-center text-primary">
                        <Loader2 size={22} className="animate-spin" />
                    </div>
                ) : images.length === 0 ? (
                    <p className="py-10 text-center text-xs text-muted-foreground">
                        No images yet. Upload one from the Media tab or drop it onto the cover field.
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] pr-1">
                        {images.map((img) => (
                            <li key={img.fullPath ?? img.url}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onPick(img.url);
                                        onClose();
                                    }}
                                    className="press group block w-full overflow-hidden rounded-xl border border-border hover:border-primary/60 cursor-pointer text-left"
                                >
                                    <span className="relative block h-28 bg-secondary/40">
                                        <NextImage
                                            src={img.url}
                                            alt={img.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 50vw, 200px"
                                            className="object-cover"
                                        />
                                    </span>
                                    <span className="block truncate px-2.5 py-1.5 text-[11px] text-muted-foreground group-hover:text-foreground">
                                        {img.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </dialog>
    );
}
