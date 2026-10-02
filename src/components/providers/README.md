# `src/components/providers/` — SDK Providers & Adapters

This directory hosts client wrappers for external analytics and SDKs.

## Key Files

- **`FirebaseAnalytics.tsx`**: Client wrapper initializing Google Analytics via Firebase:
  - Dynamically imports `firebase/analytics` only in supported browser environments.
  - Automatically suppresses initialization in local emulator mode or during development to prevent Google Installations 400 Bad Request errors.
