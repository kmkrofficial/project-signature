import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { TOPICS } from "@/lib/categoryUtils";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getPublishedPosts();
    const latestUpdate = posts[0]?.updatedAt;

    return [
        { url: SITE_URL, lastModified: latestUpdate, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
        ...TOPICS.map((topic) => ({
            url: `${SITE_URL}/topics/${topic.slug}`,
            lastModified: posts.find((post) => post.category === topic.name)?.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.5,
        })),
        ...posts.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];
}
