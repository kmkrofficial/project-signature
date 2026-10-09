"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/firebase-admin";
import { grantAdminIfAllowed, parseAdminEmails, type AdminAccessResult } from "@/lib/admin-access";
import { CONFIG_TAG, POSTS_TAG } from "@/lib/posts";

/**
 * Expires cached public content after an Admin Studio edit so readers see it immediately.
 * Callable only with a valid Firebase ID token carrying the `admin` custom claim.
 */
export async function revalidateContent(idToken: string, scope: "posts" | "config" = "posts"): Promise<void> {
    const decoded = await auth.verifyIdToken(idToken).catch(() => null);
    if (decoded?.admin !== true) {
        throw new Error("Unauthorized");
    }
    updateTag(scope === "config" ? CONFIG_TAG : POSTS_TAG);
}

/**
 * First sign-in for an allowlisted admin: grants the `admin` claim if the account's verified Google email is
 * in ADMIN_EMAILS (NEXT_PUBLIC_ADMIN_EMAILS is still read as a fallback). Everyone else gets "denied".
 */
export async function claimAdminAccess(idToken: string): Promise<AdminAccessResult> {
    const allowed = parseAdminEmails(process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS);
    return grantAdminIfAllowed(auth, idToken, allowed);
}
