import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { unstable_cache } from "next/cache";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const getSiteConfig = unstable_cache(
  async () => {
    const fallback = {
      siteTitle: "Keerthi Raajan K M | Full-Stack AI Engineer",
      siteDescription:
        "Digital Nervous System of Keerthi Raajan K M - Architecting high-availability systems and AI integration.",
      ogImageUrl: "",
    };
    try {
      const { db } = await import("@/lib/firebase-admin");
      const snap = await db.doc("config/site").get();
      if (snap.exists) {
        const data = snap.data() || {};
        return {
          siteTitle: data.siteTitle || fallback.siteTitle,
          siteDescription: data.siteDescription || fallback.siteDescription,
          ogImageUrl: data.ogImageUrl || "",
        };
      }
    } catch (error) {
      console.warn("[Layout] Error fetching metadata from Firestore (config/site):", error);
    }
    return fallback;
  },
  ["site-config"],
  { revalidate: 3600, tags: ["site-config"] }
);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    title: config.siteTitle,
    description: config.siteDescription,
    openGraph: {
      title: config.siteTitle,
      description: config.siteDescription,
      images: config.ogImageUrl ? [{ url: config.ogImageUrl }] : [],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
