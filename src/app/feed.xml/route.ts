import { cacheLife, cacheTag } from "next/cache";
import { getPostBySlug, getPublishedPosts, getSiteConfig, CONFIG_TAG, POSTS_TAG } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

const FEED_SIZE = 20;

function cdata(value: string): string {
    return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

/** Feed readers get the article body without the interactive code-block chrome. */
function feedHtml(html: string): string {
    return html.replace(/<div class="code-block-header">[\s\S]*?<\/div>/g, "");
}

async function buildFeed(): Promise<string> {
    "use cache";
    cacheLife("days");
    cacheTag(POSTS_TAG, CONFIG_TAG);

    const base = SITE_URL;
    const [summaries, config] = await Promise.all([getPublishedPosts(), getSiteConfig()]);
    const posts = await Promise.all(summaries.slice(0, FEED_SIZE).map((summary) => getPostBySlug(summary.slug)));
    const lastBuildDate = summaries[0]?.updatedAt ?? new Date(0).toISOString();

    const items = posts
        .filter((post) => post !== null)
        .map(
            (post) => `    <item>
      <title>${cdata(post.title)}</title>
      <link>${base}/blog/${post.slug}</link>
      <guid isPermaLink="true">${base}/blog/${post.slug}</guid>
      <dc:creator>${cdata(config.author)}</dc:creator>
      <description>${cdata(post.excerpt)}</description>
      <content:encoded>${cdata(feedHtml(post.html))}</content:encoded>
      <category>${cdata(post.category)}</category>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`
        )
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${cdata(config.siteTitle)}</title>
    <link>${base}</link>
    <description>${cdata(config.siteDescription)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

export async function GET() {
    return new Response(await buildFeed(), {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
}
