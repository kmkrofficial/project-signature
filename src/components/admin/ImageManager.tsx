"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Copy, Check, Image as ImageIcon, Search, ArrowUpDown } from "lucide-react";

interface ImageManagerProps {
    mode?: "full" | "sidebar";
    onSelect?: (url: string, name: string) => void;
}

interface ImageItem {
    name: string;
    url: string;
    thumbnailUrl?: string;
    fullPath: string; // This is the S3 Key
    timeCreated: string;
    size: number;
}

// Sub-component for robust image loading
function ImageWithFallback({ src, fallbackSrc, alt, className }: { src: string, fallbackSrc: string, alt: string, className?: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <>
            <img
                src={imgSrc}
                alt={alt}
                className={`${className} ${hasError && imgSrc === fallbackSrc ? 'hidden' : ''}`}
                loading="lazy"
                onError={() => {
                    console.warn(`Image failed to load: ${imgSrc}`);
                    if (imgSrc !== fallbackSrc) {
                        console.log(`Switching to fallback: ${fallbackSrc}`);
                        setImgSrc(fallbackSrc);
                    } else {
                        console.error(`Fallback also failed: ${fallbackSrc}`);
                        setHasError(true);
                    }
                }}
            />
            {hasError && imgSrc === fallbackSrc && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-xs text-red-500 p-2 text-center break-all">
                    <span>Failed to load</span>
                    <span className="text-[10px] text-gray-400 mt-1">{src}</span>
                </div>
            )}
        </>
    );
}

export function ImageManager({ mode = "full", onSelect }: ImageManagerProps) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false); // Track if we've loaded at least once
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Auto-fetch on mount for both modes, assuming parent handles conditional rendering 
    // (e.g. sidebar only mounts when open).
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/images');
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setImages(data);
            setHasLoaded(true);
        } catch (error: any) {
            console.error("Error fetching images:", error);
            setError("Failed to load images. Check your configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/images', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            await fetchImages(); // Refresh list
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const res = await fetch(`/api/images?key=${encodeURIComponent(key)}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Delete failed");

            setImages(prev => prev.filter(img => img.fullPath !== key));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete image");
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const sortedImages = [...images]
        .filter(img => (img.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const timeA = new Date(a.timeCreated).getTime();
            const timeB = new Date(b.timeCreated).getTime();

            if (sortOrder === "newest") return timeB - timeA;
            if (sortOrder === "oldest") return timeA - timeB;
            return a.name.localeCompare(b.name);
        });

    return (
        <div className={`flex flex-col h-full ${mode === "sidebar" ? "p-2" : "p-0"}`}>
            {/* Header / Controls */}
            <div className={`flex ${mode === "sidebar" ? "flex-col gap-2" : "flex-row justify-between items-center"} mb-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="text-primary" size={mode === "sidebar" ? 16 : 20} />
                        <h2 className={`${mode === "sidebar" ? "text-sm" : "text-lg"} font-bold`}>Library</h2>
                        {hasLoaded && (
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                {images.length}
                            </span>
                        )}
                    </div>

                </div>

                {hasLoaded && (
                    <div className={`flex gap-1.5 ${mode === "sidebar" ? "flex-wrap" : ""}`}>
                        <label className={`cursor-pointer bg-primary text-primary-foreground hover:opacity-90 rounded flex items-center justify-center gap-1 transition-all ${mode === "sidebar" ? "p-1.5 flex-1 text-xs" : "px-3 py-1.5 text-sm"}`}>
                            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                            <span>Upload</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                        </label>

                        <button
                            onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : prev === "oldest" ? "name" : "newest")}
                            className="p-1.5 border border-border rounded hover:bg-secondary text-muted-foreground"
                            title="Sort Order"
                        >
                            <ArrowUpDown size={14} />
                        </button>

                        <button
                            onClick={fetchImages}
                            className="p-1.5 border border-border rounded hover:bg-secondary text-muted-foreground"
                            title="Refresh"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {hasLoaded ? (
                <>
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-xs p-2 rounded mb-2 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* Search - Only show if loaded */}
                    <div className="relative mb-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-7 pr-2 py-1 text-xs bg-secondary rounded border border-transparent focus:border-primary outline-none"
                        />
                    </div>

                    {/* Grid */}
                    {/* FIXED: Sidebar mode uses 1 column (compact) or 2 columns if space permits, but usually 1 is safer for "taking less space". */}
                    <div className={`grid ${mode === "sidebar" ? "grid-cols-2 gap-2 pr-1" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pr-1"} overflow-y-auto flex-1 content-start`}>
                        {loading ? (
                            <div className="col-span-full flex flex-col justify-center items-center py-10 text-muted-foreground gap-3">
                                <Loader2 className="animate-spin" size={20} />
                            </div>
                        ) : sortedImages.length === 0 && !error ? (
                            <div className="col-span-full text-center py-4 text-muted-foreground text-xs border border-dashed border-border rounded">
                                No images.
                            </div>
                        ) : (
                            sortedImages.map((img) => (
                                <div key={img.fullPath} className="group relative border border-border rounded bg-card overflow-hidden hover:border-primary/50 transition-colors">
                                    {/* Image Preview - Shows Thumbnail */}
                                    <div className="aspect-square bg-secondary/50 relative">
                                        <ImageWithFallback
                                            src={img.thumbnailUrl || img.url}
                                            fallbackSrc={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(img.url)}
                                                className="p-1.5 bg-background/90 rounded-full hover:bg-white text-foreground transition-colors"
                                                title="Copy HD URL"
                                            >
                                                {copiedUrl === img.url ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(img.fullPath)}
                                                className="p-1.5 bg-red-500/90 rounded-full hover:bg-red-500 text-white transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            {onSelect && (
                                                <button
                                                    onClick={() => onSelect(img.url, img.name)}
                                                    className="p-1.5 bg-primary/90 rounded-full hover:bg-primary text-primary-foreground transition-colors"
                                                    title="Use Image"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Info - Hidden in Sidebar mode to save space, or very small */}
                                    {mode !== "sidebar" && (
                                        <div className="p-2">
                                            <p className="text-xs font-mono truncate" title={img.name}>
                                                {img.name.split('-').slice(1).join('-') || img.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {img.size ? (img.size / 1024).toFixed(1) + " KB" : "Unknown"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                /* Not Loaded State for Sidebar */
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <ImageIcon size={24} className="mb-2 opacity-20" />
                    <p className="text-xs">Library not loaded</p>
                </div>
            )}
        </div>
    );
}
