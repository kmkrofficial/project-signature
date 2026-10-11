"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Wordmark } from "@/components/layout/Wordmark";
import { SearchModal } from "@/components/blog/SearchModal";

/**
 * Same box as the real header, so the page doesn't shift while it streams in. Routes with dynamic params
 * (articles, draft previews) can't know the pathname when they are prerendered, so the header sits behind
 * a Suspense boundary and this stands in for it.
 */
function HeaderFallback() {
    return (
        <header className="site-header sticky top-0 z-40 bg-background/85 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
                <Link href="/" className="py-1 text-primary" aria-label="Signature home">
                    <Wordmark className="h-5 sm:h-6" />
                </Link>
            </div>
        </header>
    );
}

/** Public site header plus the Cmd/Ctrl+K search palette it controls. */
export function SiteHeader() {
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            <Suspense fallback={<HeaderFallback />}>
                <Header onOpenSearch={() => setSearchOpen(true)} />
            </Suspense>
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
