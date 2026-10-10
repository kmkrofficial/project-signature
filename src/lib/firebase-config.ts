// Which backend the app talks to, chosen with NEXT_PUBLIC_DEPLOYMENT:
//   "development"                  -> local Firebase emulators (npm run emulators)
//   anything else (staging, production, unset) -> the real project in the NEXT_PUBLIC_FIREBASE_* keys below
export const deployment = process.env.NEXT_PUBLIC_DEPLOYMENT || "production";
export const useEmulator = deployment === "development";

// The emulators and `npm run seed:emulator` always use this project, whatever project the keys below point at
const EMULATOR_PROJECT_ID = "project-signature-2d8f9";

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuildOnly1234567890",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
    projectId: useEmulator ? EMULATOR_PROJECT_ID : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || EMULATOR_PROJECT_ID,
    storageBucket: useEmulator
        ? `${EMULATOR_PROJECT_ID}.appspot.com`
        : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${EMULATOR_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
    // Only used if Google Analytics for Firebase is initialized; nothing in the app does that today
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};
