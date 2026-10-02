# `src/app/unauthorized/` — Access Denied Fallback

This directory implements the `/unauthorized` fallback page.

## Key Files

- **`page.tsx`**: Client component rendered when a logged-in user attempts to access `/admin` without having the `{ admin: true }` custom claim:
  - Displays a clean 403 Forbidden message.
  - Explains the missing authorization.
  - Provides a return button directing the user back to the public homepage (`/`).
