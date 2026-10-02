# `src/app/admin/` — Unified Admin Studio

This directory houses the administrative console at `/admin` for authoring, editing, previewing, and managing technical articles and media assets.

## Key Files

- **`page.tsx`**: Single-dashboard administrative studio wrapped with `<AuthGuard>`. Features:
  - **Articles Tab**: Listing of all published articles and drafts with instant search, status filtering, category badges, and quick delete/edit actions.
  - **Editor Tab**: Split-pane markdown editor with live side-by-side rendering, reading time & word count calculation, category selector, tag input, and publish/draft toggles.
  - **Media Tab**: Direct file uploader integrating with Firebase Cloud Storage (`/uploads/`) with one-click markdown image snippet copying.
- **`layout.tsx`**: Administrative layout providing full-screen studio layout and isolation from the public header/footer.

## Subdirectories

- [**login/**](./login/README.md): Authentication portal for signing in with administrative credentials.
