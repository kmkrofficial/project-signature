"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Wordmark } from "@/components/layout/Wordmark";
import { LinkPending } from "@/components/layout/LinkPending";

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
        <header className="site-header sticky top-0 z-40 bg-background/85 backdrop-blur-md">
            <a
                href="#content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-card focus:text-foreground focus:shadow-lg"
            >
                Skip to content
            </a>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <Link href="/" className="press py-1 text-primary hover:opacity-80" aria-label="Signature home">
                    <Wordmark className="h-5 sm:h-6" />
                </Link>

                <nav aria-label="Main" className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            {...link}
                            underline
                            className={clsx(
                                "group/nav relative overflow-hidden py-1.5 text-sm font-medium transition-colors",
                                link.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        />
                    ))}
                </nav>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        aria-label="Search articles"
                        className="group press flex items-center gap-2 p-2 md:px-3 md:py-1.5 rounded-lg md:border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 text-sm cursor-pointer"
                    >
                        <Search size={16} className="transition-transform duration-200 ease-smooth group-hover:scale-110 group-hover:-rotate-6" />
                        <span className="hidden md:inline">Search</span>
                        <kbd className="hidden lg:inline kbd transition-colors group-hover:text-foreground">{isMac ? "⌘K" : "Ctrl K"}</kbd>
                    </button>

                    <ThemeToggle size="sm" />

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        className="press md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                    >
                        <MenuIcon open={mobileOpen} />
                    </button>
                </div>
            </div>

            <nav
                id="mobile-menu"
                aria-label="Main"
                data-open={mobileOpen || undefined}
                className="mobile-menu border-t border-border/60 bg-background px-4 py-3"
            >
                <ul className="flex flex-col">
                    {navLinks.map((link, index) => (
                        <li
                            key={link.name}
                            style={{ "--i": index } as React.CSSProperties}
                            className="border-b border-border/40 last:border-0"
                        >
                            <NavLink
                                {...link}
                                className={clsx("block py-3 text-base font-medium", link.active ? "text-primary" : "text-foreground")}
                            />
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

/** Three bars that morph into an X; transforms only. */
function MenuIcon({ open }: { open: boolean }) {
    const bar = "absolute left-0 h-0.5 w-5 rounded-full bg-current transition-[transform,opacity] duration-200 ease-smooth";
    return (
        <span aria-hidden="true" className="relative block h-4 w-5">
            <span className={clsx(bar, "top-0", open && "translate-y-[7px] rotate-45")} />
            <span className={clsx(bar, "top-[7px]", open && "scale-x-0 opacity-0")} />
            <span className={clsx(bar, "top-[14px]", open && "-translate-y-[7px] -rotate-45")} />
        </span>
    );
}

interface NavLinkProps {
    name: string;
    href: string;
    active: boolean;
    /** Non-page routes (e.g. the RSS feed) use a plain anchor instead of client navigation. */
    plain?: boolean;
    /** Desktop nav: underline for the active page, grows in on hover for the others. */
    underline?: boolean;
    className: string;
}

function NavLink({ name, href, active, plain, underline, className }: NavLinkProps) {
    if (plain) {
        return (
            <a href={href} className={className}>
                {name}
                {underline && <HoverUnderline />}
            </a>
        );
    }
    return (
        <Link href={href} aria-current={active ? "page" : undefined} className={className}>
            {name}
            {underline &&
                (active ? (
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                ) : (
                    <HoverUnderline />
                ))}
            <LinkPending />
        </Link>
    );
}

function HoverUnderline() {
    return (
        <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-foreground/35 transition-transform duration-200 ease-smooth group-hover/nav:scale-x-100"
        />
    );
}
