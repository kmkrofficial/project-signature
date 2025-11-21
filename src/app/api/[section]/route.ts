import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";

// Helper to validate auth
async function validateAuth(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.split("Bearer ")[1];
    try {
        return await auth.verifyIdToken(token);
    } catch (e) {
        return null;
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    const { section } = await params;
    const user = await validateAuth(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        if (section === "personal") {
            await db.doc("config/personal").set(data, { merge: true });
            return NextResponse.json({ success: true, message: "Updated successfully" });
        } else {
            const docRef = await db.collection(section).add(data);
            return NextResponse.json({ success: true, id: docRef.id, message: "Created successfully" });
        }
    } catch (error) {
        console.error(`Error creating in ${section}:`, error);
        return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }
}
