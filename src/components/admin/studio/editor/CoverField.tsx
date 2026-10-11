"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/context/ToastContext";
import { articleFolder, uploadImage } from "@/lib/upload-image";
import { MediaPicker } from "./MediaPicker";
import type { DraftPost } from "../types";

interface Props {
    post: DraftPost;
    setPost: React.Dispatch<React.SetStateAction<DraftPost>>;
    /** Uploads go to this article's folder. */
    articleId: string;
}

/** Cover image: upload, drop a file, pick from the library, or paste a URL. */
export function CoverField({ post, setPost, articleId }: Props) {
    const { addToast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const setCover = (url: string) => setPost((prev) => ({ ...prev, coverImage: url }));

    const upload = async (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            addToast("Choose an image file", "error");
            return;
        }
        setUploading(true);
        try {
            setCover((await uploadImage(file, undefined, articleFolder(articleId))).url);
        } catch (err: unknown) {
            addToast("Failed to upload image: " + (err instanceof Error ? err.message : String(err)), "error");
        } finally {
            setUploading(false);
        }
    };

    const needsCover = Boolean(post.featured) && !post.coverImage;

    return (
        <div
            onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("Files")) return;
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                setDragging(false);
                const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
                if (!file) return;
                e.preventDefault();
                void upload(file);
            }}
            className={clsx(
                "space-y-2 p-3.5 rounded-xl border transition-colors",
                dragging
                    ? "border-primary bg-primary/10"
                    : needsCover
                      ? "border-amber-500/30 bg-amber-500/10"
                      : post.featured
                        ? "border-primary/20 bg-primary/5"
                        : "border-transparent"
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cover image
                </label>
                <span className="text-[11px] font-mono">
                    {post.featured ? (
                        post.coverImage ? (
                            <span className="text-emerald-500 font-medium">✓ Attached (required for Spotlight)</span>
                        ) : (
                            <span className="text-amber-500 dark:text-amber-400 font-medium">Required for Spotlight</span>
                        )
                    ) : (
                        <span className="text-muted-foreground/70">Optional</span>
                    )}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <label className="press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-xs font-semibold text-foreground cursor-pointer">
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    <span>{uploading ? "Uploading…" : "Upload"}</span>
                    <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) => {
                            const input = e.target;
                            void upload(input.files?.[0]).then(() => {
                                input.value = "";
                            });
                        }}
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-xs font-semibold text-foreground cursor-pointer"
                >
                    <ImageIcon size={13} />
                    <span>Library</span>
                </button>
                <input
                    type="url"
                    value={post.coverImage || ""}
                    onChange={(e) => setCover(e.target.value)}
                    placeholder="…or paste an image URL, or drop a file here"
                    className="flex-1 min-w-[12rem] px-3.5 py-2 bg-secondary/40 border border-border focus:border-primary rounded-xl text-xs text-foreground focus:outline-none transition-colors font-mono"
                />
                {post.coverImage && (
                    <button
                        type="button"
                        onClick={() => setCover("")}
                        className="press px-2.5 py-2 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-xs text-muted-foreground hover:text-red-400 cursor-pointer"
                        title="Clear image"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {post.coverImage && (
                <div className="animate-fade-in relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-border/80 bg-secondary/20">
                    <NextImage src={post.coverImage} alt="Cover preview" fill unoptimized className="object-cover" />
                </div>
            )}

            <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={(image) => setCover(image.url)}
                articleId={articleId}
            />
        </div>
    );
}
