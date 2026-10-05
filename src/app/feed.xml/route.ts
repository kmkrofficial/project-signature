import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

interface FeedItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    pubDate: string;
    category: string;
    timestamp: number;
}

export async function GET() {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev").replace(/\/$/, "");

    let posts: FeedItem[] = [];
    try {
        const snap = await db
            .collection("blog")
            .where("published", "==", true)
            .get();

        posts = snap.docs.map((doc) => {
            const d = doc.data();
            const createdAtSeconds =
                d.createdAt?.seconds ||
                (d.createdAt?._seconds ??
                (d.createdAt?.toDate ? Math.floor(d.createdAt.toDate().getTime() / 1000) : null) ??
                Math.floor(Date.now() / 1000));

            return {
                id: doc.id,
                title: d.title || "Untitled Article",
                slug: d.slug || doc.id,
                excerpt: d.excerpt || "",
                pubDate: new Date(createdAtSeconds * 1000).toUTCString(),
                category: d.category || (d.tags && d.tags[0]) || "Engineering",
                timestamp: createdAtSeconds,
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
        console.error("Error generating RSS feed via firebase-admin:", err);
    }

    const itemsXml = posts
        .map(
            (p) => `        <item>
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
        <title><![CDATA[Signature | Articles & Thoughts]]></title>
        <link>${siteUrl}</link>
        <description><![CDATA[Articles, systems architecture breakdowns, and practical ideas from real-world digital products on Signature.]]></description>
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
