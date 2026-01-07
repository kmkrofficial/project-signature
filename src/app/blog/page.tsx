import type { Metadata } from "next";
import { BlogListClient } from "./BlogListClient";

export const metadata: Metadata = {
    title: "Blog | Keerthi Raajan K M",
    description: "Explore my thoughts on AI, Software Architecture, and the future of technology.",
};

export default function BlogPage() {
    return <BlogListClient />;
}
