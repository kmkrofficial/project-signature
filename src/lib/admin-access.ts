import type { Auth } from "firebase-admin/auth";

export type AdminAccessResult =
    /** The claim was just granted; refresh the ID token to see it. */
    | "granted"
    /** The account already has the claim (the client token was stale). */
    | "already"
    /** The account is not allowed to be an admin. */
    | "denied"
    /** The server could not verify the account (bad token, or Firebase credentials not set up). */
    | "unavailable";

/** Parses a comma, semicolon or whitespace separated list of emails; lower-cased, empty entries dropped. */
export function parseAdminEmails(raw: string | undefined): string[] {
    return (raw ?? "")
        .split(/[,;\s]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Grants the `admin` custom claim to a Google account whose verified email is on the server-side allowlist.
 *
 * The allowlist alone decides nothing in the browser: the server verifies the ID token, the email must be
 * verified by Google, and only then is the claim set. Firestore and Storage rules still enforce the claim.
 */
export async function grantAdminIfAllowed(
    auth: Pick<Auth, "verifyIdToken" | "getUser" | "setCustomUserClaims">,
    idToken: string,
    allowedEmails: string[]
): Promise<AdminAccessResult> {
    if (allowedEmails.length === 0) return "denied";

    let decoded;
    try {
        decoded = await auth.verifyIdToken(idToken);
    } catch (error) {
        console.error("[admin-access] Could not verify the ID token:", error instanceof Error ? error.message : error);
        return "unavailable";
    }

    if (decoded.admin === true) return "already";

    const email = decoded.email?.toLowerCase();
    const isVerifiedGoogleAccount = decoded.email_verified === true && decoded.firebase?.sign_in_provider === "google.com";
    if (!email || !isVerifiedGoogleAccount || !allowedEmails.includes(email)) return "denied";

    try {
        const user = await auth.getUser(decoded.uid);
        await auth.setCustomUserClaims(decoded.uid, { ...user.customClaims, admin: true });
        return "granted";
    } catch (error) {
        console.error("[admin-access] Could not set the admin claim:", error instanceof Error ? error.message : error);
        return "unavailable";
    }
}
