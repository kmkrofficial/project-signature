import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { toString } from "hast-util-to-string";
import { visit, SKIP } from "unist-util-visit";
import type { Element, Root } from "hast";
import type { PostHeading } from "@/types/blog";

// Raw HTML in posts is allowed but sanitized: no scripts, iframes, forms, event handlers or styles.
const sanitizeSchema: SanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "figure", "figcaption"],
    attributes: {
        ...defaultSchema.attributes,
        img: [...(defaultSchema.attributes?.img ?? []), "loading"],
    },
};

/** Collects h2/h3 headings (after rehype-slug assigned ids) for the table of contents. */
function rehypeCollectHeadings(headings: PostHeading[]) {
    return () => (tree: Root) => {
        visit(tree, "element", (node: Element) => {
            if ((node.tagName === "h2" || node.tagName === "h3") && typeof node.properties.id === "string") {
                headings.push({
                    id: node.properties.id,
                    text: toString(node),
                    level: node.tagName === "h2" ? 2 : 3,
                });
            }
        });
    };
}

/** Lazy-loads images and turns a paragraph holding a single captioned image into a figure. */
function rehypeImages() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element, index, parent) => {
            if (node.tagName === "img") {
                node.properties.loading = "lazy";
                node.properties.decoding = "async";
                return;
            }

            if (node.tagName !== "p" || !parent || index === undefined) return;
            const children = node.children.filter((child) => !(child.type === "text" && !child.value.trim()));
            const [only] = children;
            if (children.length !== 1 || only.type !== "element" || only.tagName !== "img") return;

            only.properties.loading = "lazy";
            only.properties.decoding = "async";
            const alt = typeof only.properties.alt === "string" ? only.properties.alt.trim() : "";
            const figure: Element = {
                type: "element",
                tagName: "figure",
                properties: {},
                children: alt
                    ? [only, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt }] }]
                    : [only],
            };
            parent.children[index] = figure;
            return SKIP;
        });
    };
}

/**
 * Wraps highlighted code in a frame with a language label and a copy button.
 * The button is activated by the ArticleEnhancer client island (hidden until then).
 */
function rehypeCodeBlocks() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element, index, parent) => {
            if (node.tagName !== "pre" || !parent || index === undefined) return;
            if (parent.type === "element" && parent.tagName === "div") return;

            const language = typeof node.properties["data-language"] === "string" ? node.properties["data-language"] : "";
            const label = language && language !== "text" ? language : "code";

            parent.children[index] = {
                type: "element",
                tagName: "div",
                properties: { className: ["code-block"] },
                children: [
                    {
                        type: "element",
                        tagName: "div",
                        properties: { className: ["code-block-header"] },
                        children: [
                            { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: label }] },
                            {
                                type: "element",
                                tagName: "button",
                                properties: { type: "button", className: ["copy-code"], ariaLabel: "Copy code" },
                                children: [{ type: "text", value: "Copy" }],
                            },
                        ],
                    },
                    node,
                ],
            };
            return SKIP;
        });
    };
}

export interface RenderedMarkdown {
    html: string;
    headings: PostHeading[];
}

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
    const headings: PostHeading[] = [];

    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSanitize, sanitizeSchema)
        .use(rehypeSlug)
        .use(rehypeShiki, {
            themes: { light: "github-light", dark: "github-dark" },
            lazy: true,
            fallbackLanguage: "text",
            transformers: [
                {
                    pre(node) {
                        node.properties["data-language"] = this.options.lang;
                    },
                },
            ],
            onError: (error) => console.warn("[markdown] Syntax highlighting skipped:", error),
        })
        .use(rehypeCodeBlocks)
        .use(rehypeImages)
        .use(rehypeCollectHeadings(headings))
        .use(rehypeStringify)
        .process(markdown);

    return { html: String(file), headings };
}
