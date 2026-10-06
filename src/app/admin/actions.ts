"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/firebase-admin";
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
