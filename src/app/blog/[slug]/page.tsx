import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostClient } from "./BlogPostClient";
import { db } from "@/lib/firebase-admin";
import { toFriendlyCategory } from "@/lib/categoryUtils";
import type { BlogPost } from "@/types/blog";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;

    try {
        const snap = await db.collection("blog").where("slug", "==", slug).limit(1).get();

        if (!snap.empty) {
            const data = snap.docs[0].data();
            const title = data.title ? `${data.title} | Signature` : "Article | Signature";
            const description = data.excerpt || "Read this article on Signature.";
            const images = data.coverImage ? [data.coverImage] : [];

            return {
                title,
                description,
                openGraph: {
                    title,
                    description,
                    type: "article",
                    tags: data.tags || [],
                    images,
                },
                twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    images,
                },
            };
        }
    } catch (error) {
        console.error("Error fetching metadata for blog post:", error);
    }

    return {
        title: "Article | Signature",
        description: "Read this article on Signature.",
    };
}

export default async function BlogPostPage({ params }: Props) {
    const slug = (await params).slug;

    let initialPost: BlogPost | null = null;
    let prevPost: { slug: string; title: string; category: string; readTime: string } | null = null;
    let nextPost: { slug: string; title: string; category: string; readTime: string } | null = null;

    try {
        // 1. Fetch current post
        const snap = await db.collection("blog").where("slug", "==", slug).limit(1).get();

        if (snap.empty) {
            notFound();
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data();

        const createdAtSeconds =
            data.createdAt?.seconds ||
            (data.createdAt?._seconds ??
            (data.createdAt?.toDate ? Math.floor(data.createdAt.toDate().getTime() / 1000) : null) ??
            Math.floor(Date.now() / 1000));

        initialPost = {
            id: docSnap.id,
            title: data.title || "Untitled Article",
            slug: data.slug || slug,
            excerpt: data.excerpt || "",
            coverImage: data.coverImage || "",
            content: data.content || "",
            tags: data.tags || [],
            category: toFriendlyCategory(data.category || (data.tags && data.tags[0]) || "Technology"),
            date: new Date(createdAtSeconds * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min read`,
            likes: data.likes || 0,
            published: data.published ?? true,
        };

        // 2. Fetch adjacent published posts for Next/Previous article navigation
        const allSnap = await db.collection("blog").where("published", "==", true).get();
        const sorted = allSnap.docs
            .map((d) => {
                const dData = d.data();
                const postSeconds =
                    dData.createdAt?.seconds ||
                    (dData.createdAt?._seconds ??
                    (dData.createdAt?.toDate ? Math.floor(dData.createdAt.toDate().getTime() / 1000) : null) ??
                    0);
                return {
                    id: d.id,
                    slug: dData.slug || d.id,
                    title: dData.title || "Untitled Article",
                    category: toFriendlyCategory(dData.category || (dData.tags && dData.tags[0]) || "Technology"),
                    timestamp: postSeconds,
                    readTime: `${Math.max(1, Math.ceil((dData.content?.split(/\s+/).length || 0) / 200))} min read`,
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        const currentIndex = sorted.findIndex((p) => p.slug === slug);
        if (currentIndex !== -1) {
            // Newer article
            if (currentIndex > 0) {
                const n = sorted[currentIndex - 1];
                nextPost = { slug: n.slug, title: n.title, category: n.category, readTime: n.readTime };
            }
            // Older article
            if (currentIndex < sorted.length - 1) {
                const p = sorted[currentIndex + 1];
                prevPost = { slug: p.slug, title: p.title, category: p.category, readTime: p.readTime };
            }
        }
    } catch (error) {
        console.error("Error in BlogPostPage SSR:", error);
        // If notFound was thrown, let it propagate
        if ((error as { digest?: string })?.digest?.startsWith("NEXT_NOT_FOUND")) {
            throw error;
        }
    }

    if (!initialPost) {
        notFound();
    }

    return (
        <BlogPostClient
            initialPost={initialPost}
            prevPost={prevPost}
            nextPost={nextPost}
        />
    );
}
