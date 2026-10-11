import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion, { type SuggestionOptions, type SuggestionProps } from "@tiptap/suggestion";
import {
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    List,
    ListChecks,
    ListOrdered,
    Minus,
    Quote,
    Table as TableIcon,
    Type,
    type LucideIcon,
} from "lucide-react";

export interface SlashItem {
    id: string;
    title: string;
    hint: string;
    /** Extra words the menu also matches against, e.g. "h1 title". */
    keywords: string;
    icon: LucideIcon;
    run: (editor: Editor, range: Range) => void;
}

/** The commands offered after typing "/". */
export function createSlashItems(options: { onRequestImage: () => void }): SlashItem[] {
    const block = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);

    return [
        { id: "text", title: "Text", hint: "Plain paragraph", keywords: "paragraph p", icon: Type, run: (e, r) => block(e, r).setParagraph().run() },
        { id: "h1", title: "Heading 1", hint: "Big section title", keywords: "h1 title", icon: Heading1, run: (e, r) => block(e, r).setHeading({ level: 1 }).run() },
        { id: "h2", title: "Heading 2", hint: "Section heading", keywords: "h2 subtitle", icon: Heading2, run: (e, r) => block(e, r).setHeading({ level: 2 }).run() },
        { id: "h3", title: "Heading 3", hint: "Sub-section heading", keywords: "h3", icon: Heading3, run: (e, r) => block(e, r).setHeading({ level: 3 }).run() },
        { id: "image", title: "Image", hint: "Pick from the library or upload", keywords: "picture photo upload img", icon: ImageIcon, run: (e, r) => { block(e, r).run(); options.onRequestImage(); } },
        { id: "bullets", title: "Bulleted list", hint: "A simple list", keywords: "ul unordered bullets", icon: List, run: (e, r) => block(e, r).toggleBulletList().run() },
        { id: "numbers", title: "Numbered list", hint: "Steps in order", keywords: "ol ordered numbers steps", icon: ListOrdered, run: (e, r) => block(e, r).toggleOrderedList().run() },
        { id: "tasks", title: "Checklist", hint: "Items with checkboxes", keywords: "todo task checkbox", icon: ListChecks, run: (e, r) => block(e, r).toggleTaskList().run() },
        { id: "quote", title: "Quote", hint: "Call out a quotation", keywords: "blockquote callout", icon: Quote, run: (e, r) => block(e, r).toggleBlockquote().run() },
        { id: "code", title: "Code block", hint: "Monospaced, with syntax colours on the site", keywords: "snippet pre", icon: Code2, run: (e, r) => block(e, r).toggleCodeBlock().run() },
        { id: "table", title: "Table", hint: "3 × 3 to start", keywords: "grid rows columns", icon: TableIcon, run: (e, r) => block(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { id: "divider", title: "Divider", hint: "A horizontal rule", keywords: "hr line separator", icon: Minus, run: (e, r) => block(e, r).setHorizontalRule().run() },
    ];
}

export const filterSlashItems = (items: SlashItem[], query: string): SlashItem[] => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.keywords}`.toLowerCase().includes(needle));
};

export type SlashProps = SuggestionProps<SlashItem, SlashItem>;

/** "/" opens a command menu at the caret. The UI is supplied through `suggestion.render`. */
export const SlashCommand = Extension.create<{ suggestion: Partial<SuggestionOptions<SlashItem, SlashItem>> }>({
    name: "slashCommand",

    addOptions() {
        return { suggestion: {} };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion<SlashItem, SlashItem>({
                editor: this.editor,
                char: "/",
                // Only at the start of a line or after a space, so URLs and paths are left alone
                allowedPrefixes: [" "],
                startOfLine: false,
                command: ({ editor, range, props }) => props.run(editor, range),
                ...this.options.suggestion,
            }),
        ];
    },
});
