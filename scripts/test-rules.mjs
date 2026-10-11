/**
 * Security rules tests for firestore.rules and storage.rules.
 * Run with: npm run test:rules  (starts the Firestore + Storage emulators)
 */
import { readFileSync } from "node:fs";
import { after, before, beforeEach, describe, test } from "node:test";
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

let env;

const validPost = {
    title: "Hello",
    slug: "hello-world",
    content: "Body",
    category: "Web & Software",
    tags: [],
    published: true,
    featured: false,
    likes: 0,
};

const adminCtx = () => env.authenticatedContext("admin-uid", { admin: true }).firestore();
const userCtx = () => env.authenticatedContext("user-uid").firestore();
const anonCtx = () => env.unauthenticatedContext().firestore();

const adminStorage = () => env.authenticatedContext("admin-uid", { admin: true }).storage();
const userStorage = () => env.authenticatedContext("user-uid").storage();
const anonStorage = () => env.unauthenticatedContext().storage();

const bytes = (size) => new Uint8Array(size);

before(async () => {
    env = await initializeTestEnvironment({
        projectId: "demo-signature-rules",
        firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
        storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
    });
});

after(async () => {
    await env?.cleanup();
});

beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await db.doc("blog/published").set(validPost);
        await db.doc("blog/draft").set({ ...validPost, slug: "draft", published: false });
        await db.doc("config/site").set({ siteTitle: "Signature" });
        await ctx.storage().ref("media/existing.png").put(bytes(10), { contentType: "image/png" });
    });
});

describe("firestore: blog", () => {
    test("anyone can read a published post", () => assertSucceeds(anonCtx().doc("blog/published").get()));
    test("anonymous cannot read a draft", () => assertFails(anonCtx().doc("blog/draft").get()));
    test("signed-in non-admin cannot read a draft", () => assertFails(userCtx().doc("blog/draft").get()));
    test("admin can read a draft", () => assertSucceeds(adminCtx().doc("blog/draft").get()));

    test("anonymous list must filter on published", async () => {
        await assertFails(anonCtx().collection("blog").get());
        await assertSucceeds(anonCtx().collection("blog").where("published", "==", true).get());
    });

    test("anonymous cannot change likes", () =>
        assertFails(anonCtx().doc("blog/published").update({ likes: 999 })));
    test("signed-in non-admin cannot create a post", () =>
        assertFails(userCtx().doc("blog/new").set(validPost)));
    test("signed-in non-admin cannot delete a post", () =>
        assertFails(userCtx().doc("blog/published").delete()));

    test("admin can create a valid post", () => assertSucceeds(adminCtx().doc("blog/new").set(validPost)));
    test("admin cannot create a post with an invalid slug", () =>
        assertFails(adminCtx().doc("blog/bad").set({ ...validPost, slug: "<script>" })));
    test("admin cannot create a post with an unknown category", () =>
        assertFails(adminCtx().doc("blog/bad").set({ ...validPost, category: "Spam" })));
    test("admin can delete a post", () => assertSucceeds(adminCtx().doc("blog/published").delete()));

    test("likers are server-only, even for admins", async () => {
        await assertFails(adminCtx().doc("blog/published/likers/abc").set({ x: 1 }));
        await assertFails(anonCtx().doc("blog/published/likers/abc").get());
    });
});

describe("firestore: config and unknown collections", () => {
    test("anyone can read site config", () => assertSucceeds(anonCtx().doc("config/site").get()));
    test("signed-in non-admin cannot write config", () =>
        assertFails(userCtx().doc("config/site").set({ siteTitle: "Hacked" })));
    test("admin can write config", () =>
        assertSucceeds(adminCtx().doc("config/site").set({ siteTitle: "Updated" })));
    test("unknown collections are denied", async () => {
        await assertFails(adminCtx().doc("messages/x").get());
        await assertFails(userCtx().doc("skills/x").set({ a: 1 }));
    });
});

describe("firestore: version history", () => {
    // Saved versions are the studio's own safety net: admin only, and never readable alongside a public post.
    const revision = { title: "Hello", content: "Older text", reason: "draft" };

    beforeEach(async () => {
        await env.withSecurityRulesDisabled((ctx) =>
            ctx.firestore().doc("blog/published/revisions/r1").set(revision)
        );
    });

    test("anonymous cannot read a revision of a published post", () =>
        assertFails(anonCtx().doc("blog/published/revisions/r1").get()));
    test("signed-in non-admin cannot read or list revisions", async () => {
        await assertFails(userCtx().doc("blog/published/revisions/r1").get());
        await assertFails(userCtx().collection("blog/published/revisions").get());
    });
    test("signed-in non-admin cannot write a revision", () =>
        assertFails(userCtx().doc("blog/published/revisions/r2").set(revision)));
    test("admin can read, write and delete revisions", async () => {
        await assertSucceeds(adminCtx().doc("blog/published/revisions/r1").get());
        await assertSucceeds(adminCtx().doc("blog/published/revisions/r2").set(revision));
        await assertSucceeds(adminCtx().doc("blog/published/revisions/r2").delete());
    });
});

describe("firestore: draft preview links", () => {
    // Links are created and resolved by the server (Admin SDK) only; no client may read or write them,
    // not even an admin, so a leaked web config can never enumerate or forge review links.
    const link = { postId: "draft", kind: "share", revoked: false, views: 0, sessionHashes: [] };

    beforeEach(async () => {
        await env.withSecurityRulesDisabled((ctx) => ctx.firestore().doc("previews/abc").set(link));
    });

    test("anonymous cannot read a link", () => assertFails(anonCtx().doc("previews/abc").get()));
    test("signed-in non-admin cannot read a link", () => assertFails(userCtx().doc("previews/abc").get()));
    test("admin cannot read a link from the browser", () => assertFails(adminCtx().doc("previews/abc").get()));
    test("nobody can list links", async () => {
        await assertFails(anonCtx().collection("previews").get());
        await assertFails(adminCtx().collection("previews").get());
    });
    test("admin cannot create or revive a link from the browser", async () => {
        await assertFails(adminCtx().doc("previews/new").set(link));
        await assertFails(adminCtx().doc("previews/abc").update({ revoked: false, expiresAt: new Date() }));
    });
    test("a draft stays unreadable without a link", () => assertFails(anonCtx().doc("blog/draft").get()));
});

describe("storage", () => {
    test("anyone can fetch a file", () => assertSucceeds(anonStorage().ref("media/existing.png").getMetadata()));
    test("anonymous cannot list files", () => assertFails(anonStorage().ref("media").listAll()));
    test("admin can list files", () => assertSucceeds(adminStorage().ref("media").listAll()));

    test("anonymous cannot upload", () =>
        assertFails(anonStorage().ref("media/a.png").put(bytes(10), { contentType: "image/png" })));
    test("signed-in non-admin cannot upload", () =>
        assertFails(userStorage().ref("media/a.png").put(bytes(10), { contentType: "image/png" })));
    test("admin can upload a raster image", () =>
        assertSucceeds(adminStorage().ref("media/a.webp").put(bytes(10), { contentType: "image/webp" })));
    test("admin cannot upload SVG", () =>
        assertFails(adminStorage().ref("media/a.svg").put(bytes(10), { contentType: "image/svg+xml" })));
    test("admin cannot upload HTML", () =>
        assertFails(adminStorage().ref("media/a.html").put(bytes(10), { contentType: "text/html" })));
    test("admin cannot upload files of 5 MB or more", () =>
        assertFails(adminStorage().ref("media/big.png").put(bytes(5 * 1024 * 1024), { contentType: "image/png" })));
});
