import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev";

    let posts: any[] = [];
    try {
        const q = query(
            collection(db, "blog"),
            where("published", "==", true),
            limit(20)
        );
        const snap = await getDocs(q);
        posts = snap.docs.map((doc) => {
            const d = doc.data();
            return {
                id: doc.id,
                title: d.title || "",
                slug: d.slug || doc.id,
                excerpt: d.excerpt || "",
                pubDate: d.createdAt
                    ? new Date(d.createdAt.seconds * 1000).toUTCString()
                    : new Date().toUTCString(),
                category: d.category || (d.tags && d.tags[0]) || "Engineering",
            };
        });
    } catch (err) {
        console.error("Error generating RSS feed:", err);
    }

    const itemsXml = posts
        .map(
            (p) => `
        <item>
            <title><![CDATA[${p.title}]]></title>
            <link>${siteUrl}/blog/${p.slug}</link>
            <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
            <description><![CDATA[${p.excerpt}]]></description>
            <category><![CDATA[${p.category}]]></category>
            <pubDate>${p.pubDate}</pubDate>
        </item>`
        )
        .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Keerthi Raajan | Articles & Thoughts</title>
        <link>${siteUrl}</link>
        <description>Articles on technology, building software, and practical ideas from real-world projects.</description>
        <language>en-US</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
        ${itemsXml}
    </channel>
</rss>`;

    return new NextResponse(rssXml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
