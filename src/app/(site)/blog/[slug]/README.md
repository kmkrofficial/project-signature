# `src/app/blog/[slug]/` — Article Reader Route

This directory implements `/blog/:slug`, providing the deep-dive reading experience for an article.

## Key Files

- **`page.tsx`**: Server component generating article-specific OpenGraph and SEO metadata from Firestore (`generateMetadata`).
- **`BlogPostClient.tsx`**: Client component managing article presentation:
  - Reading progress bar fixed at the top of the viewport.
  - Article headline, friendly category pill, publication date, view counter, and read time.
  - Zero-latency optimistic like counter and link-sharing button.
  - Markdown canvas using `react-markdown`, `remark-gfm`, and `rehype-raw`.
  - Custom code block renderer utilizing `CodeBlock` with syntax highlighting and copy button.
  - Sticky right-side Table of Contents (`TableOfContents`).
  - Tags cloud and bottom navigation.
