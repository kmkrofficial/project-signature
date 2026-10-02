/**
 * Seed script for Firebase Local Emulator Suite using Firebase Admin
 * Usage: node scripts/seed-emulator.mjs
 */

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

import admin from "firebase-admin";

const projectId = "project-signature-2d8f9";

if (!admin.apps.length) {
    admin.initializeApp({
        projectId,
    });
}

const db = admin.firestore();

const SEED_POSTS = [
    {
        id: "post-http3-migration",
        title: "Zero-Downtime Migration to HTTP/3 and Edge Protocols",
        slug: "zero-downtime-migration-http3",
        excerpt: "A deep dive into migrating mission-critical APIs to QUIC and HTTP/3 without packet loss or protocol fallback penalty.",
        content: `## The Protocol Shift

Migrating an edge delivery network to HTTP/3 (QUIC) requires careful consideration of UDP packet handling, connection migration, and 0-RTT handshakes.

### Why HTTP/3 Matters
Traditional TCP-based HTTP/2 suffers from **Head-of-Line (HoL) blocking** when packets drop on lossy mobile connections. QUIC solves this at the transport layer by establishing independent UDP streams over user space.

\`\`\`rust
// Zero-downtime QUIC transport configuration
let mut server_config = ServerConfig::builder()
    .with_safe_default_cipher_suites()
    .with_safe_default_kx_groups()
    .with_protocol_versions(&[&version::TLS13])?;
\`\`\`

### Migration Checklist
- Enable UDP port 443 on edge load balancers
- Configure \`Alt-Svc: h3=":443"; ma=86400\` response headers
- Monitor fallback rates and 0-RTT replay protection`,
        category: "Web & Software",
        tags: ["HTTP3", "QUIC", "Networking", "Architecture"],
        published: true,
        featured: true,
        views: 1420,
        likes: 84,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 3)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 3)),
    },
    {
        id: "post-in-memory-caches",
        title: "Designing High-Throughput In-Memory Caches",
        slug: "designing-high-throughput-caches",
        excerpt: "Cache stampede mitigation, TTL jittering, and two-tier Redis synchronization strategies in distributed systems.",
        content: `## Mitigating Cache Stampedes

When an essential cache key expires under thousands of concurrent requests, backends often collapse under the sudden stampede.

### Probabilistic Early Expiration (XFetch)
Instead of waiting for strict TTL expiration, compute probabilistic background recomputation:

\`\`\`typescript
function shouldRefreshEarly(ttl: number, delta: number, beta = 1.0): boolean {
    const random = Math.random();
    return -delta * beta * Math.log(random) >= ttl;
}
\`\`\`

This guarantees zero latency spikes and steady backend resource utilization.`,
        category: "Cloud & Data",
        tags: ["Redis", "Caching", "Distributed Systems", "Performance"],
        published: true,
        featured: false,
        views: 950,
        likes: 62,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 7)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 7)),
    },
    {
        id: "post-agentic-workflows",
        title: "Deterministic Agentic Workflows in Engineering Pipelines",
        slug: "deterministic-agentic-workflows",
        excerpt: "Moving beyond naive prompt chaining: how reactive wakeups and typed tool schemas create reliable developer agent systems.",
        content: `## The Architecture of Autonomous Coding Agents

Agent systems that rely solely on free-form prompt cascades tend to accumulate hallucination errors over multi-step workflows.

### Structured Tool Execution
By constraining agent actions to strictly typed schemas and isolated workspaces, we achieve verifiable transitions between architectural plan and code implementation.`,
        category: "Artificial Intelligence",
        tags: ["Agents", "LLMs", "DevTools", "AI"],
        published: true,
        featured: false,
        views: 610,
        likes: 42,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 12)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000 * 12)),
    },
];

async function seed() {
    console.log("🌱 Seeding Firebase Firestore Emulator (127.0.0.1:8080) with Admin privileges...");

    for (const post of SEED_POSTS) {
        const { id, ...data } = post;
        await db.collection("blog").doc(id).set(data);
        console.log(`  ✓ Created article: "${post.title}" (/blog/${post.slug})`);
    }

    await db.collection("config").doc("site").set({
        siteTitle: "Keerthi Raajan | Personal Blog",
        author: "Keerthi Raajan K M",
        tagline: "Technology, Software & Everyday Insights",
        bio: "Writing about modern tech, how software works behind the scenes, and practical lessons from building digital products.",
        github: "https://github.com/kmkrofficial",
        linkedin: "https://linkedin.com/in/keerthiraajan",
        updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log("  ✓ Created site configuration document (config/site)");

    // Also seed a default admin user into the Auth emulator
    try {
        const auth = admin.auth();
        const testEmail = "kmkrworks@gmail.com";
        try {
            await auth.getUserByEmail(testEmail);
            console.log(`  ✓ Test admin user already exists: ${testEmail}`);
        } catch {
            await auth.createUser({
                email: testEmail,
                emailVerified: true,
                displayName: "Keerthi Raajan",
                password: "password123",
            });
            console.log(`  ✓ Created test admin user: ${testEmail} (password: password123)`);
        }
    } catch (authErr) {
        console.warn("  ℹ Auth emulator user note:", authErr instanceof Error ? authErr.message : authErr);
    }

    console.log("\n✨ Seed completed successfully!");
    console.log("📊 Firestore Emulator: http://127.0.0.1:8080");
    console.log("🖥️  Emulator UI:        http://127.0.0.1:4000");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
