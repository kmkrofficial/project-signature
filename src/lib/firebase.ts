import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig } from "./firebase-config";

export { firebaseConfig };

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ?
    import("firebase/analytics").then(({ getAnalytics, isSupported }) =>
        isSupported().then((yes) => yes ? getAnalytics(app) : null)
    ) : null;

// Firebase Local Emulator Suite integration
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (useEmulator) {
    const globalAny = globalThis as any;
    const EMULATOR_INITIALIZED_KEY = "__FIREBASE_EMULATORS_INITIALIZED__";

    if (!globalAny[EMULATOR_INITIALIZED_KEY]) {
        globalAny[EMULATOR_INITIALIZED_KEY] = true;

        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        } catch (err) {
            // Already connected or disabled
        }

        try {
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
        } catch (err) {
            // Already connected or disabled
        }

        try {
            connectStorageEmulator(storage, "127.0.0.1", 9199);
        } catch (err) {
            // Already connected or disabled
        }

        if (typeof window !== "undefined") {
            console.log("⚡ [Firebase Emulator] Connected to Auth (9099), Firestore (8080), Storage (9199)");
        }
    }
}
