import type { Metadata } from "next";
import { getPublishedPosts, getSiteConfig } from "@/lib/posts";
import { FeaturedSection, pickFeatured } from "@/components/blog/FeaturedSection";
import { PostList } from "@/components/blog/PostList";
import { TopicNav } from "@/components/blog/TopicNav";
import { PageTransition } from "@/components/layout/PageTransition";

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
        <PageTransition>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
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
            </div>
        </PageTransition>
    );
}
