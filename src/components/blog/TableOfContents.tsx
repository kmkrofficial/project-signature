"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import type { PostHeading } from "@/types/blog";

interface TableOfContentsProps {
    headings: PostHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState("");
    const trackRef = useRef<HTMLDivElement>(null);

    // The indicator is positioned with CSS custom properties, so moving it never re-renders React
    const moveIndicator = (id: string) => {
        const track = trackRef.current;
        const link = track?.querySelector<HTMLElement>(`a[href="#${CSS.escape(id)}"]`);
        if (!track || !link) return;
        track.style.setProperty("--toc-y", `${link.offsetTop}px`);
        track.style.setProperty("--toc-h", String(link.offsetHeight));
    };

    // Scroll-spy: highlight the heading nearest the top of the viewport
    useEffect(() => {
        const elements = headings
            .map((heading) => document.getElementById(heading.id))
            .filter((el): el is HTMLElement => el !== null);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) {
                    setActiveId(visible.target.id);
                    moveIndicator(visible.target.id);
                }
            },
            { rootMargin: "-80px 0px -65% 0px" }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav aria-label="Table of contents" className="text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
            <div ref={trackRef} className="relative">
                <span aria-hidden="true" className="toc-indicator pointer-events-none absolute left-0 top-0 h-px w-0.5 origin-top rounded-full bg-primary" />
                <ul className="space-y-2 border-l border-border">
                    {headings.map((heading) => (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                aria-current={activeId === heading.id ? "location" : undefined}
                                className={clsx(
                                    "block py-0.5 leading-snug transition-[color,translate] duration-200 ease-smooth",
                                    heading.level === 3 ? "pl-6" : "pl-4",
                                    activeId === heading.id
                                        ? "translate-x-0.5 text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
