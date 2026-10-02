# Setup & Local Development Guide

This guide walks you through setting up and running **Project Signature** locally, configuring the Firebase Local Emulator Suite, seeding sample data, and deploying to production.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS v24 recommended) | JavaScript runtime & package manager |
| **npm** | `>= 10.0.0` | Dependency installation |
| **Java OpenJDK** | `>= 21.0.0` | Required to run the Firebase Local Emulator Suite |
| **Firebase CLI** | `firebase-tools` (run via `npx --yes firebase-tools`) | Manages local emulators |

> [!NOTE]
> On Windows, ensure Java is accessible in your environment PATH:
> ```powershell
> $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
> $env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
> ```

---

## 2. Environment Variables Configuration

Create a `.env.local` file in the root of the project with the following configuration:

```env
# Application Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase Client Configuration (Standard Project ID)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-signature-2d8f9
NEXT_PUBLIC_FIREBASE_API_KEY=mock-api-key-for-emulator
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-signature-2d8f9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-signature-2d8f9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# Firebase Local Emulator Flags
# Set to 'true' to connect to local Auth, Firestore, and Storage emulators
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true

# Firebase Admin Service Account (Optional for local emulator admin tasks)
FIREBASE_PROJECT_ID=project-signature-2d8f9
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

---

## 3. Installing Dependencies

Install the project dependencies using `npm`:

```bash
npm install
```

---

## 4. Running the Firebase Local Emulator Suite

The application uses Firebase Authentication, Cloud Firestore, and Cloud Storage. During local development, you do **not** need a live cloud project; the emulator suite provides a fully functional, zero-cost sandbox.

### Starting the Emulators

In a dedicated terminal, run:

```bash
npx --yes firebase-tools emulators:start --project=project-signature-2d8f9
```

This starts the following services:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Authentication** | `9099` | Local user accounts & custom claims |
| **Cloud Firestore** | `8080` | Document database emulator |
| **Cloud Storage** | `9199` | File & image asset upload emulator |
| **Emulator UI** | `4000` | Web UI at [http://localhost:4000](http://localhost:4000) to inspect database & auth |

---

## 5. Seeding Sample Articles and Site Config

Once the emulators are running, initialize the database with sample articles and site metadata:

```bash
node scripts/seed-emulator.mjs
```

This script:
1. Creates sample technical articles in the `blog` collection with friendly categories (`Web & Software`, `Cloud & Data`, `Artificial Intelligence`).
2. Creates the default site configuration document at `config/site`.
3. Pre-registers a local test administrator user:
   - **Email**: `kmkrworks@gmail.com`
   - **Password**: `Password123!`
   - **Role Claim**: `{ admin: true }`

---

## 6. Starting the Next.js Development Server

In another terminal, start the Next.js development server (powered by Turbopack):

```bash
npm run dev
```

The application will be live at:
- **Public Feed & Articles**: [http://localhost:3000](http://localhost:3000)
- **About & Work**: [http://localhost:3000/about](http://localhost:3000/about)
- **Admin Studio Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **RSS Feed**: [http://localhost:3000/feed.xml](http://localhost:3000/feed.xml)

---

## 7. Admin Access & Role Management

To log into the Admin Studio at `/admin`:

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Click **Continue with Google**.
3. In local emulator mode, select or enter your authorized administrator account (e.g., `kmkrworks@gmail.com`).
4. The system validates the session and redirects to `/admin`. Use the "Back to Articles" button at any time to return to the public site.

### Granting Admin Claims to Any Email

If you register a new account through the Emulator UI and wish to promote it to administrator, run:

```bash
node scripts/set-admin-claim.js your-email@example.com
```

To revoke administrator privileges:

```bash
node scripts/remove-admin-claim.js your-email@example.com
```

---

## 8. Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `node scripts/seed-emulator.mjs` | Seeds sample articles and config into local emulator |
| `node scripts/set-admin-claim.js <email>` | Grants admin custom claim to a Firebase user |
| `node scripts/remove-admin-claim.js <email>` | Revokes admin claim from a Firebase user |

---

## 9. Troubleshooting & FAQ

### Java Not Found Error on Emulator Start
If you see `Java is not recognized`, set your `JAVA_HOME` environment variable to your OpenJDK directory before launching `firebase-tools`.

### Port Already in Use (8080, 9099, 9199, 4000)
If emulator startup fails because a port is occupied:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### Firebase Installations 400 Error in Browser Console
Firebase Analytics requires live Google credentials. In local emulator development, Analytics is automatically disabled in `src/components/providers/FirebaseAnalytics.tsx` to prevent console warnings.
