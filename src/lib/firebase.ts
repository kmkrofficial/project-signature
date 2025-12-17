import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

export { firebaseConfig };

import { getStorage } from "firebase/storage";

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ?
    import("firebase/analytics").then(({ getAnalytics, isSupported }) =>
        isSupported().then(yes => yes ? getAnalytics(app) : null)
    ) : null;

// Disable offline persistence for faster performance
// This prevents Firestore from syncing with IndexedDB which can slow down queries
if (typeof window !== 'undefined') {
    // Only run in browser
    try {
        // We explicitly do NOT enable persistence to avoid the overhead
        // This ensures all queries go directly to the network with no caching delays
    } catch (err) {
        console.log('Firestore configuration already applied');
    }
}
