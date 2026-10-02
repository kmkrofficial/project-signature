import type { Metadata } from "next";
import { BlogListClient } from "@/app/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Keerthi's Signature | Thoughts, Software & Systems",
  description: "Articles, engineering architecture, and practical ideas from real-world digital products by Keerthi Raajan.",
};

export default function Home() {
  return <BlogListClient />;
}
