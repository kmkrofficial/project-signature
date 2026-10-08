import { ViewTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { TOPICS } from "@/lib/categoryUtils";
import { LinkPending } from "@/components/layout/LinkPending";

interface TopicNavProps {
    /** Slug of the active topic; omit for "All". */
    active?: string;
}

export function TopicNav({ active }: TopicNavProps) {
    const items = [{ name: "All", href: "/", slug: undefined }, ...TOPICS.map((t) => ({ ...t, href: `/topics/${t.slug}` }))];

    return (
        <nav aria-label="Topics" className="-mx-4 px-4 overflow-x-auto no-scrollbar">
            <ul className="flex gap-2 w-max">
                {items.map((item) => {
                    const isActive = item.slug === active;
                    return (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={clsx(
                                    "press relative block overflow-hidden px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border",
                                    isActive
                                        ? "border-foreground text-background font-medium"
                                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                                )}
                            >
                                {isActive && (
                                    <ViewTransition name="topic-pill" share="pill-slide" default="none">
                                        <span aria-hidden="true" className="absolute inset-0 bg-foreground" />
                                    </ViewTransition>
                                )}
                                <span className="relative">{item.name}</span>
                                <LinkPending />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
