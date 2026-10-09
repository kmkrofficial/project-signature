import type { Metadata } from "next";
import { getPublishedPosts, getSiteConfig } from "@/lib/posts";
import { FeaturedSection, pickFeatured } from "@/components/blog/FeaturedSection";
import { PostList } from "@/components/blog/PostList";
import { TopicNav } from "@/components/blog/TopicNav";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig();
    return {
        title: { absolute: config.siteTitle },
        alternates: { canonical: "/" },
    };
}

export default async function Home() {
    const [posts, config] = await Promise.all([getPublishedPosts(), getSiteConfig()]);
    const featured = pickFeatured(posts);
    const latest = featured ? posts.filter((post) => post.id !== featured.id) : posts;

    return (
        <PageContainer>
            <h1 className="sr-only">{config.siteTitle}</h1>

            {featured && <FeaturedSection post={featured} />}

            <section aria-labelledby="latest-heading">
                <div className="flex flex-col gap-4 mb-4">
                    <h2 id="latest-heading" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Latest articles
                    </h2>
                    <TopicNav />
                </div>
                <PostList posts={latest} />
            </section>
        </PageContainer>
    );
}
