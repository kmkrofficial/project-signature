# `src/components/admin/` — Admin Security & Guards

This directory contains security and authentication wrapper components for administrative routes.

## Key Files

- **`AuthGuard.tsx`**: Client-side authentication guard:
  - Listens to Firebase `onAuthStateChanged`.
  - Resolves token claims via `getIdTokenResult()`.
  - Verifies the existence of `{ admin: true }`.
  - Renders a clean loading spinner while validating.
  - Redirects unauthenticated users to `/admin/login` and non-admin users to `/unauthorized`.
  - Renders children only when authentication and claim verification succeed.
