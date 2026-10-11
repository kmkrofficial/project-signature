"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/lib/firebase-admin";
import { grantAdminIfAllowed, parseAdminEmails, type AdminAccessResult } from "@/lib/admin-access";
import { CONFIG_TAG, POSTS_TAG } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import {
    PREVIEW_SESSION_COOKIE,
    createPreviewLink as createLink,
    listPreviewLinks as listLinks,
    openLockedPreview,
    revokePreviewLink as revokeLink,
    revokePreviewLinksForPost,
    type PreviewLinkSummary,
} from "@/lib/previews";

const MAX_PREVIEW_CHARS = 500_000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Verifies a Firebase ID token and requires the `admin` custom claim. */
async function requireAdmin(idToken: string): Promise<DecodedIdToken> {
    const decoded = await auth.verifyIdToken(idToken).catch(() => null);
    if (decoded?.admin !== true) {
        throw new Error("Unauthorized");
    }
    return decoded;
}

/**
 * Expires cached public content after an Admin Studio edit so readers see it immediately.
 * Callable only with a valid Firebase ID token carrying the `admin` custom claim.
 */
export async function revalidateContent(idToken: string, scope: "posts" | "config" = "posts"): Promise<void> {
    await requireAdmin(idToken);
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

/** Renders markdown with the same pipeline as the public site, for the editor's live preview. */
export async function renderPreview(idToken: string, markdown: string): Promise<{ html: string }> {
    await requireAdmin(idToken);
    const { html } = await renderMarkdown(markdown.slice(0, MAX_PREVIEW_CHARS));
    return { html };
}

export interface CreatePreviewLinkOptions {
    /** "self" opens a one-hour link for the author; "share" is a review link for other people. */
    kind: "self" | "share";
    label?: string;
    /** Review link lifetime in days (1, 7 or 30). */
    days?: number;
    /** Only this Google account can open the link. */
    lockedEmail?: string;
}

/** Creates a preview link for a draft. The returned path contains the only copy of the token. */
export async function createPreviewLink(
    idToken: string,
    postId: string,
    options: CreatePreviewLinkOptions
): Promise<{ path: string; link: PreviewLinkSummary }> {
    await requireAdmin(idToken);

    const days = [1, 7, 30].includes(options.days ?? 7) ? (options.days ?? 7) : 7;
    const { token, link } = await createLink({
        postId,
        kind: options.kind,
        label: options.kind === "self" ? "Author preview" : options.label,
        ttlMs: options.kind === "self" ? HOUR_MS : days * DAY_MS,
        lockedEmail: options.kind === "share" ? options.lockedEmail : null,
    });

    return { path: `/preview/${token}`, link };
}

export async function listPreviewLinks(idToken: string, postId: string): Promise<PreviewLinkSummary[]> {
    await requireAdmin(idToken);
    return listLinks(postId);
}

export async function revokePreviewLink(idToken: string, id: string): Promise<void> {
    await requireAdmin(idToken);
    await revokeLink(id);
}

/** Kills every preview link of an article, e.g. when it is moved to the trash. */
export async function revokePostPreviewLinks(idToken: string, postId: string): Promise<void> {
    await requireAdmin(idToken);
    await revokePreviewLinksForPost(postId);
}

/**
 * A reviewer proves their Google account to open an email-locked preview link. On success this browser
 * gets an httpOnly cookie scoped to that link; nothing else is granted.
 */
export async function unlockPreview(token: string, idToken: string): Promise<"ok" | "denied"> {
    const decoded = await auth.verifyIdToken(idToken).catch(() => null);
    const isGoogle = decoded?.firebase?.sign_in_provider === "google.com";
    if (!decoded?.email || decoded.email_verified !== true || !isGoogle) return "denied";

    const session = await openLockedPreview(token, decoded.email);
    if (!session) return "denied";

    (await cookies()).set(PREVIEW_SESSION_COOKIE, session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: `/preview/${token}`,
        maxAge: session.maxAgeSeconds,
    });
    return "ok";
}
