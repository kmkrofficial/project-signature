import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/posts";
import { TOPICS, getTopicBySlug } from "@/lib/categoryUtils";
import { PostList } from "@/components/blog/PostList";
import { TopicNav } from "@/components/blog/TopicNav";
import { PageTransition } from "@/components/layout/PageTransition";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
    return TOPICS.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const topic = getTopicBySlug((await params).topic);
    if (!topic) return { title: "Topic not found" };
    return {
        title: topic.name,
        description: `Articles about ${topic.name} on Signature.`,
        alternates: { canonical: `/topics/${topic.slug}` },
    };
}

export default async function TopicPage({ params }: Props) {
    const topic = getTopicBySlug((await params).topic);
    if (!topic) notFound();

    const posts = (await getPublishedPosts()).filter((post) => post.category === topic.name);

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
                <div className="flex flex-col gap-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{topic.name}</h1>
                    <TopicNav active={topic.slug} />
                </div>
                <PostList posts={posts} emptyMessage={`No articles about ${topic.name} yet.`} />
            </div>
        </PageTransition>
    );
}
