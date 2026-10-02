# `src/app/blog/` — Publication Feed & Directory

This directory implements the `/blog` route and hosts the core publication listing logic shared with `/`.

## Key Files

- **`page.tsx`**: Server component rendering `BlogListClient` with dynamic metadata.
- **`BlogListClient.tsx`**: Client component managing:
  - Firestore query fetching published articles (`published == true`).
  - Active category filtering (`All`, `Artificial Intelligence`, `Web & Software`, `Cloud & Data`, `Guides & Tips`).
  - Search term matching across titles, excerpts, and tags.
  - Sorting options (`newest`, `oldest`, `views`, `likes`).
  - Client-side pagination (8 articles per page).
  - Responsive article cards with reading times, publication dates, and tags.

## Subdirectories

- [**[slug]/**](./%5Bslug%5D/README.md): Individual article reader route (`/blog/:slug`).
