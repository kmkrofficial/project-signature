"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
    onOpenSearch: () => void;
}

const noopSubscribe = () => () => {};
const detectMac = () => /Mac|iPhone|iPad/i.test(navigator.userAgent);

export function Header({ onOpenSearch }: HeaderProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMac = useSyncExternalStore(noopSubscribe, detectMac, () => false);

    // Close the mobile menu on navigation (render-phase update, no effect needed)
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setMobileOpen(false);
    }

    const navLinks = [
        { name: "Articles", href: "/", active: pathname === "/" || pathname.startsWith("/blog") || pathname.startsWith("/topics") },
        { name: "About", href: "/about", active: pathname.startsWith("/about") },
        { name: "RSS", href: "/feed.xml", active: false, plain: true },
    ];

    return (
        <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/60">
            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-card focus:text-foreground focus:shadow-lg"
            >
                Skip to content
            </a>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <Link href="/" className="py-1 select-none" aria-label="Signature home">
                    <span className="font-cinzel font-bold text-xl sm:text-2xl text-primary tracking-wide leading-none">Signature</span>
                </Link>

                <nav aria-label="Main" className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            {...link}
                            className={clsx(
                                "text-sm font-medium py-1 border-b-2 transition-colors",
                                link.active
                                    ? "text-foreground border-primary"
                                    : "text-muted-foreground border-transparent hover:text-foreground"
                            )}
                        />
                    ))}
                </nav>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        aria-label="Search articles"
                        className="flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg md:border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 text-sm transition-colors cursor-pointer"
                    >
                        <Search size={16} />
                        <span className="hidden md:inline">Search</span>
                        <kbd className="hidden lg:inline kbd">{isMac ? "⌘K" : "Ctrl K"}</kbd>
                    </button>

                    <ThemeToggle size="sm" />

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav id="mobile-menu" aria-label="Main" className="md:hidden border-t border-border/60 bg-background px-4 py-3 animate-menu-in">
                    <ul className="flex flex-col">
                        {navLinks.map((link) => (
                            <li key={link.name} className="border-b border-border/40 last:border-0">
                                <NavLink
                                    {...link}
                                    className={clsx("block py-3 text-base font-medium", link.active ? "text-primary" : "text-foreground")}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
}

interface NavLinkProps {
    name: string;
    href: string;
    active: boolean;
    /** Non-page routes (e.g. the RSS feed) use a plain anchor instead of client navigation. */
    plain?: boolean;
    className: string;
}

function NavLink({ name, href, active, plain, className }: NavLinkProps) {
    if (plain) {
        return (
            <a href={href} className={className}>
                {name}
            </a>
        );
    }
    return (
        <Link href={href} aria-current={active ? "page" : undefined} className={className}>
            {name}
        </Link>
    );
}
