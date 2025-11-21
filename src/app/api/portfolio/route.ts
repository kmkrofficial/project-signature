import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [skillsSnap, experienceSnap, projectsSnap, personalSnap] = await Promise.all([
            db.collection("skills").get(),
            db.collection("experience").orderBy("period", "desc").get(),
            db.collection("projects").get(),
            db.doc("config/personal").get(),
        ]);

        const skills = skillsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const experience = experienceSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const projects = projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const personal = personalSnap.exists ? personalSnap.data() : {};

        return NextResponse.json({
            personal,
            skills,
            experience,
            projects,
        });
    } catch (error) {
        console.error("Error fetching portfolio data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
