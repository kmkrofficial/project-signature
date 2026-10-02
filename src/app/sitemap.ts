import { MetadataRoute } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev";

    // Static pages
    const routes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
    ];

    try {
        const q = query(collection(db, "blog"), where("published", "==", true));
        const snap = await getDocs(q);

        snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.slug) {
                routes.push({
                    url: `${siteUrl}/blog/${data.slug}`,
                    lastModified: data.updatedAt?.seconds
                        ? new Date(data.updatedAt.seconds * 1000)
                        : data.createdAt?.seconds
                        ? new Date(data.createdAt.seconds * 1000)
                        : new Date(),
                    changeFrequency: "weekly",
                    priority: 0.8,
                });
            }
        });
    } catch (err) {
        console.error("Error generating dynamic sitemap:", err);
    }

    return routes;
}
