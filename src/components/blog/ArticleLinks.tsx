import type { ComponentType } from "react";
import { ArrowUpRight, Link2 } from "lucide-react";
import { clsx } from "clsx";
import { GitHubIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/ui/BrandIcons";
import { linkKind, prettyUrl, type LinkKind } from "@/lib/post-links";
import type { PostLink } from "@/types/blog";

const ICONS: Record<LinkKind, ComponentType<{ size?: number; className?: string }>> = {
    github: GitHubIcon,
    linkedin: LinkedInIcon,
    youtube: YouTubeIcon,
    x: XIcon,
    link: Link2,
};

/** The icon for whatever the URL points at: GitHub, LinkedIn, YouTube, X, or a plain link. */
export function LinkKindIcon({ url, size = 16, className }: { url: string; size?: number; className?: string }) {
    const Icon = ICONS[linkKind(url)];
    return <Icon size={size} aria-hidden="true" className={clsx("shrink-0", className)} />;
}

interface Props {
    links: PostLink[];
    /** "rail" is the compact list beside the article; "cards" is the grid at its end on small screens. */
    layout: "rail" | "cards";
    className?: string;
}

/** Outside resources that go with an article: source code, discussions, demos, references. */
export function ArticleLinks({ links, layout, className }: Props) {
    if (links.length === 0) return null;
    const rail = layout === "rail";

    return (
        <section aria-label="Resources" className={clsx(rail && "text-sm", className)}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resources</p>
            <ul className={rail ? "space-y-1" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                {links.map((link) => (
                    <li key={link.url}>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                                "group flex gap-2.5",
                                rail
                                    ? "-mx-2 px-2 py-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                                    : "lift press h-full p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50"
                            )}
                        >
                            <LinkKindIcon
                                url={link.url}
                                size={rail ? 15 : 17}
                                className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="flex items-start gap-1 font-medium text-foreground leading-snug">
                                    <span className={clsx("min-w-0", link.label ? "line-clamp-2" : "truncate")}>
                                        {link.label || prettyUrl(link.url)}
                                    </span>
                                    <ArrowUpRight
                                        size={13}
                                        aria-hidden="true"
                                        className="mt-0.5 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px transition-[opacity,translate]"
                                    />
                                    <span className="sr-only">(opens in a new tab)</span>
                                </span>
                                {link.note && (
                                    <span className="block mt-0.5 text-xs text-muted-foreground leading-snug">{link.note}</span>
                                )}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
