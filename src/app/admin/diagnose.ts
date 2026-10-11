"use server";

/**
 * Explains, in coarse non-sensitive terms, why the server could not check an admin sign-in.
 *
 * It lives in its own module and loads the Admin SDK lazily on purpose: if the SDK cannot start (wrong Node
 * version, missing or malformed credentials), the main admin actions fail to load at all, and this is the
 * one call that still works and can say why. Nothing here reveals a secret; only a category is returned.
 */
export type AdminSetupProblem =
    /** Everything works; the earlier failure was transient. */
    | "ok"
    /** The Firebase Admin SDK could not start in this runtime (usually the Node.js version). */
    | "sdk-load"
    /** FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not set for this deployment. */
    | "credentials-missing"
    /** The service account was rejected: wrong key, malformed private key, or no permission. */
    | "credentials-invalid"
    /** The service account (or token) belongs to a different Firebase project than the web config. */
    | "wrong-project"
    /** The sign-in token itself could not be verified. */
    | "token";

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function diagnoseAdminSetup(idToken: string): Promise<AdminSetupProblem> {
    let auth: import("firebase-admin/auth").Auth;
    try {
        ({ auth } = await import("@/lib/firebase-admin"));
    } catch (error) {
        const message = messageOf(error);
        console.error("[admin-diagnose] The Admin SDK could not start:", message);
        if (/credentials are missing/i.test(message)) return "credentials-missing";
        if (/private key|PEM|DECODER|parse/i.test(message)) return "credentials-invalid";
        return "sdk-load";
    }

    let uid: string;
    try {
        uid = (await auth.verifyIdToken(idToken)).uid;
    } catch (error) {
        const message = messageOf(error);
        console.error("[admin-diagnose] Could not verify the ID token:", message);
        if (/incorrect "aud"|incorrect "iss"|audience|issuer/i.test(message)) return "wrong-project";
        return "token";
    }

    // The token is fine; check that the service account is actually allowed to read accounts
    try {
        await auth.getUser(uid);
        return "ok";
    } catch (error) {
        console.error("[admin-diagnose] The service account could not read the account:", messageOf(error));
        return "credentials-invalid";
    }
}
