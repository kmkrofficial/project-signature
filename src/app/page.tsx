import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogListClient } from "@/app/blog/BlogListClient";
import { BlogListSkeleton } from "@/components/blog/BlogListSkeleton";

export const metadata: Metadata = {
    title: "Signature | Systems, AI & Software Architecture",
    description: "Articles, engineering architecture, and practical ideas from real-world digital products on Signature.",
};

export default function Home() {
    return (
        <Suspense fallback={<BlogListSkeleton />}>
            <BlogListClient />
        </Suspense>
    );
}
