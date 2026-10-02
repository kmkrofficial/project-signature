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

// Only initialize Firebase Analytics in production when not using emulators and with a valid real API key
const isRealConfig =
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes("Dummy") &&
    Boolean(firebaseConfig.measurementId) &&
    !firebaseConfig.measurementId.includes("XXXX");

const enableAnalytics =
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== "true" &&
    isRealConfig;

export const analytics = enableAnalytics
    ? import("firebase/analytics")
          .then(({ getAnalytics, isSupported }) =>
              isSupported().then((yes) => (yes ? getAnalytics(app) : null))
          )
          .catch(() => null)
    : null;

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
