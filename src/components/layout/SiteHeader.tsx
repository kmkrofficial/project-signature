"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { SearchModal } from "@/components/blog/SearchModal";

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
            <Header onOpenSearch={() => setSearchOpen(true)} />
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
