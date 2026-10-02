import type { Metadata } from "next";
import { BlogListClient } from "@/app/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Keerthi Raajan | Engineering Journal & Architecture",
  description: "Technical essays and architecture deep-dives on distributed systems, full-stack AI integration, and software craft.",
};

export default function Home() {
  return <BlogListClient />;
}
