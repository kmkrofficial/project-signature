import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
}

let app: App;
if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "project-signature-2d8f9";
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

