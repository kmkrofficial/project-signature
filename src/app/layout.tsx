import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ToastProvider } from "@/context/ToastContext";

export async function generateMetadata(): Promise<Metadata> {
  let config = {
    siteTitle: "Keerthi Raajan K M | Full-Stack AI Engineer",
    siteDescription: "Digital Nervous System of Keerthi Raajan K M - Architecting high-availability systems and AI integration.",
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
    console.warn(`[Layout] Error fetching metadata from Firestore (config/site):`, error);
  }

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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-mono`}>
        <ToastProvider>
          <AppShell>
            {children}
          </AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
