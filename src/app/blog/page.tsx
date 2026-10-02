import type { Metadata } from "next";
import { BlogListClient } from "./BlogListClient";

export const metadata: Metadata = {
    title: "Blog | Keerthi Raajan K M",
    description: "Articles on technology, building software, and ideas for the future.",
};

export default function BlogPage() {
    return <BlogListClient />;
}
