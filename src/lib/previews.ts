import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getPostForPreview } from "@/lib/posts";
import type { Post } from "@/types/blog";

/**
 * Draft preview links.
 *
 * A link is a random 256-bit token. Only its SHA-256 hash is stored (as the document id), so a leaked
 * database cannot be turned into working links. The `previews` collection is denied to every client by the
 * Firestore rules and is only reachable here, through the Admin SDK.
 */
const COLLECTION = "previews";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_SESSIONS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export const PREVIEW_SESSION_COOKIE = "preview_session";

export type PreviewKind = "self" | "share";

export interface PreviewLinkSummary {
    /** Hash of the token; safe to show and to pass back for revoking. The token itself is never recoverable. */
    id: string;
    postId: string;
    label: string;
    kind: PreviewKind;
    lockedEmail: string | null;
    createdAt: string;
    expiresAt: string;
    views: number;
    lastViewedAt: string | null;
}

export type PreviewResolution =
    | { status: "invalid" }
    | { status: "published"; slug: string }
    | { status: "locked" }
    | { status: "ok"; post: Post; expiresAt: string };

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

const iso = (value: unknown): string | null =>
    value instanceof Timestamp ? value.toDate().toISOString() : null;

function toSummary(id: string, data: DocumentData): PreviewLinkSummary {
    return {
        id,
        postId: String(data.postId ?? ""),
        label: String(data.label ?? ""),
        kind: data.kind === "self" ? "self" : "share",
        lockedEmail: typeof data.lockedEmail === "string" ? data.lockedEmail : null,
        createdAt: iso(data.createdAt) ?? new Date(0).toISOString(),
        expiresAt: iso(data.expiresAt) ?? new Date(0).toISOString(),
        views: Number(data.views) || 0,
        lastViewedAt: iso(data.lastViewedAt),
    };
}

export async function createPreviewLink(options: {
    postId: string;
    kind: PreviewKind;
    label?: string;
    /** Lifetime; clamped to 1 minute .. 30 days. */
    ttlMs: number;
    lockedEmail?: string | null;
}): Promise<{ token: string; link: PreviewLinkSummary }> {
    const post = await db.collection("blog").doc(options.postId).get();
    if (!post.exists || post.data()?.deletedAt) throw new Error("Article not found");

    const ttlMs = Math.min(Math.max(options.ttlMs, 60_000), 30 * DAY_MS);
    const lockedEmail = options.lockedEmail?.trim().toLowerCase() || null;
    if (lockedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lockedEmail)) throw new Error("Invalid email address");

    const token = randomBytes(32).toString("base64url");
    const id = hash(token);
    const now = Date.now();

    const data = {
        postId: options.postId,
        kind: options.kind,
        label: (options.label ?? "").trim().slice(0, 80),
        lockedEmail,
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + ttlMs),
        revoked: false,
        views: 0,
        lastViewedAt: null,
        sessionHashes: [] as string[],
    };
    await db.collection(COLLECTION).doc(id).set(data);

    return { token, link: toSummary(id, data) };
}

/** Active (not revoked, not expired) review links for a post. Self-preview links are not listed. */
export async function listPreviewLinks(postId: string): Promise<PreviewLinkSummary[]> {
    const snap = await db.collection(COLLECTION).where("postId", "==", postId).get();
    const now = Date.now();
    return snap.docs
        .filter((doc) => doc.data().kind === "share" && doc.data().revoked !== true)
        .map((doc) => toSummary(doc.id, doc.data()))
        .filter((link) => Date.parse(link.expiresAt) > now)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function revokePreviewLink(id: string): Promise<void> {
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error("Invalid link");
    await db.collection(COLLECTION).doc(id).update({ revoked: true });
}

/** Revokes every link of a post, e.g. when it is deleted. */
export async function revokePreviewLinksForPost(postId: string): Promise<void> {
    const snap = await db.collection(COLLECTION).where("postId", "==", postId).get();
    await Promise.all(snap.docs.filter((d) => d.data().revoked !== true).map((d) => d.ref.update({ revoked: true })));
}

/**
 * Looks a token up and decides what the visitor may see.
 * `sessionToken` is the value of the unlock cookie, needed only for email-locked links.
 */
export async function resolvePreview(token: string, sessionToken?: string): Promise<PreviewResolution> {
    if (!TOKEN_PATTERN.test(token)) return { status: "invalid" };

    const ref = db.collection(COLLECTION).doc(hash(token));
    const snap = await ref.get();
    const link = snap.data();
    if (!link || link.revoked === true) return { status: "invalid" };

    const expiresAt = iso(link.expiresAt);
    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) return { status: "invalid" };

    if (typeof link.lockedEmail === "string" && link.lockedEmail) {
        const sessions: string[] = Array.isArray(link.sessionHashes) ? link.sessionHashes : [];
        if (!sessionToken || !sessions.includes(hash(sessionToken))) return { status: "locked" };
    }

    const found = await getPostForPreview(String(link.postId));
    if (!found) return { status: "invalid" };
    if (found.published) return { status: "published", slug: found.post.slug };

    // Best effort: a failed counter update must never hide the article
    ref.update({ views: FieldValue.increment(1), lastViewedAt: Timestamp.now() }).catch(() => undefined);

    return { status: "ok", post: found.post, expiresAt };
}

/**
 * Grants this browser access to an email-locked link after the reviewer proved their Google account.
 * Returns the session token for the cookie and how long it stays valid, or null when not allowed.
 */
export async function openLockedPreview(
    token: string,
    verifiedEmail: string
): Promise<{ sessionToken: string; maxAgeSeconds: number } | null> {
    if (!TOKEN_PATTERN.test(token)) return null;

    const ref = db.collection(COLLECTION).doc(hash(token));
    const link = (await ref.get()).data();
    if (!link || link.revoked === true || typeof link.lockedEmail !== "string") return null;

    const expiresAt = iso(link.expiresAt);
    const remainingMs = expiresAt ? Date.parse(expiresAt) - Date.now() : 0;
    if (remainingMs <= 0 || link.lockedEmail !== verifiedEmail.trim().toLowerCase()) return null;

    const sessionToken = randomBytes(24).toString("base64url");
    const existing: string[] = Array.isArray(link.sessionHashes) ? link.sessionHashes : [];
    await ref.update({ sessionHashes: [...existing, hash(sessionToken)].slice(-MAX_SESSIONS) });

    return { sessionToken, maxAgeSeconds: Math.floor(remainingMs / 1000) };
}
