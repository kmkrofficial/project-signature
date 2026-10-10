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

    if (clientEmail && privateKey && !useEmulator) {
        app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        app = initializeApp({
            projectId,
        });
    }
} else {
    app = getApps()[0];
}

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
