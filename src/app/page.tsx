import type { Metadata } from "next";
import { BlogListClient } from "@/app/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Keerthi Raajan | Blog & Writings",
  description: "Articles and thoughts on technology, software development, and lessons from building digital products.",
};

export default function Home() {
  return <BlogListClient />;
}
