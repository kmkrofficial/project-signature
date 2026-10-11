"use client";

import React, { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { articleFolder } from "@/lib/upload-image";
import { LIBRARY_GROUP, useMedia } from "../hooks/useMedia";
import type { StoredImage } from "../types";

type Scope = "article" | "library" | "all";

interface Props {
    open: boolean;
    onClose: () => void;
    onPick: (image: StoredImage) => void;
    /** The article being written; its images are listed first and new uploads go to its folder. */
    articleId?: string;
}

/** Pick an image from the media library, or upload new ones straight into the article. */
export function MediaPicker({ open, onClose, onPick, articleId }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { images, loading, uploading, uploadFiles } = useMedia(open);
    const [chosen, setChosen] = useState<Scope | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    const ofArticle = articleId ? images.filter((image) => image.group === articleId) : [];
    // Start on this article's images when it has any, otherwise on the shared library
    const scope: Scope = chosen ?? (ofArticle.length > 0 ? "article" : "library");
    const shown =
        scope === "article"
            ? ofArticle
            : scope === "library"
              ? images.filter((image) => image.group === LIBRARY_GROUP)
              : images;

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const files = [...(input.files ?? [])];
        input.value = "";
        if (files.length === 0) return;
        await uploadFiles(files, articleId ? articleFolder(articleId) : undefined);
        if (articleId) setChosen("article");
    };

    const tabs: { id: Scope; label: string; count: number }[] = [
        ...(articleId ? [{ id: "article" as const, label: "This article", count: ofArticle.length }] : []),
        { id: "library", label: "Library", count: images.filter((i) => i.group === LIBRARY_GROUP).length },
        { id: "all", label: "All", count: images.length },
    ];

    return (
        <dialog
            ref={dialogRef}
            onClose={() => {
                setChosen(null);
                onClose();
            }}
            onClick={(e) => e.target === dialogRef.current && onClose()}
            aria-label="Choose an image from the media library"
            className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[80vh] p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-foreground">Choose an image</h2>
                    <div className="flex items-center gap-2">
                        <label className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:opacity-90">
                            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                            <span>{uploading ? "Uploading…" : "Upload"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={uploading}
                                onChange={handleFiles}
                                className="hidden"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="press p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div role="tablist" aria-label="Image source" className="inline-flex rounded-xl border border-border bg-secondary/30 p-0.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={scope === tab.id}
                            onClick={() => setChosen(tab.id)}
                            className={clsx(
                                "press px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer",
                                scope === tab.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label} <span className="font-mono opacity-70">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center text-primary">
                        <Loader2 size={22} className="animate-spin" />
                    </div>
                ) : shown.length === 0 ? (
                    <p className="py-10 text-center text-xs text-muted-foreground">
                        {scope === "article"
                            ? "No images for this article yet. Use Upload, or paste or drop one into the text."
                            : "No images here yet."}
                    </p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[55vh] pr-1">
                        {shown.map((img) => (
                            <li key={img.fullPath ?? img.url}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onPick(img);
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
