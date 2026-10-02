# Project Signature

> A modern, reader-first personal publication and showcase platform built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Firebase.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v12.7.0-ffca28?style=flat&logo=firebase)](https://firebase.google.com/)

---

## Overview

**Project Signature** is a technical journal and professional showcase for Keerthi Raajan. It delivers an editorial reading experience tailored for deep-dive technical articles, project showcases, and career milestones.

### Key Highlights

- **Reader-First Publication Feed**: The root route (`/`) serves as a publication feed with category filtering, instant search, and sorting.
- **Calibrated Reading Ergonomics**: Clean typography using the Geist font family, hardware-accelerated reading progress bar, syntax-highlighted code blocks with copy actions, and a sticky Table of Contents.
- **Unified Admin Studio (`/admin`)**: Single-page administrative dashboard for drafting, live editing with markdown preview, asset uploads via Firebase Storage, and publication management.
- **Local Firebase Emulator Suite**: Complete local sandbox support for Firebase Auth, Cloud Firestore, and Cloud Storage with auto-seeding.
- **Global Command Palette (`Cmd+K` / `Ctrl+K`)**: Instant search dialog to quickly find articles by title, topic, or keyword.
- **RSS 2.0 Dynamic Feed (`/feed.xml`)**: Automatically generates valid RSS XML for feed subscribers.

---

## Documentation Quick Links

| Document | Purpose |
| :--- | :--- |
| 📖 [**SETUP.md**](./SETUP.md) | **Step-by-step setup guide**, environment variables, emulator startup, and database seeding. |
| 🏛️ [**ARCHITECTURE.md**](./ARCHITECTURE.md) | **System architecture diagrams**, tech stack rationale, data models, security RBAC, and typography pipeline. |
| 📁 [**Directory Index**](./src/README.md) | Documentation for all modules, directories, and subdirectories. |

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kmkrofficial/project-signature.git
cd project-signature
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-signature-2d8f9
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```
*(See [SETUP.md](./SETUP.md) for full configuration details.)*

### 3. Start Firebase Local Emulators
```bash
npx --yes firebase-tools emulators:start --project=project-signature-2d8f9
```

### 4. Seed Sample Data
```bash
node scripts/seed-emulator.mjs
```

### 5. Launch the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Directory Structure

```
project-signature/
├── public/                 # Static assets and icons
├── scripts/                # Database seeding & administrative CLI tools
├── src/
│   ├── app/                # App Router pages, layouts, and API routes
│   │   ├── about/          # Showcase, background, and career timeline
│   │   ├── admin/          # Unified Admin Studio (protected)
│   │   ├── api/            # Serverless HTTP endpoints
│   │   ├── blog/           # Publication stream & article reader
│   │   └── feed.xml/       # Dynamic RSS 2.0 feed
│   ├── components/         # Modular React UI components
│   ├── context/            # React context providers (Toast, Theme)
│   ├── hooks/              # Custom reusable React hooks
│   └── lib/                # Firebase SDK singletons & portfolio data
├── SETUP.md                # Local development & emulator instructions
├── ARCHITECTURE.md         # Technical architecture & design specifications
└── README.md               # Project overview
```

---

## Available Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Next.js dev server with Turbopack |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint validation |
| `node scripts/seed-emulator.mjs` | Seeds emulator with articles & config |
| `node scripts/set-admin-claim.js <email>` | Grants admin privileges to a user |

---

## License

Created by **Keerthi Raajan K M**. All rights reserved.
