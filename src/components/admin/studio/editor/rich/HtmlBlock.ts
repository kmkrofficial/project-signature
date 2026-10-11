import { Node } from "@tiptap/core";

/**
 * Block-level HTML in an article (<details>, <iframe>, <figure>, comments...).
 *
 * The visual editor has no schema for arbitrary HTML, so each block is kept verbatim as one opaque node and
 * written back unchanged. It shows as a labelled box; edit it in Markdown mode.
 */

/** CommonMark "type 6" block tags: an HTML block starts with one of these and runs to the next blank line. */
const BLOCK_TAGS = new Set(
    (
        "address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt " +
        "fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li " +
        "link main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th " +
        "thead title tr track ul video audio picture source svg"
    ).split(" ")
);

/** CommonMark "type 1" tags whose content may contain blank lines; they end at the matching close tag. */
const RAW_TEXT_TAGS = new Set(["pre", "script", "style", "textarea"]);

/** How much of `src` (which starts at a block boundary) is a raw HTML block, or 0 when it isn't one. */
export function htmlBlockLength(src: string): number {
    const start = /^ {0,3}<(!--|\/?([A-Za-z][A-Za-z0-9-]*))/.exec(src);
    if (!start) return 0;

    const lines = src.split("\n");
    const take = (count: number) => lines.slice(0, count).join("\n").length;

    if (start[1] === "!--") {
        const end = lines.findIndex((line) => line.includes("-->"));
        return take(end === -1 ? lines.length : end + 1);
    }

    const tag = start[2].toLowerCase();

    if (RAW_TEXT_TAGS.has(tag) && !start[1].startsWith("/")) {
        const close = new RegExp(`</${tag}>`, "i");
        const end = lines.findIndex((line) => close.test(line));
        return take(end === -1 ? lines.length : end + 1);
    }

    if (!BLOCK_TAGS.has(tag)) return 0;

    const blank = lines.findIndex((line) => line.trim() === "");
    return take(blank === -1 ? lines.length : blank);
}

export const HtmlBlock = Node.create({
    name: "htmlBlock",
    group: "block",
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            html: {
                default: "",
                parseHTML: (element) => element.getAttribute("data-html") ?? "",
            },
        };
    },

    parseHTML() {
        return [{ tag: "div[data-html-block]" }];
    },

    renderHTML({ node }) {
        return [
            "div",
            { "data-html-block": "", "data-html": node.attrs.html, class: "html-block", contenteditable: "false" },
            ["span", { class: "html-block-label" }, "HTML block · edit in Markdown mode"],
            ["pre", {}, node.attrs.html],
        ];
    },

    markdownTokenName: "htmlBlock",

    markdownTokenizer: {
        name: "htmlBlock",
        level: "block",
        start: (src: string) => src.search(/^ {0,3}<(?:!--|\/?[A-Za-z])/m),
        tokenize: (src: string) => {
            const length = htmlBlockLength(src);
            if (length === 0) return undefined;
            const raw = src.slice(0, length);
            return { type: "htmlBlock", raw, text: raw.replace(/\s+$/, "") };
        },
    },

    parseMarkdown: (token) => ({ type: "htmlBlock", attrs: { html: String(token.text ?? token.raw ?? "") } }),

    renderMarkdown: (node) => String(node.attrs?.html ?? ""),
});
