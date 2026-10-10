"use client";

import React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { clsx } from "clsx";
import { LinkKindIcon } from "@/components/blog/ArticleLinks";
import { MAX_LINK_LABEL, MAX_LINK_NOTE, MAX_POST_LINKS, linkKind, parseLinkUrl, type LinkKind } from "@/lib/post-links";
import type { PostLink } from "@/types/blog";
import type { DraftPost } from "../types";

interface Props {
    post: DraftPost;
    setPost: React.Dispatch<React.SetStateAction<DraftPost>>;
}

const LABEL_HINTS: Record<LinkKind, string> = {
    github: "Source code",
    linkedin: "LinkedIn discussion",
    youtube: "Talk recording",
    x: "Thread on X",
    link: "Live demo",
};

const input =
    "w-full px-3 py-2 bg-secondary/40 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground";
const iconButton =
    "press p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

/** Related links shown beside the article: repo, LinkedIn post, demo, references. The icon follows the URL. */
export function LinksField({ post, setPost }: Props) {
    const links = post.links ?? [];

    const update = (change: (links: PostLink[]) => PostLink[]) =>
        setPost((prev) => ({ ...prev, links: change(prev.links ?? []) }));
    const edit = (index: number, field: keyof PostLink, value: string) =>
        update((all) => all.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
    const move = (index: number, by: -1 | 1) =>
        update((all) => {
            const next = [...all];
            [next[index], next[index + by]] = [next[index + by], next[index]];
            return next;
        });

    // Problems are shown, not blocked: rows that are not valid are left out when the post is saved
    const problemOf = (link: PostLink, index: number) => {
        const url = link.url.trim();
        if (url === "") return link.label.trim() || link.note.trim() ? "Add a URL, or this link won't be saved" : null;
        const parsed = parseLinkUrl(url);
        if (!parsed) return "Use a full address starting with https://";
        if (links.slice(0, index).some((other) => parseLinkUrl(other.url)?.href === parsed.href)) {
            return "Already listed above";
        }
        return null;
    };

    return (
        <div className="space-y-2 @container">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Related links
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                    {links.length}/{MAX_POST_LINKS} · shown beside the article
                </span>
            </div>

            {links.length === 0 && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Source code, the LinkedIn post, a live demo or a reference. Keep it to the few that matter most.
                </p>
            )}

            <ol className="space-y-2">
                {links.map((link, index) => {
                    const problem = problemOf(link, index);
                    const problemId = `link-${index}-problem`;
                    return (
                        <li key={index} className="animate-pop p-2.5 rounded-xl border border-border/80 bg-background/60 space-y-2">
                            <div className="flex items-center gap-2">
                                <LinkKindIcon url={link.url} size={15} className="text-muted-foreground" />
                                <input
                                    type="url"
                                    inputMode="url"
                                    value={link.url}
                                    onChange={(e) => edit(index, "url", e.target.value)}
                                    onBlur={(e) => {
                                        // "linkedin.com/posts/…" is how addresses usually get pasted
                                        const value = e.target.value.trim();
                                        if (/^[^\s:/]+\.[^\s:/]+/.test(value) && parseLinkUrl(`https://${value}`)) {
                                            edit(index, "url", `https://${value}`);
                                        }
                                    }}
                                    placeholder="https://github.com/you/repo"
                                    aria-label={`Link ${index + 1} URL`}
                                    aria-invalid={problem !== null}
                                    aria-describedby={problem ? problemId : undefined}
                                    className={clsx(input, "font-mono", problem && "border-amber-500/60")}
                                />
                                <div className="flex items-center shrink-0">
                                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up" className={iconButton}>
                                        <ArrowUp size={13} />
                                    </button>
                                    <button type="button" onClick={() => move(index, 1)} disabled={index === links.length - 1} aria-label="Move down" title="Move down" className={iconButton}>
                                        <ArrowDown size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => update((all) => all.filter((_, i) => i !== index))}
                                        aria-label="Remove link"
                                        title="Remove link"
                                        className={clsx(iconButton, "hover:text-red-400")}
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={link.label}
                                    maxLength={MAX_LINK_LABEL}
                                    onChange={(e) => edit(index, "label", e.target.value)}
                                    placeholder={`Label, e.g. ${LABEL_HINTS[linkKind(link.url)]}`}
                                    aria-label={`Link ${index + 1} label`}
                                    className={input}
                                />
                                <input
                                    type="text"
                                    value={link.note}
                                    maxLength={MAX_LINK_NOTE}
                                    onChange={(e) => edit(index, "note", e.target.value)}
                                    placeholder="Note (optional), e.g. p95 latency down 40%"
                                    aria-label={`Link ${index + 1} note`}
                                    className={input}
                                />
                            </div>
                            {problem && (
                                <p id={problemId} className="text-[11px] text-amber-600 dark:text-amber-400">
                                    {problem}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>

            <button
                type="button"
                onClick={() => update((all) => [...all, { url: "", label: "", note: "" }])}
                disabled={links.length >= MAX_POST_LINKS}
                className="press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
                <Plus size={13} />
                Add link
            </button>
        </div>
    );
}
