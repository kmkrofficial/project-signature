import type { Metadata } from "next";
import { BlogPostClient } from "./BlogPostClient";
import { db } from "@/lib/firebase-admin";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 600;

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const slug = (await params).slug;

    try {
        const snap = await db.collection("blog").where("slug", "==", slug).limit(1).get();

        if (!snap.empty) {
            const data = snap.docs[0].data();
            return {
                title: `${data.title} | Keerthi Raajan K M`,
                description: data.excerpt || "Read this blog post on Keerthi Raajan's portfolio.",
                openGraph: {
                    title: data.title,
                    description: data.excerpt,
                    type: "article",
                    tags: data.tags || [],
                },
            };
        }
    } catch (error) {
        console.error("Error fetching metadata for blog post:", error);
    }

    return {
        title: "Blog Post | Keerthi Raajan K M",
        description: "Read this blog post on Keerthi Raajan's portfolio.",
    };
}

export default function BlogPostPage() {
    return <BlogPostClient />;
}
