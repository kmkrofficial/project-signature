import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { TOPICS } from "@/lib/categoryUtils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev").replace(/\/$/, "");
    const posts = await getPublishedPosts();
    const latestUpdate = posts[0]?.updatedAt;

    return [
        { url: siteUrl, lastModified: latestUpdate, changeFrequency: "weekly", priority: 1 },
        { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
        ...TOPICS.map((topic) => ({
            url: `${siteUrl}/topics/${topic.slug}`,
            lastModified: posts.find((post) => post.category === topic.name)?.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.5,
        })),
        ...posts.map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];
}
