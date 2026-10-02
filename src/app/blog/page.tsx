import type { Metadata } from "next";
import { BlogListClient } from "./BlogListClient";

export const metadata: Metadata = {
    title: "Articles & Writings | Keerthi's Signature",
    description: "Deep dives on systems architecture, web performance, and modern engineering practices.",
};

export default function BlogPage() {
    return <BlogListClient />;
}
