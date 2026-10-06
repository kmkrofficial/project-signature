import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";

const POST_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

type LikeAction = "like" | "unlike";

function getClientIp(req: NextRequest): string {
    // Vercel sets x-forwarded-for; the first entry is the original client
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

function isSameOrigin(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    if (!origin) return true;
    try {
        return new URL(origin).host === req.headers.get("host");
    } catch {
        return false;
    }
}

function getSalt(): string | null {
    const salt = process.env.LIKE_HASH_SALT;
    if (salt) return salt;
    return process.env.NODE_ENV === "production" ? null : "dev-like-salt";
}

export async function POST(req: NextRequest) {
    if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const salt = getSalt();
    if (!salt) {
        console.error("[likes] LIKE_HASH_SALT is not configured");
        return NextResponse.json({ error: "Likes are unavailable" }, { status: 503 });
    }

    let postId: unknown;
    let action: unknown;
    try {
        ({ postId, action } = await req.json());
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (typeof postId !== "string" || !POST_ID_PATTERN.test(postId) || (action !== "like" && action !== "unlike")) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // One like per reader per post, keyed by a salted hash (the raw IP is never stored)
    const likerId = createHash("sha256").update(`${getClientIp(req)}:${postId}:${salt}`).digest("hex");
    const postRef = db.collection("blog").doc(postId);
    const likerRef = postRef.collection("likers").doc(likerId);
    const wantLiked = (action as LikeAction) === "like";

    try {
        const result = await db.runTransaction(async (tx) => {
            const [post, liker] = await Promise.all([tx.get(postRef), tx.get(likerRef)]);
            if (!post.exists || post.get("published") !== true) return null;

            const current = Math.max(0, Number(post.get("likes")) || 0);
            if (liker.exists === wantLiked) {
                return { likes: current, liked: wantLiked };
            }

            if (wantLiked) {
                tx.create(likerRef, { createdAt: FieldValue.serverTimestamp() });
            } else {
                tx.delete(likerRef);
            }
            tx.update(postRef, { likes: FieldValue.increment(wantLiked ? 1 : -1) });

            return { likes: Math.max(0, current + (wantLiked ? 1 : -1)), liked: wantLiked };
        });

        if (!result) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("[likes] Transaction failed:", error);
        return NextResponse.json({ error: "Could not update like" }, { status: 500 });
    }
}
