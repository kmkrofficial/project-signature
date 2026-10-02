import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let config = {
    siteTitle: "Keerthi's Signature | Thoughts & Tech Writings",
    siteDescription: "Articles on technology, building software, and practical ideas from real-world projects.",
    ogImageUrl: "",
  };

  try {
    const docRef = doc(db, "config", "site");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      config = {
        siteTitle: data.siteTitle || config.siteTitle,
        siteDescription: data.siteDescription || config.siteDescription,
        ogImageUrl: data.ogImageUrl || "",
      };
    }
  } catch (error) {
    console.warn(`[Layout] Error fetching metadata from Firestore:`, error);
  }

  return {
    title: {
      default: config.siteTitle || "Keerthi's Signature | Thoughts & Tech Writings",
      template: "%s | Keerthi's Signature",
    },
    description: config.siteDescription,
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://keerthiraajan.dev"),
    alternates: {
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
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
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzelDecorative.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary`}>
        <ToastProvider>
          <AppShell>
            {children}
          </AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
