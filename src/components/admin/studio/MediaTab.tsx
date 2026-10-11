"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Copy,
    FileText,
    Folder,
    Loader2,
    Plus,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { clsx } from "clsx";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LIBRARY_GROUP, useMedia } from "./hooks/useMedia";
import type { StoredImage } from "./types";
import type { BlogPost } from "@/types/blog";

/** Articles that embed this image in their text or use it as the cover. */
function articlesUsing(image: StoredImage, posts: BlogPost[]): BlogPost[] {
    // The download URL carries a token that can differ, so match on the stored path as well as the full URL
    const needles = [image.url, image.fullPath ? encodeURIComponent(image.fullPath) : ""].filter(Boolean);
    return posts.filter((post) =>
        needles.some((needle) => post.coverImage?.includes(needle) || post.content?.includes(needle))
    );
}

export function MediaTab({ posts }: { posts: BlogPost[] }) {
    const { images, loading, uploads, uploading, copiedUrl, uploadFiles, dismissUploads, copySnippet, remove } =
        useMedia(true);
    const [pendingDelete, setPendingDelete] = useState<StoredImage | null>(null);
    const [dragging, setDragging] = useState(false);
    const [unusedOnly, setUnusedOnly] = useState(false);

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const files = [...(input.files ?? [])];
        input.value = "";
        if (files.length > 0) void uploadFiles(files);
    };

    const pendingUsers = pendingDelete ? articlesUsing(pendingDelete, posts) : [];

    const finished = uploads.filter((item) => item.status === "done" || item.status === "error").length;
    const overall = uploads.length > 0 ? uploads.reduce((sum, item) => sum + item.progress, 0) / uploads.length : 0;
    const hasErrors = uploads.some((item) => item.status === "error");

    // Group the images: the shared library first, then one section per article
    const visible = unusedOnly ? images.filter((image) => articlesUsing(image, posts).length === 0) : images;
    const titleOf = (group: string) =>
        group === LIBRARY_GROUP
            ? "Library"
            : (posts.find((post) => post.id === group)?.title ?? "Unsaved or removed article");
    const groupKeys = [...new Set(visible.map((image) => image.group))].sort((a, b) =>
        a === LIBRARY_GROUP ? -1 : b === LIBRARY_GROUP ? 1 : titleOf(a).localeCompare(titleOf(b))
    );

    return (
        <div className="animate-fade-up space-y-6">
            {/* Media Upload Banner */}
            <div
                onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes("Files")) return;
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const files = [...e.dataTransfer.files];
                    if (files.length > 0) void uploadFiles(files);
                }}
                className={clsx(
                    "p-6 rounded-2xl bg-card border border-dashed text-center transition-colors",
                    dragging ? "border-primary bg-primary/5" : "border-border/80 hover:border-primary/50"
                )}
            >
                <UploadCloud size={32} className="mx-auto text-primary mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Upload images to the library</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                    Select as many images as you like, or drop them here. Each one is compressed in your browser
                    (max 1600px, 82% WebP) before it is uploaded. Images added while writing an article are kept in
                    that article&apos;s own folder.
                </p>

                <label className="press inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 cursor-pointer shadow-md">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>
                        {uploading ? `Uploading ${finished} of ${uploads.length}…` : "Select images from disk"}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFiles}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                {uploads.length > 0 && (
                    <div className="animate-fade-in mx-auto mt-5 max-w-lg space-y-3 text-left">
                        <div
                            role="progressbar"
                            aria-label="Overall upload progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(overall * 100)}
                            className="h-1 w-full overflow-hidden rounded-full bg-secondary"
                        >
                            <div
                                className="h-full origin-left bg-primary transition-transform duration-200 ease-out"
                                style={{ transform: `scaleX(${Math.max(overall, 0.03)})` }}
                            />
                        </div>

                        <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {uploads.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-xs"
                                >
                                    {item.status === "done" ? (
                                        <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-label="Uploaded" />
                                    ) : item.status === "error" ? (
                                        <AlertCircle size={14} className="shrink-0 text-red-400" aria-label="Failed" />
                                    ) : item.status === "uploading" ? (
                                        <Loader2 size={14} className="shrink-0 animate-spin text-primary" aria-label="Uploading" />
                                    ) : (
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" aria-label="Waiting" />
                                    )}
                                    <span className="min-w-0 flex-1 truncate text-foreground" title={item.name}>
                                        {item.name}
                                    </span>
                                    <span
                                        className={clsx(
                                            "shrink-0 font-mono text-[11px]",
                                            item.status === "error" ? "text-red-400" : "text-muted-foreground"
                                        )}
                                    >
                                        {item.status === "error"
                                            ? "failed"
                                            : item.status === "done"
                                              ? "done"
                                              : item.status === "uploading"
                                                ? `${Math.round(item.progress * 100)}%`
                                                : "waiting"}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {!uploading && hasErrors && (
                            <button
                                type="button"
                                onClick={dismissUploads}
                                className="press text-[11px] font-mono text-primary hover:underline cursor-pointer"
                            >
                                Clear list
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filter */}
            {!loading && images.length > 0 && (
                <div className="flex items-center justify-between gap-3 px-1">
                    <p className="text-xs font-mono text-muted-foreground">
                        {visible.length} of {images.length} image{images.length === 1 ? "" : "s"}
                    </p>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                        <input
                            type="checkbox"
                            checked={unusedOnly}
                            onChange={(e) => setUnusedOnly(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        Show only images not used anywhere
                    </label>
                </div>
            )}

            {/* Images, grouped */}
            {loading ? (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <p className="text-xs font-mono">Loading media assets from Firebase Storage...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                    No uploaded media yet. Upload diagrams, architecture schematics, or post covers above.
                </div>
            ) : visible.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs font-mono">
                    Every image is used in at least one article.
                </div>
            ) : (
                <div className="space-y-8">
                    {groupKeys.map((group) => {
                        const groupImages = visible.filter((image) => image.group === group);
                        return (
                            <section key={group} aria-label={titleOf(group)} className="space-y-3">
                                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Folder size={14} className="text-primary" aria-hidden="true" />
                                    <span className="truncate">{titleOf(group)}</span>
                                    <span className="font-mono normal-case opacity-70">{groupImages.length}</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupImages.map((img, i) => {
                                        const users = articlesUsing(img, posts);
                                        return (
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
                                                    <p
                                                        className={clsx(
                                                            "flex items-center gap-1 text-[11px] font-mono",
                                                            users.length > 0 ? "text-emerald-400" : "text-muted-foreground"
                                                        )}
                                                        title={users.map((post) => post.title).join("\n")}
                                                    >
                                                        <FileText size={11} aria-hidden="true" />
                                                        {users.length > 0
                                                            ? `Used in ${users.length} article${users.length === 1 ? "" : "s"}`
                                                            : "Not used anywhere"}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => copySnippet(img.url, img.name)}
                                                            className="press flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary text-xs font-medium text-foreground cursor-pointer"
                                                        >
                                                            {copiedUrl === img.url ? (
                                                                <>
                                                                    <Check size={13} className="animate-pop text-emerald-400" />
                                                                    <span>Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={13} />
                                                                    <span>Copy Markdown</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPendingDelete(img)}
                                                            aria-label={`Delete ${img.name}`}
                                                            title="Delete image"
                                                            className="press p-2 rounded-lg border border-border hover:border-red-500/30 bg-secondary/40 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 cursor-pointer"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title={pendingUsers.length > 0 ? "This image is in use" : "Delete this image?"}
                description={
                    pendingUsers.length > 0
                        ? `It appears in ${pendingUsers.map((post) => `“${post.title}”`).join(", ")}. Deleting it will leave a broken image there.`
                        : "It will be removed from storage. This cannot be undone."
                }
                onClose={() => setPendingDelete(null)}
                actions={[
                    { label: "Cancel", onClick: () => setPendingDelete(null) },
                    {
                        label: pendingUsers.length > 0 ? "Delete anyway" : "Delete",
                        tone: "danger",
                        onClick: () => {
                            const target = pendingDelete;
                            setPendingDelete(null);
                            if (target?.fullPath) void remove(target.fullPath);
                        },
                    },
                ]}
            />
        </div>
    );
}
