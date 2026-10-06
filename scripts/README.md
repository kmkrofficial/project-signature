# Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `seed-emulator.mjs` | `npm run seed:emulator` | Seeds sample posts and `config/site` into the local emulators and creates an emulator admin user with the `admin` claim |
| `test-rules.mjs` | `npm run test:rules` | Firestore and Storage security rules tests (`node:test` + `@firebase/rules-unit-testing`); starts its own emulators |
| `set-admin-claim.mjs` | `node scripts/set-admin-claim.mjs <email>` | Grants the `admin` custom claim to a production user (needs `service-account.json`) |
| `remove-admin-claim.mjs` | `node scripts/remove-admin-claim.mjs <email>` | Revokes the `admin` claim |
| `generate-favicon.mjs` | `node scripts/generate-favicon.mjs` | Regenerates `src/app` icons and the PWA icons in `public/` |

The user has to sign out and back in before a claim change takes effect.
