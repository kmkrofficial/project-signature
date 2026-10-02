# `src/app/admin/login/` — Administrator Login Portal

This directory implements the authentication interface at `/admin/login`.

## Key Files

- **`page.tsx`**: Client component managing administrator login:
  - Prominent "Back to Articles" navigation button returning to the public publication.
  - One-click Google Authentication via `signInWithPopup(auth, provider)`.
  - Redirects verified administrators directly to the `/admin` Studio.
  - Displays error banners if authentication fails.
