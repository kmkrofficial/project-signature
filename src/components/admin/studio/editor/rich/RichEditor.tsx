"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/lib/upload-image";
import { altTextFor } from "../../image-markdown";
import { cleanMarkdown, isVisuallySafe } from "./compat";
import { createExtensions } from "./extensions";
import { SelectionToolbar, SlashMenu, type SlashState } from "./Menus";
import { createSlashItems, filterSlashItems, SlashCommand, type SlashProps } from "./slash";

export interface RichEditorHandle {
    /** Inserts an image at the caret (or replaces the selection). */
    insertImage: (image: { src: string; alt?: string }) => void;
    focus: () => void;
}

interface Props {
    /** Receives the editor's imperative handle. (next/dynamic does not forward `ref`.) */
    handleRef?: React.Ref<RichEditorHandle>;
    /** The article as markdown. Changes made elsewhere (restore, load) replace the editor's content. */
    value: string;
    onChange: (markdown: string) => void;
    /** Storage folder for images pasted or dropped into the text. */
    folder: string;
    height: number | string;
    /** The "/image" command and the Insert image button both ask the parent to open its picker. */
    onRequestImage: () => void;
    /** Reports whether the loaded markdown survives a visual round trip unchanged. */
    onCompatibility?: (safe: boolean) => void;
}

/**
 * The visual editor. Content is stored as markdown, exactly like the source editor, so the two are
 * interchangeable: the site's renderer, previews, history and search never see the difference.
 */
export function RichEditor({ handleRef, value, onChange, folder, height, onRequestImage, onCompatibility }: Props) {
    const { addToast } = useToast();
    const [slash, setSlash] = useState<SlashState | null>(null);
    const slashRef = useRef<SlashState | null>(null);
    const editorRef = useRef<Editor | null>(null);
    const lastEmitted = useRef(value);

    // Callbacks and props read from inside editor plugins, kept current without rebuilding the editor
    const latest = useRef({ onChange, folder, onRequestImage, onCompatibility, addToast });
    useEffect(() => {
        latest.current = { onChange, folder, onRequestImage, onCompatibility, addToast };
    });

    const extensions = useMemo(() => {
        // The editor is built once; this arrow runs only when the command is chosen, and always reaches
        // the parent's current handler through the ref.
        // eslint-disable-next-line react-hooks/refs -- called on user action, never during render
        const items = createSlashItems({ onRequestImage: () => latest.current.onRequestImage() });

        const show = (props: SlashProps, index: number) => {
            const next: SlashState = {
                items: props.items,
                index,
                rect: props.clientRect?.() ?? null,
                choose: (item) => props.command(item),
            };
            slashRef.current = next;
            setSlash(next);
        };

        return createExtensions([
            SlashCommand.configure({
                suggestion: {
                    items: ({ query }) => filterSlashItems(items, query),
                    render: () => ({
                        onStart: (props) => show(props, 0),
                        onUpdate: (props) =>
                            show(props, Math.min(slashRef.current?.index ?? 0, Math.max(props.items.length - 1, 0))),
                        onKeyDown: ({ event }) => {
                            const current = slashRef.current;
                            if (!current || current.items.length === 0) return false;

                            const move = (delta: number) => {
                                const index = (current.index + delta + current.items.length) % current.items.length;
                                const next = { ...current, index };
                                slashRef.current = next;
                                setSlash(next);
                            };

                            if (event.key === "ArrowDown") {
                                move(1);
                                return true;
                            }
                            if (event.key === "ArrowUp") {
                                move(-1);
                                return true;
                            }
                            if (event.key === "Enter" || event.key === "Tab") {
                                current.choose(current.items[current.index]);
                                return true;
                            }
                            return false;
                        },
                        onExit: () => {
                            slashRef.current = null;
                            setSlash(null);
                        },
                    }),
                },
            }),
        ]);
    }, []);

    /** Inserts an uploading image right away (from a local preview) and swaps in the stored URL when done. */
    const uploadInto = (view: EditorView, file: File, position: number | null) => {
        const editor = editorRef.current;
        if (!editor) return;

        const preview = URL.createObjectURL(file);
        const attrs = { src: preview, alt: altTextFor(file.name) };
        const chain = editor.chain().focus();
        (position === null ? chain.insertContent({ type: "image", attrs }) : chain.insertContentAt(position, { type: "image", attrs })).run();

        const find = (src: string): number | null => {
            let found: number | null = null;
            view.state.doc.descendants((node, pos) => {
                if (found === null && node.type.name === "image" && node.attrs.src === src) found = pos;
                return found === null;
            });
            return found;
        };

        uploadImage(file, undefined, latest.current.folder)
            .then(({ url }) => {
                if (view.isDestroyed) return;
                const at = find(preview);
                if (at !== null) {
                    const node = view.state.doc.nodeAt(at);
                    view.dispatch(view.state.tr.setNodeMarkup(at, undefined, { ...node?.attrs, src: url }));
                }
            })
            .catch((err: unknown) => {
                if (!view.isDestroyed) {
                    const at = find(preview);
                    if (at !== null) view.dispatch(view.state.tr.delete(at, at + 1));
                }
                const message = err instanceof Error ? err.message : String(err);
                latest.current.addToast("Failed to upload image: " + message, "error");
            })
            .finally(() => URL.revokeObjectURL(preview));
    };

    const editor = useEditor({
        extensions,
        content: value,
        contentType: "markdown",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "article-prose prose prose-neutral dark:prose-invert sm:prose-lg max-w-none rich-editor-content",
                role: "textbox",
                "aria-multiline": "true",
                "aria-label": "Article text",
            },
            handlePaste: (view, event) => {
                const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith("image/"));
                if (files.length === 0) return false;
                files.forEach((file) => uploadInto(view, file, null));
                return true;
            },
            handleDrop: (view, event, _slice, moved) => {
                if (moved) return false;
                const files = [...(event.dataTransfer?.files ?? [])].filter((file) => file.type.startsWith("image/"));
                if (files.length === 0) return false;
                const dropAt = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? null;
                files.forEach((file) => uploadInto(view, file, dropAt));
                return true;
            },
        },
        onUpdate: ({ editor: current }) => {
            const markdown = cleanMarkdown(current.getMarkdown());
            // Wait until pending uploads have their final address: a local preview URL must never be saved
            if (/\]\(blob:/.test(markdown)) return;
            lastEmitted.current = markdown;
            latest.current.onChange(markdown);
        },
    });

    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    // Content changed from outside the editor (version restore, unsaved-changes restore, another article)
    useEffect(() => {
        if (!editor || value === lastEmitted.current) return;
        lastEmitted.current = value;
        editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
        latest.current.onCompatibility?.(isVisuallySafe(editor, value));
    }, [editor, value]);

    // Check the article that was loaded with the editor
    useEffect(() => {
        if (editor) latest.current.onCompatibility?.(isVisuallySafe(editor, lastEmitted.current));
    }, [editor]);

    useImperativeHandle(
        handleRef,
        () => ({
            insertImage: (image) => {
                editor
                    ?.chain()
                    .focus()
                    .insertContent({ type: "image", attrs: { src: image.src, alt: image.alt ?? "" } })
                    .run();
            },
            focus: () => {
                editor?.commands.focus();
            },
        }),
        [editor]
    );

    return (
        <div
            className="rich-editor relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card"
            style={{ height }}
        >
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-10 sm:py-8">
                <EditorContent editor={editor} />
            </div>
            {editor && <SelectionToolbar editor={editor} />}
            <SlashMenu state={slash} />
        </div>
    );
}
