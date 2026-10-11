"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    Link2,
    Quote,
    Strikethrough,
    Trash2,
    Unlink,
} from "lucide-react";
import { clsx } from "clsx";
import type { SlashItem } from "./slash";

// ------------------------------------------------------------------ shared helpers

/** Keeps a floating box inside the viewport. */
function clampLeft(center: number, width: number) {
    const margin = 8;
    return Math.min(Math.max(center - width / 2, margin), window.innerWidth - width - margin);
}

const toolButton =
    "press inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer";

// ------------------------------------------------------------------ slash menu

export interface SlashState {
    items: SlashItem[];
    index: number;
    rect: DOMRect | null;
    choose: (item: SlashItem) => void;
}

/** The "/" command list, positioned under the caret. Keyboard handling lives in the editor extension. */
export function SlashMenu({ state }: { state: SlashState | null }) {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    }, [state?.index]);

    if (!state || !state.rect) return null;
    const width = 288;
    const left = clampLeft(state.rect.left, width) + width / 2;
    const below = state.rect.bottom + 6;
    const flip = below + 320 > window.innerHeight;

    return (
        <div
            role="listbox"
            aria-label="Insert"
            className="fixed z-[60] w-72 rounded-xl border border-border bg-card shadow-2xl"
            style={{ left: left - width / 2, top: flip ? undefined : below, bottom: flip ? window.innerHeight - state.rect.top + 6 : undefined }}
            // Keep the editor's selection while clicking an item
            onMouseDown={(event) => event.preventDefault()}
        >
            {state.items.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground">No matching command</p>
            ) : (
                <ul ref={listRef} className="max-h-72 overflow-y-auto p-1.5">
                    {state.items.map((item, index) => {
                        const Icon = item.icon;
                        const selected = index === state.index;
                        return (
                            <li key={item.id} role="option" aria-selected={selected}>
                                <button
                                    type="button"
                                    onClick={() => state.choose(item)}
                                    className={clsx(
                                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left cursor-pointer",
                                        selected ? "bg-secondary" : "hover:bg-secondary/60"
                                    )}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                                        <Icon size={15} aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-foreground">{item.title}</span>
                                        <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ selection toolbar

const isSafeHref = (href: string) => /^(https?:\/\/|mailto:|\/|#)/i.test(href.trim());

/**
 * Floating toolbar for the selected text (formatting and links), and for a selected image (caption).
 * Positioned from ProseMirror's own coordinates, so it needs no positioning library.
 */
export function SelectionToolbar({ editor }: { editor: Editor }) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [href, setHref] = useState("");
    const boxRef = useRef<HTMLDivElement>(null);

    const state = useEditorState({
        editor,
        selector: ({ editor: e }) => {
            const { from, to, empty } = e.state.selection;
            const node = (e.state.selection as unknown as { node?: { type: { name: string }; attrs: Record<string, unknown> } }).node;
            return {
                from,
                to,
                empty,
                focused: e.isFocused,
                image: node?.type.name === "image" ? { alt: String(node.attrs.alt ?? "") } : null,
                inCode: e.isActive("codeBlock"),
                bold: e.isActive("bold"),
                italic: e.isActive("italic"),
                strike: e.isActive("strike"),
                code: e.isActive("code"),
                h2: e.isActive("heading", { level: 2 }),
                h3: e.isActive("heading", { level: 3 }),
                quote: e.isActive("blockquote"),
                link: e.isActive("link"),
                linkHref: String(e.getAttributes("link").href ?? ""),
            };
        },
    });

    const visible = Boolean(state) && (state.image !== null || (!state.empty && !state.inCode && state.focused));

    // Place the toolbar above the selection (below it when there is no room)
    const [place, setPlace] = useState<{ left: number; top: number } | null>(null);
    useEffect(() => {
        if (!visible) return;
        const frame = requestAnimationFrame(() => {
            try {
                const start = editor.view.coordsAtPos(state.from);
                const end = editor.view.coordsAtPos(state.to);
                const width = boxRef.current?.offsetWidth ?? 300;
                const height = boxRef.current?.offsetHeight ?? 40;
                const center = (start.left + end.right) / 2;
                const above = Math.min(start.top, end.top) - height - 8;
                setPlace({
                    left: clampLeft(center, width),
                    top: above < 8 ? Math.max(start.bottom, end.bottom) + 8 : above,
                });
            } catch {
                setPlace(null);
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [visible, editor, state?.from, state?.to, linkOpen]);

    if (!visible || !state) return null;

    const applyLink = () => {
        const value = href.trim();
        if (value === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else if (isSafeHref(value)) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: value }).run();
        } else if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: `https://${value}` }).run();
        } else {
            return;
        }
        setLinkOpen(false);
    };

    const wrapperStyle: React.CSSProperties = {
        position: "fixed",
        left: place?.left ?? -9999,
        top: place?.top ?? -9999,
        zIndex: 60,
    };

    // A selected image: its alt text doubles as the caption on the site
    if (state.image) {
        return (
            <div
                ref={boxRef}
                style={wrapperStyle}
                onMouseDown={(event) => {
                    if ((event.target as HTMLElement).tagName !== "INPUT") event.preventDefault();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-2xl"
            >
                <input
                    type="text"
                    value={state.image.alt}
                    onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
                    placeholder="Caption / alt text"
                    aria-label="Image caption and alt text"
                    className="h-8 w-64 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                    type="button"
                    title="Remove image"
                    aria-label="Remove image"
                    onClick={() => editor.chain().focus().deleteSelection().run()}
                    className={clsx(toolButton, "hover:text-red-400")}
                >
                    <Trash2 size={15} />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={boxRef}
            style={wrapperStyle}
            onMouseDown={(event) => {
                if ((event.target as HTMLElement).tagName !== "INPUT") event.preventDefault();
            }}
            className="flex items-center gap-0.5 rounded-xl border border-border bg-card p-1 shadow-2xl"
        >
            {linkOpen ? (
                <div className="flex items-center gap-1.5 p-0.5">
                    <input
                        autoFocus
                        type="text"
                        value={href}
                        onChange={(e) => setHref(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                applyLink();
                            } else if (e.key === "Escape") {
                                setLinkOpen(false);
                                editor.commands.focus();
                            }
                        }}
                        placeholder="https://…"
                        aria-label="Link address"
                        className="h-8 w-56 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={applyLink}
                        className="press h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            ) : (
                <>
                    <button type="button" title="Bold (Ctrl+B)" aria-label="Bold" aria-pressed={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} className={clsx(toolButton, state.bold && "bg-secondary text-foreground")}>
                        <Bold size={15} />
                    </button>
                    <button type="button" title="Italic (Ctrl+I)" aria-label="Italic" aria-pressed={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx(toolButton, state.italic && "bg-secondary text-foreground")}>
                        <Italic size={15} />
                    </button>
                    <button type="button" title="Strikethrough" aria-label="Strikethrough" aria-pressed={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()} className={clsx(toolButton, state.strike && "bg-secondary text-foreground")}>
                        <Strikethrough size={15} />
                    </button>
                    <button type="button" title="Inline code" aria-label="Inline code" aria-pressed={state.code} onClick={() => editor.chain().focus().toggleCode().run()} className={clsx(toolButton, state.code && "bg-secondary text-foreground")}>
                        <Code size={15} />
                    </button>
                    <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                    <button type="button" title="Heading 2" aria-label="Heading 2" aria-pressed={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx(toolButton, state.h2 && "bg-secondary text-foreground")}>
                        <Heading2 size={15} />
                    </button>
                    <button type="button" title="Heading 3" aria-label="Heading 3" aria-pressed={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={clsx(toolButton, state.h3 && "bg-secondary text-foreground")}>
                        <Heading3 size={15} />
                    </button>
                    <button type="button" title="Quote" aria-label="Quote" aria-pressed={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={clsx(toolButton, state.quote && "bg-secondary text-foreground")}>
                        <Quote size={15} />
                    </button>
                    <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                    {state.link ? (
                        <button type="button" title="Remove link" aria-label="Remove link" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} className={clsx(toolButton, "bg-secondary text-foreground")}>
                            <Unlink size={15} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            title="Add link (Ctrl+K)"
                            aria-label="Add link"
                            onClick={() => {
                                setHref(state.linkHref);
                                setLinkOpen(true);
                            }}
                            className={toolButton}
                        >
                            <Link2 size={15} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
