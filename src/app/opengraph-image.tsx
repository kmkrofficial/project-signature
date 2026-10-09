import { getSiteConfig } from "@/lib/posts";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

export const alt = "Signature — articles on systems, AI and software architecture";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    const config = await getSiteConfig();
    return renderOgCard({
        eyebrow: config.author,
        title: config.siteDescription,
        footer: new URL(SITE_URL).host,
    });
}
