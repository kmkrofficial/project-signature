# `src/lib/` — Firebase Singletons & Configuration

This directory contains service initializers, configuration objects, and static data.

## Key Files

- **`firebase.ts`**: Client Firebase SDK initializer:
  - Initializes `FirebaseApp`, `Auth`, `Firestore`, and `Storage`.
  - Connects to local emulators (`connectAuthEmulator`, `connectFirestoreEmulator`, `connectStorageEmulator`) when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.
  - Safe singleton pattern preventing duplicate app instances during Next.js Hot Module Replacement (HMR).
- **`firebase-admin.ts`**: Server-side Firebase Admin SDK singleton for privileged tasks.
- **`firebase-config.ts`**: Helper reading environment variables with fallback defaults.
- **`portfolio-config.ts`**: Structured source of truth for portfolio data: personal bio, project listings, career timeline, education, and skill matrices.
