# `src/app/` — Next.js App Router

This directory contains the file-based routes, layouts, and server endpoints powered by Next.js 16 App Router.

## Key Files

- **`layout.tsx`**: Root application layout configuring Geist Sans and Geist Mono typography, preconnecting to Firebase Storage, wrapping the tree with `ToastProvider` and `AppShell`, and generating dynamic SEO metadata.
- **`page.tsx`**: Root route (`/`) rendering the publication feed via `BlogListClient`.
- **`globals.css`**: Tailwind CSS v4 styling rules, custom CSS variables, and markdown typography resets.

## Subdirectories

| Route Directory | URL Path | Description |
| :--- | :--- | :--- |
| [**about/**](./about/README.md) | `/about` | Professional showcase, executive summary, selected projects, and career timeline. |
| [**admin/**](./admin/README.md) | `/admin` | Unified Admin Studio for drafting articles, live markdown editing, and media management. |
| [**admin/login/**](./admin/login/README.md) | `/admin/login` | Administrator authentication portal with custom claims verification. |
| [**api/**](./api/README.md) | `/api/*` | Serverless backend API handlers (contact submission, portfolio data). |
| [**blog/**](./blog/README.md) | `/blog` | Publication feed and category filtering. |
| [**blog/[slug]/**](./blog/[slug]/README.md) | `/blog/:slug` | Deep-dive article reader with Table of Contents and progress tracking. |
| [**feed.xml/**](./feed.xml/README.md) | `/feed.xml` | Server-generated RSS 2.0 XML feed. |
| [**unauthorized/**](./unauthorized/README.md) | `/unauthorized` | 403 Forbidden access denial page for non-admin sessions. |
