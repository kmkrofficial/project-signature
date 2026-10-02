# `src/components/blog/` — Blog Reader & Ergonomics Components

This directory hosts components designed to enhance the reading experience across articles and the public feed.

## Key Files

- **`CodeBlock.tsx`**: Renders code snippets with syntax highlighting:
  - Uses `react-syntax-highlighter` with Prism `atomDark` theme.
  - Formatted in a terminal-style container with language label and clipboard copy button.
- **`ReadingProgressBar.tsx`**: Hardware-accelerated reading indicator:
  - Listens to window scroll events.
  - Updates a fixed 2.5px gradient line along the top of the viewport representing percentage read.
- **`SearchModal.tsx`**: Global search dialog triggered by `Cmd+K` or `Ctrl+K`:
  - Instant client-side indexing across titles, excerpts, and tags.
  - Keyboard navigation and auto-focus input.
- **`TableOfContents.tsx`**: Sticky Table of Contents sidebar:
  - Queries article `<h2>` and `<h3>` headings from the rendered DOM.
  - Uses `IntersectionObserver` to highlight the currently visible heading.
  - Smoothly scrolls to targeted headings upon click.
