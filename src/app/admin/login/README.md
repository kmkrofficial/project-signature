# `src/app/admin/login/` — Administrator Login Portal

This directory implements the authentication interface at `/admin/login`.

## Key Files

- **`page.tsx`**: Client component managing administrator login:
  - Collects email and password inputs.
  - Calls `signInWithEmailAndPassword(auth, email, password)` via Firebase Authentication.
  - Inspects user JWT token custom claims via `user.getIdTokenResult(true)`.
  - Verifies `{ admin: true }` claim:
    - If present, redirects the administrator directly to `/admin`.
    - If missing, displays an unauthorized error alert and signs the user out.
