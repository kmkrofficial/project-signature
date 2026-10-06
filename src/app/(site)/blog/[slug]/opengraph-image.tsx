import { getPostBySlug, getPublishedPosts, getSiteConfig } from "@/lib/posts";
import { formatDate, formatReadingTime } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

export const alt = "Article on Signature";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Prerender one card per published article at build time
export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "welcome" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [post, config] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
    const host = new URL(SITE_URL).host;

    if (!post) {
        return renderOgCard({ eyebrow: config.author, title: config.siteTitle, footer: host });
    }

    return renderOgCard({
        eyebrow: post.category,
        title: post.title,
        footer: `${config.author} · ${formatDate(post.publishedAt)} · ${formatReadingTime(post.readingTime)}`,
    });
}
