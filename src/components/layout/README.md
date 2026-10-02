# `src/components/layout/` — Application Chrome & Layout

This directory houses the structural chrome and persistent layout components.

## Key Files

- **`AppShell.tsx`**: Top-level shell managing layout presentation:
  - Selectively renders `Header` and `Footer` on public pages while omitting them on `/admin`.
  - Attaches global keyboard listener for `Cmd+K` / `Ctrl+K` to toggle `SearchModal`.
  - Wraps children in Vercel Analytics and Speed Insights.
- **`Header.tsx`**: Sticky navigation bar:
  - Brand identity with live animated pulse status.
  - Desktop and mobile navigation links (`Articles`, `About & Work`, `RSS`).
  - Search trigger button and theme toggle switch.
  - Mobile hamburger slide-out drawer with scroll locking.
- **`Footer.tsx`**: Minimalist publication footer:
  - Author brand and brief description.
  - Social media icon buttons and RSS link.
  - Copyright and technology stack attribution.
- **`ThemeProvider.tsx`**: Client context managing light and dark theme classes on `<html>`.
- **`Container.tsx`**: Reusable max-width content container.
- **`Section.tsx`**: Semantic `<section>` wrapper with standardized vertical spacing.
