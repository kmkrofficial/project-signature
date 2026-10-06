"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { formatReadingTime } from "@/lib/format";
import type { SearchEntry } from "@/types/blog";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

let indexPromise: Promise<SearchEntry[]> | null = null;

function loadSearchIndex(): Promise<SearchEntry[]> {
    indexPromise ??= fetch("/search-index.json")
        .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : Promise.reject(new Error(`HTTP ${res.status}`))))
        .catch((error) => {
            indexPromise = null;
            throw error;
        });
    return indexPromise;
}

function matches(entry: SearchEntry, query: string): boolean {
    return (
        entry.title.toLowerCase().includes(query) ||
        entry.excerpt.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(query))
    );
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [entries, setEntries] = useState<SearchEntry[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Sync the native dialog with the open state and fetch the index on first open
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (!isOpen) {
            if (dialog.open) dialog.close();
            return;
        }
        if (!dialog.open) dialog.showModal();

        let cancelled = false;
        loadSearchIndex()
            .then((data) => !cancelled && setEntries(data))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!entries) return [];
        return q ? entries.filter((entry) => matches(entry, q)) : entries;
    }, [entries, query]);

    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => (i + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const target = results[selectedIndex];
            if (target) {
                onClose();
                router.push(`/blog/${target.slug}`);
            }
        }
    };

    const status = failed
        ? "Search is unavailable right now."
        : entries === null
          ? "Loading articles…"
          : `No articles found for “${query}”.`;

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => e.target === dialogRef.current && onClose()}
            aria-label="Search articles"
            className="search-dialog mt-[10vh] mx-auto w-[calc(100%-2rem)] max-w-2xl max-h-[75vh] p-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl backdrop:bg-background/70 backdrop:backdrop-blur-sm"
        >
            <div className="flex flex-col max-h-[75vh]">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/80">
                    <Search size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <input
                        type="search"
                        autoFocus
                        placeholder="Search articles, topics, tags…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        aria-label="Search articles"
                        aria-controls="search-results"
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close search"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {results.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground" role="status">
                        {status}
                    </p>
                ) : (
                    <ul ref={listRef} id="search-results" className="overflow-y-auto p-2 space-y-1">
                        {results.map((entry, idx) => (
                            <li key={entry.slug}>
                                <Link
                                    data-index={idx}
                                    href={`/blog/${entry.slug}`}
                                    onClick={onClose}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={clsx(
                                        "group flex items-center justify-between gap-4 p-3 rounded-xl transition-colors",
                                        idx === selectedIndex ? "bg-secondary" : "hover:bg-secondary/60"
                                    )}
                                >
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                            <CategoryBadge category={entry.category} asText />
                                            <span aria-hidden="true">·</span>
                                            {formatReadingTime(entry.readingTime)}
                                        </span>
                                        <span className="block font-semibold truncate">{entry.title}</span>
                                    </span>
                                    <ArrowRight
                                        size={16}
                                        aria-hidden="true"
                                        className={clsx("shrink-0", idx === selectedIndex ? "text-primary" : "text-muted-foreground")}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="hidden sm:flex px-4 py-2.5 border-t border-border/60 items-center gap-4 text-xs text-muted-foreground">
                    <span><kbd className="kbd">↑↓</kbd> Navigate</span>
                    <span><kbd className="kbd">↵</kbd> Open</span>
                    <span><kbd className="kbd">Esc</kbd> Close</span>
                </div>
            </div>
        </dialog>
    );
}
