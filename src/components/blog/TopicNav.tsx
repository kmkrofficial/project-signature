import Link from "next/link";
import { clsx } from "clsx";
import { TOPICS } from "@/lib/categoryUtils";

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
                                    "block px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors",
                                    isActive
                                        ? "bg-foreground text-background border-foreground font-medium"
                                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                                )}
                            >
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
