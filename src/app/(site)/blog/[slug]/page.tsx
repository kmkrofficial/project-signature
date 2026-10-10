import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getAdjacentPosts, getPostBySlug, getPublishedPosts, getRedirectForSlug, getSiteConfig } from "@/lib/posts";
import { ArticleSkeleton } from "@/components/blog/ArticleSkeleton";
import { ArticleView } from "@/components/blog/ArticleView";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    // Cache Components requires at least one param; unknown slugs still render on demand
    return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const [post, config] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
    if (!post) return { title: "Article not found" };

    // Social images come from the sibling opengraph-image.tsx (branded card per article)
    return {
        title: post.title,
        description: post.excerpt || undefined,
        authors: [{ name: config.author, url: "/about" }],
        alternates: { canonical: `/blog/${post.slug}` },
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            type: "article",
            url: `/blog/${post.slug}`,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [config.author],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || undefined,
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    return (
        <Suspense fallback={<ArticleSkeleton />}>
            <Article params={params} />
        </Suspense>
    );
}

async function Article({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
        // A renamed article: send old links to its current address
        const currentSlug = await getRedirectForSlug(slug);
        if (currentSlug) permanentRedirect(`/blog/${currentSlug}`);
        notFound();
    }

    const [adjacent, config] = await Promise.all([getAdjacentPosts(slug), getSiteConfig()]);

    const url = absoluteUrl(`/blog/${post.slug}`);
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || undefined,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        url,
        mainEntityOfPage: url,
        image: post.coverImage || undefined,
        keywords: post.tags.join(", ") || undefined,
        articleSection: post.category,
        author: { "@type": "Person", name: config.author, url: absoluteUrl("/about") },
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <ArticleView mode="published" post={post} config={config} adjacent={adjacent} />
        </>
    );
}
