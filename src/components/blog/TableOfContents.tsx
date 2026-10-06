"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import type { PostHeading } from "@/types/blog";

interface TableOfContentsProps {
    headings: PostHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState("");

    // Scroll-spy: highlight the heading nearest the top of the viewport
    useEffect(() => {
        const elements = headings
            .map((heading) => document.getElementById(heading.id))
            .filter((el): el is HTMLElement => el !== null);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) setActiveId(visible.target.id);
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
            <ul className="space-y-2 border-l border-border">
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            aria-current={activeId === heading.id ? "location" : undefined}
                            className={clsx(
                                "-ml-px block border-l-2 py-0.5 leading-snug transition-colors",
                                heading.level === 3 ? "pl-6" : "pl-4",
                                activeId === heading.id
                                    ? "border-primary text-foreground font-medium"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
