import type { NextConfig } from "next";
import { TOPICS } from "./src/lib/categoryUtils";

const isDev = process.env.NODE_ENV === "development";

// Local Firebase Emulator Suite endpoints (development only)
const emulatorHosts = isDev ? " http://127.0.0.1:9099 http://127.0.0.1:8080 http://127.0.0.1:9199 http://localhost:9199" : "";

// Static (nonce-free) CSP so pages remain prerenderable and CDN-cacheable.
// apis.google.com + *.firebaseapp.com are required by the Firebase Auth sign-in popup.
const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://apis.google.com${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https:${emulatorHosts}`,
    "font-src 'self' data:",
    `connect-src 'self' https://*.googleapis.com${emulatorHosts}`,
    `frame-src https://*.firebaseapp.com${emulatorHosts}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "9199",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9199",
            },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
    compress: true,
    async redirects() {
        // Legacy URLs: the old /blog listing and ?category= filters now map to static topic pages
        const categoryRedirects = TOPICS.flatMap((topic) =>
            ["/", "/blog"].map((source) => ({
                source,
                has: [{ type: "query" as const, key: "category", value: topic.name }],
                destination: `/topics/${topic.slug}`,
                permanent: true,
            }))
        );
        return [...categoryRedirects, { source: "/blog", destination: "/", permanent: true }];
    },
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }];
    },
};

export default nextConfig;
