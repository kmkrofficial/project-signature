import type { Metadata } from "next";
import { BlogListClient } from "@/app/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Signature | Systems, AI & Software Architecture",
  description: "Articles, engineering architecture, and practical ideas from real-world digital products by Keerthi Raajan.",
};

export default function Home() {
  return <BlogListClient />;
}
