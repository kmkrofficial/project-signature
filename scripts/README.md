# `scripts/` — Administrative & CLI Utilities

This directory contains standalone Node.js automation scripts for managing Firebase Local Emulators and user authentication claims.

## Scripts Overview

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`seed-emulator.mjs`** | `node scripts/seed-emulator.mjs` | Connects to the local Firestore and Auth emulators (ports 8080 and 9099) using Firebase Admin to populate sample articles, configure `config/site`, and register an admin user. |
| **`set-admin-claim.js`** | `node scripts/set-admin-claim.js <email>` | Sets `{ admin: true }` custom claim on a Firebase user account by email address. |
| **`remove-admin-claim.js`** | `node scripts/remove-admin-claim.js <email>` | Revokes the `{ admin: true }` custom claim from a Firebase user account. |

## Usage Examples

### Seeding Local Emulator Data
```bash
node scripts/seed-emulator.mjs
```

### Granting Administrator Access
```bash
node scripts/set-admin-claim.js user@example.com
```

### Revoking Administrator Access
```bash
node scripts/remove-admin-claim.js user@example.com
```
