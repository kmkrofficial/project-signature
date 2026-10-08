import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/posts";
import { TOPICS, getTopicBySlug } from "@/lib/categoryUtils";
import { FeaturedSection, pickFeatured } from "@/components/blog/FeaturedSection";
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

    const allPosts = await getPublishedPosts();
    const featured = pickFeatured(allPosts);
    const topicPosts = allPosts.filter((post) => post.category === topic.name);
    // The spotlight is shown above, so it is not repeated in the list (and view-transition names stay unique)
    const posts = topicPosts.filter((post) => post.id !== featured?.id);
    const emptyMessage =
        topicPosts.length > posts.length ? `No other articles about ${topic.name} yet.` : `No articles about ${topic.name} yet.`;

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
                {featured && <FeaturedSection post={featured} />}

                <div className="flex flex-col gap-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{topic.name}</h1>
                    <TopicNav active={topic.slug} />
                </div>
                <PostList posts={posts} emptyMessage={emptyMessage} />
            </div>
        </PageTransition>
    );
}
