"use client";

import React, { useEffect, useState } from "react";
import { List, ChevronDown } from "lucide-react";
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
    const [isOpenMobile, setIsOpenMobile] = useState(false);

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

        setHeadings(items);

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

    if (headings.length < 2) return null;

    const handleScrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
            setIsOpenMobile(false);
        }
    };

    return (
        <>
            {/* Mobile Accordion */}
            <div className="lg:hidden mb-8 p-4 rounded-xl bg-secondary/30 border border-border/80">
                <button
                    onClick={() => setIsOpenMobile(!isOpenMobile)}
                    className="flex items-center justify-between w-full text-xs font-mono font-medium text-foreground uppercase tracking-wider"
                >
                    <span className="flex items-center gap-2">
                        <List size={14} className="text-primary" />
                        Table of Contents
                    </span>
                    <ChevronDown size={14} className={clsx("transition-transform", isOpenMobile && "rotate-180")} />
                </button>

                {isOpenMobile && (
                    <ul className="mt-4 space-y-2 border-t border-border/50 pt-3 text-sm">
                        {headings.map((item) => (
                            <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1rem" : 0 }}>
                                <button
                                    onClick={() => handleScrollTo(item.id)}
                                    className={clsx(
                                        "text-left text-xs transition-colors py-1 block w-full truncate",
                                        activeId === item.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Desktop Sticky Sidebar */}
            <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 border-l border-border/60 text-xs">
                <p className="font-mono uppercase tracking-wider text-[11px] text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                    <List size={12} className="text-primary" />
                    On This Page
                </p>
                <ul className="space-y-2">
                    {headings.map((item) => {
                        const active = activeId === item.id;
                        return (
                            <li key={item.id} style={{ paddingLeft: item.level === 3 ? "0.75rem" : 0 }}>
                                <button
                                    onClick={() => handleScrollTo(item.id)}
                                    className={clsx(
                                        "text-left transition-colors duration-150 block w-full py-0.5 leading-snug line-clamp-2",
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
            </div>
        </>
    );
}
