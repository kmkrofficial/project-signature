import type { Editor, JSONContent } from "@tiptap/core";

/** Constructs the site renders but the visual editor has no model for. */
const UNSUPPORTED = [
    /^\[\^[^\]]+\]:/m, // footnote definitions
    /\[\^[^\]]+\]/, // footnote references
];

/** An HTML tag, but not an <https://autolink> or <mailto:link>. */
const INLINE_HTML = /<\/?(?!https?:|mailto:)[A-Za-z][^>]*>/;

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function htmlBlocksOf(node: JSONContent, found: string[] = []): string[] {
    if (node.type === "htmlBlock" && typeof node.attrs?.html === "string") found.push(node.attrs.html);
    node.content?.forEach((child) => htmlBlocksOf(child, found));
    return found;
}

/** Whether HTML appears inside paragraphs (e.g. <kbd>), where the editor would drop the tags. */
function hasInlineHtml(markdown: string, kept: string[]): boolean {
    let rest = markdown;
    // Block HTML is preserved verbatim, and code may show tags literally
    kept.forEach((html) => (rest = rest.replace(html, "")));
    rest = rest.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "").replace(/`[^`\n]*`/g, "");
    return INLINE_HTML.test(rest);
}

/**
 * Tidies what the editor writes. Empty paragraphs (spacing made with the Enter key, and the empty line the
 * editor keeps at the end) come out as `&nbsp;`; the published page spaces paragraphs itself, so they go.
 */
export function cleanMarkdown(markdown: string): string {
    return markdown
        .replace(/^[ \t]*&nbsp;[ \t]*$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd();
}

/**
 * Whether `markdown` can be edited visually without the article's meaning changing.
 *
 * Reading then writing then reading again must give the same document (so nothing is dropped or
 * reshuffled on save), the text must not use syntax the editor can't represent, and any HTML must be
 * block-level (kept verbatim). Style-only differences (`*` vs `-` bullets, a blank line after a
 * heading) are not a problem: they render identically on the site.
 */
export function isVisuallySafe(editor: Editor, markdown: string): boolean {
    const manager = editor.markdown;
    if (!manager) return false;
    if (UNSUPPORTED.some((pattern) => pattern.test(markdown))) return false;

    try {
        const first = manager.parse(markdown);
        if (hasInlineHtml(markdown, htmlBlocksOf(first))) return false;
        const written = manager.serialize(first);
        return sameJson(first, manager.parse(written));
    } catch {
        return false;
    }
}
