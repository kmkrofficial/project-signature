"use client";

import React from "react";
import NextImage from "next/image";
import { Check, Copy, Loader2, Plus, UploadCloud } from "lucide-react";
import { clsx } from "clsx";
import { useMedia } from "./hooks/useMedia";

export function MediaTab() {
    const { images, loading, uploading, progress, copiedUrl, upload, copySnippet } = useMedia(true);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (file) await upload(file);
        input.value = "";
    };

    return (
        <div className="animate-fade-up space-y-6">
            {/* Media Upload Banner */}
            <div className="p-6 rounded-2xl bg-card border border-dashed border-border/80 text-center hover:border-primary/50 transition-colors">
                <UploadCloud size={32} className="mx-auto text-primary mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Upload Media to Publication Bucket</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                    Images are automatically pre-compressed via client canvas (max 1600px, 82% WebP) before upload to conserve bandwidth.
                </p>

                <label className="press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 cursor-pointer shadow-md">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>{uploading ? "Compressing & Uploading..." : "Select Image from Disk"}</span>
                    <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
                </label>

                {uploading && (
                    <div
                        role="progressbar"
                        aria-label="Upload progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(progress * 100)}
                        className="animate-fade-in mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-secondary"
                    >
                        <div
                            className="h-full origin-left bg-primary transition-transform duration-200 ease-out"
                            style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }}
                        />
                    </div>
                )}
            </div>

            {/* Images Grid */}
            {loading ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <p className="text-xs font-mono">Loading media assets from Firebase Storage...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                    No uploaded media yet. Upload diagrams, architecture schematics, or post covers above.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img, i) => (
                        <div
                            key={img.fullPath ?? i}
                            className={clsx(
                                "rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-colors flex flex-col justify-between",
                                img.fresh && "animate-pop"
                            )}
                        >
                            <div className="h-44 w-full bg-secondary/50 relative overflow-hidden flex items-center justify-center">
                                <NextImage
                                    src={img.url}
                                    alt={img.name}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {img.size && (
                                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white backdrop-blur-sm">
                                        {img.size}
                                    </span>
                                )}
                            </div>
                            <div className="p-3.5 space-y-2">
                                <p className="text-xs font-medium text-foreground truncate" title={img.name}>
                                    {img.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => copySnippet(img.url, img.name)}
                                    className="press w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground cursor-pointer"
                                >
                                    {copiedUrl === img.url ? (
                                        <>
                                            <Check size={13} className="animate-pop text-emerald-400" />
                                            <span>Copied Snippet!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={13} />
                                            <span>Copy Markdown Snippet</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
