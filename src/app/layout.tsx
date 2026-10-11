import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppShell } from "@/components/layout/AppShell";
import { getSiteConfig } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

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

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    title: {
      default: config.siteTitle,
      template: "%s | Signature",
    },
    description: config.siteDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
    // Icons and the default social image come from app/ file conventions
    openGraph: {
      title: config.siteTitle,
      description: config.siteDescription,
      siteName: "Signature",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light-mode');
                  } else if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light-mode');
                  } else if (supportDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light-mode');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light-mode');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Article images load straight from Firebase Storage; resolve DNS early without holding a socket */}
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary`}>
        <AppShell>
          <div className="top-hairline" aria-hidden="true" />

          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
