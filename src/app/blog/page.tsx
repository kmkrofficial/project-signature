import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogListClient } from "./BlogListClient";
import { BlogListSkeleton } from "@/components/blog/BlogListSkeleton";

export const metadata: Metadata = {
    title: "Articles & Writings | Signature",
    description: "Deep dives on systems architecture, web performance, and modern engineering practices.",
};

export default function BlogPage() {
    return (
        <Suspense fallback={<BlogListSkeleton />}>
            <BlogListClient />
        </Suspense>
    );
}
