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
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-signature-2d8f9
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

The other `NEXT_PUBLIC_FIREBASE_*` values can stay as placeholders in emulator mode. `LIKE_HASH_SALT` falls back to a development value when `NODE_ENV` isn't `production`.

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
npm run build            # with emulators running and seeded
```

In the build summary, every public route should be marked static (○/●) or partially prerendered (◐). `/api/likes` should be the only dynamic route.

## 5. Deploy (Vercel + Firebase)

Do these in order:

1. **Grant yourself the admin claim** before deploying the rules, or you'll lock yourself out. This needs a `service-account.json` (gitignored) in the project root:
   ```bash
   node scripts/set-admin-claim.mjs you@example.com
   ```
   Then sign out and back in.
2. **Vercel environment variables:**
   - all `NEXT_PUBLIC_FIREBASE_*` values
   - `NEXT_PUBLIC_SITE_URL`
   - `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (needed at build time to prerender pages)
   - `LIKE_HASH_SALT` (a long random string)
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
- **Admin Studio redirects to `/unauthorized`:** your account doesn't have the `admin` claim. Run `set-admin-claim.mjs` (production) or `npm run seed:emulator` (local), then sign in again.
