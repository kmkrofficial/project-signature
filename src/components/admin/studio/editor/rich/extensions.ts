import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import { HtmlBlock } from "./HtmlBlock";

/**
 * Everything the article format supports, and nothing else. The set is chosen to match what the site's
 * markdown pipeline renders (GFM: tables, task lists, strikethrough, fenced code, images, links), so that
 * what is written here survives the round trip to markdown unchanged.
 */
export function createExtensions(extra: Extensions = []): Extensions {
    return [
        StarterKit.configure({
            // Markdown has no underline; leaving it on would write <u> into the article
            underline: false,
            link: {
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { rel: "noopener noreferrer nofollow" },
            },
        }),
        Image.configure({ inline: false, allowBase64: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        TableKit.configure({ table: { resizable: false } }),
        HtmlBlock,
        Placeholder.configure({
            placeholder: "Start writing, or type / for commands…",
            showOnlyCurrent: true,
        }),
        Markdown.configure({ markedOptions: { gfm: true } }),
        ...extra,
    ];
}
