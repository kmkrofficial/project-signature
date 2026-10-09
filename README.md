# Signature

A fast, minimal personal technical blog by Keerthi Raajan, built with Next.js 16 (Cache Components), React 19, Tailwind CSS v4 and Firebase, and hosted on Vercel.

## Highlights

- **Static by default:** every public page is prerendered and served from the CDN. Firestore is read only when content changes.
- **Very little client JavaScript:** Markdown and syntax highlighting (Shiki) run on the server. Readers get small islands for likes, share, search and the table of contents.
- **Secure by default:** all writes require an `admin` custom claim enforced by Firestore/Storage rules and server checks. Post HTML is sanitized, and the site sends a strict set of security headers.
- **Calm reading experience:** one featured post, a chronological list, static topic pages, Cmd/Ctrl+K search, and light and dark themes.
- **Discoverable:** a full-content RSS feed, sitemap, canonical URLs, JSON-LD, and a branded Open Graph card for every article.
- **Admin Studio** (`/admin`): write, preview, publish and upload media; edits go live immediately.

## Docs

| Document | Purpose |
| :--- | :--- |
| [SETUP.md](./SETUP.md) | Local development with the Firebase emulators, environment variables, deployment |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Request flow, caching, data model, security model |
| [scripts/README.md](./scripts/README.md) | Seeding, admin claims, rules tests |

## Quick start

```bash
npm install
npm run emulators          # needs Java 21+
npm run seed:emulator      # in a second terminal
npm run dev
```

Then open <http://localhost:3000>. See [SETUP.md](./SETUP.md) for details.

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run lint` | ESLint |
| `npm run emulators` | Firebase Auth, Firestore and Storage emulators |
| `npm run seed:emulator` | Sample posts, site config and an emulator admin user |
| `npm run test:rules` | Firestore and Storage security rules tests (starts emulators) |
