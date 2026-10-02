"use client";

import React, { useEffect, useState } from "react";
import { List, ArrowUp } from "lucide-react";
import { clsx } from "clsx";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content?: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Query headings from the rendered article DOM
        const article = document.querySelector("article");
        if (!article) return;

        const elements = Array.from(article.querySelectorAll("h2, h3"));
        const items: TocItem[] = elements.map((el, idx) => {
            if (!el.id) {
                // Generate a friendly id if none exists
                el.id = el.textContent
                    ? el.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                    : `heading-${idx}`;
            }
            return {
                id: el.id,
                text: el.textContent || "",
                level: el.tagName === "H2" ? 2 : 3,
            };
        });

        requestAnimationFrame(() => setHeadings(items));

        // IntersectionObserver for scroll-spy
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0% -60% 0%",
                threshold: 0,
            }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [content]);

    if (headings.length === 0) return null;

    const handleScrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <nav
            aria-label="Table of Contents"
            className="max-h-[calc(100vh-6rem)] overflow-y-auto pl-4 border-l border-border/60 text-xs"
        >
            <p className="font-mono uppercase tracking-wider text-[11px] text-muted-foreground font-semibold mb-2.5 flex items-center gap-1.5">
                <List size={12} className="text-primary" />
                <span>On This Page</span>
            </p>
            <ul className="space-y-1.5">
                {headings.map((item) => {
                    const active = activeId === item.id;
                    return (
                        <li key={item.id} style={{ paddingLeft: item.level === 3 ? "0.75rem" : 0 }}>
                            <button
                                onClick={() => handleScrollTo(item.id)}
                                className={clsx(
                                    "text-left transition-colors duration-150 block w-full py-0.5 leading-snug line-clamp-2 cursor-pointer",
                                    active
                                        ? "text-primary font-semibold -ml-[17px] pl-4 border-l-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.text}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="pt-3 mt-3 border-t border-border/40">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                    <ArrowUp size={12} />
                    <span>Back to top</span>
                </button>
            </div>
        </nav>
    );
}
