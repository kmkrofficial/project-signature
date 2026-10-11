# Setup & Deployment

## 1. Prerequisites

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| Node.js | 20+ (24 LTS recommended) | Runtime |
| Java | 21+ (e.g. Eclipse Temurin) | Firebase emulators |
| Firebase CLI | via `npx firebase-tools` | Emulators and rules deployment |

On Windows, if `java` isn't on your PATH after installing:

```powershell
$env:PATH = "C:\Program Files\Eclipse Adoptium\jre-21.0.12.101-hotspot\bin;" + $env:PATH
```

## 2. Environment variables

Copy `env.example` to `.env.local`. For local development against the emulators you need:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEPLOYMENT=development
```

`NEXT_PUBLIC_DEPLOYMENT` picks the backend. `development` uses the local emulators, and the emulator project and any `*_EMULATOR_HOST` values are handled for you. Any other value (`staging`, `production`, or unset) uses the real project from the `NEXT_PUBLIC_FIREBASE_*` keys plus the Admin SDK variables, and ignores emulator settings. Set it to `staging` on your staging deployment, or in `.env.local` to run locally against staging.

The `NEXT_PUBLIC_FIREBASE_*` values can stay as placeholders in emulator mode. `LIKE_HASH_SALT` falls back to a development value when `NODE_ENV` isn't `production`.

## 3. Run locally

```bash
npm install
npm run emulators        # Auth :9099, Firestore :8080, Storage :9199, UI :4000
npm run seed:emulator    # second terminal: sample posts, config/site, admin user
npm run dev              # http://localhost:3000
```

The seed script creates an emulator admin, `kmkrworks@gmail.com`, with the `admin` claim. To sign in, open `/admin/login`, choose **Continue with Google**, and pick that account in the emulator's sign-in popup.

The public pages are cached (Cache Components). If you edit Firestore directly in the Emulator UI, restart `npm run dev`; edits made in the Admin Studio invalidate the cache automatically.

## 4. Verify

```bash
npx tsc --noEmit
npm run lint
npm run test:rules       # starts its own emulators
npm run test:admin-access # admin allowlist logic, starts the Auth emulator
npm run build            # with emulators running and seeded
```

In the build summary, every public route should be marked static (○/●) or partially prerendered (◐). `/api/likes` should be the only dynamic route.

## 5. Deploy (Vercel + Firebase)

Do these in order:

1. **Choose who can use the studio.** Set `ADMIN_EMAILS` (comma separated) in Vercel. The first time one of those Google accounts signs in at `/admin/login`, the server verifies it and grants the `admin` claim automatically. This needs the Admin SDK variables from step 2, and the email must be verified by Google. To grant the claim by hand instead (needs a `service-account.json`, gitignored, in the project root):
   ```bash
   node scripts/set-admin-claim.mjs you@example.com
   ```
   then sign out and back in.
2. **Vercel environment variables.** Anything starting with `NEXT_PUBLIC_` is copied into the browser bundle, so those are public by design; everything else stays on the server. Tick the environment each value applies to (Production, and Preview if you build previews), and redeploy after changing them.

   | Variable | Type on Vercel | Notes |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_DEPLOYMENT` | Normal | `production` (or `staging` for previews) |
   | `NEXT_PUBLIC_FIREBASE_*` (7 values) | Normal | Web app config; public by design, protected by the rules |
   | `NEXT_PUBLIC_SITE_URL` | Normal | Your public URL |
   | `FIREBASE_CLIENT_EMAIL` | Normal or Sensitive | Needed at build time to prerender pages |
   | `FIREBASE_PRIVATE_KEY` | **Sensitive** | Service-account private key |
   | `LIKE_HASH_SALT` | **Sensitive** | A long random string |
   | `ADMIN_EMAILS` | Sensitive | Comma-separated admin emails. Never prefix with `NEXT_PUBLIC_` |
3. **Deploy the security rules:**
   ```bash
   npx firebase-tools deploy --only firestore:rules,storage
   ```
4. **Harden the Google Cloud project:**
   - Restrict the browser API key to your domains and to the APIs you use.
   - Disable unused sign-in providers.
   - Set a billing budget alert.
   - Schedule Firestore exports so you can roll back.

## 6. Troubleshooting

- **`java` not found when starting the emulators:** install Java 21+ and add it to your PATH (see section 1).
- **Port in use (8080/9099/9199/4000):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process
  ```
- **Admin Studio redirects to `/unauthorized`:** your account doesn't have the `admin` claim. Check that `ADMIN_EMAILS` contains the exact email shown on that page, that the server has `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`, then reload. Or run `set-admin-claim.mjs` (production) or `npm run seed:emulator` (local) and sign in again.
- **"Couldn't verify your access":** the server could not check your sign-in, almost always because the Admin SDK credentials are missing or belong to another project. Locally, check that `NEXT_PUBLIC_DEPLOYMENT` is not `development` when you point the app at a real project, because `development` uses the emulators.
