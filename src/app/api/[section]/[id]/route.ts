import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/lib/firebase-admin";

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

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ section: string; id: string }> }
) {
    const { section, id } = await params;
    const user = await validateAuth(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        await db.collection(section).doc(id).set(data, { merge: true });
        return NextResponse.json({ success: true, message: "Updated successfully" });
    } catch (error) {
        console.error(`Error updating ${section}/${id}:`, error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ section: string; id: string }> }
) {
    const { section, id } = await params;
    const user = await validateAuth(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await db.collection(section).doc(id).delete();
        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error(`Error deleting ${section}/${id}:`, error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
