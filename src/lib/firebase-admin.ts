import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { firebaseConfig, useEmulator } from "./firebase-config";

// The Admin SDK switches to an emulator whenever these variables exist, so they are set for
// NEXT_PUBLIC_DEPLOYMENT=development and removed otherwise (a stale value in .env.local must not hijack staging).
const EMULATOR_HOSTS = {
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199",
} as const;

for (const [name, fallback] of Object.entries(EMULATOR_HOSTS)) {
    if (useEmulator) {
        process.env[name] = process.env[name] || fallback;
    } else {
        delete process.env[name];
    }
}

let app: App;
if (!getApps().length) {
    const { projectId } = firebaseConfig;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (useEmulator) {
        app = initializeApp({ projectId });
    } else if (clientEmail && privateKey) {
        app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        // Without a service account the SDK would fall back to Google's metadata server, which does not exist
        // on Vercel and surfaces only as "Could not load the default credentials". Say what is actually wrong.
        const missing = [!clientEmail && "FIREBASE_CLIENT_EMAIL", !privateKey && "FIREBASE_PRIVATE_KEY"].filter(Boolean);
        throw new Error(
            `Firebase Admin credentials are missing: ${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} not set ` +
                `(project "${projectId}", NEXT_PUBLIC_DEPLOYMENT="${process.env.NEXT_PUBLIC_DEPLOYMENT ?? ""}"). ` +
                "Add them for this environment (on Vercel: Settings > Environment Variables, with Production or Preview " +
                "ticked to match this build) and redeploy."
        );
    }
} else {
    app = getApps()[0];
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
