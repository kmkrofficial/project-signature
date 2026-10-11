/**
 * Tests for the admin allowlist (src/lib/admin-access.ts) against the Firebase Auth emulator.
 * Run with: npm run test:admin-access  (starts the Auth emulator)
 */
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { grantAdminIfAllowed, parseAdminEmails } from "../src/lib/admin-access.ts";

const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!host) throw new Error("FIREBASE_AUTH_EMULATOR_HOST is not set; run this through `npm run test:admin-access`.");

const projectId = process.env.GCLOUD_PROJECT || "demo-signature-admin";
const run = Math.random().toString(36).slice(2, 8);
let app;
let auth;

async function emulatorCall(path, body) {
    const res = await fetch(`http://${host}/identitytoolkit.googleapis.com/v1/${path}?key=fake-api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    assert.ok(res.ok, `emulator ${path} failed: ${JSON.stringify(data)}`);
    return data;
}

/** Signs in with a fake Google identity; the emulator accepts an unsigned JSON id_token. */
function signInWithGoogle(email, { verified = true, sub = `sub-${email}` } = {}) {
    const idToken = JSON.stringify({ sub, email, email_verified: verified });
    return emulatorCall("accounts:signInWithIdp", {
        requestUri: "http://localhost",
        returnSecureToken: true,
        postBody: `id_token=${encodeURIComponent(idToken)}&providerId=google.com`,
    });
}

const owner = `Owner-${run}@Example.com`;
const allowed = [owner.toLowerCase(), `second-${run}@example.com`];

before(() => {
    app = initializeApp({ projectId }, `admin-access-${run}`);
    auth = getAuth(app);
});

after(() => deleteApp(app));

describe("parseAdminEmails", () => {
    test("splits on commas, semicolons and whitespace, lower-cases and drops blanks", () => {
        assert.deepEqual(parseAdminEmails(" A@x.com, b@X.com;;c@x.com\n d@x.com "), ["a@x.com", "b@x.com", "c@x.com", "d@x.com"]);
    });

    test("returns an empty list for missing or blank input", () => {
        assert.deepEqual(parseAdminEmails(undefined), []);
        assert.deepEqual(parseAdminEmails("  ,; "), []);
    });
});

describe("grantAdminIfAllowed", () => {
    test("grants the claim to an allowlisted, verified Google account (case-insensitive)", async () => {
        const session = await signInWithGoogle(owner);
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, allowed), "granted");

        const refreshed = await signInWithGoogle(owner);
        const decoded = await auth.verifyIdToken(refreshed.idToken);
        assert.equal(decoded.admin, true);
    });

    test("reports 'already' once the claim exists", async () => {
        const session = await signInWithGoogle(owner);
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, allowed), "already");
    });

    test("keeps other custom claims when granting", async () => {
        const email = `second-${run}@example.com`;
        const session = await signInWithGoogle(email);
        await auth.setCustomUserClaims(session.localId, { role: "editor" });

        const withRole = await signInWithGoogle(email);
        assert.equal(await grantAdminIfAllowed(auth, withRole.idToken, allowed), "granted");
        assert.deepEqual((await auth.getUser(session.localId)).customClaims, { role: "editor", admin: true });
    });

    test("denies a Google account that is not on the list", async () => {
        const session = await signInWithGoogle(`stranger-${run}@example.com`);
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, allowed), "denied");
        assert.equal((await auth.getUser(session.localId)).customClaims?.admin, undefined);
    });

    test("denies an allowlisted email that Google has not verified", async () => {
        const email = `unverified-${run}@example.com`;
        const session = await signInWithGoogle(email, { verified: false });
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, [email]), "denied");
        assert.equal((await auth.getUser(session.localId)).customClaims?.admin, undefined);
    });

    test("denies an allowlisted email that signed in with a password instead of Google", async () => {
        const email = `password-${run}@example.com`;
        const session = await emulatorCall("accounts:signUp", { email, password: "Passw0rd!x", returnSecureToken: true });
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, [email]), "denied");
        assert.equal((await auth.getUser(session.localId)).customClaims?.admin, undefined);
    });

    test("denies everyone when the allowlist is empty", async () => {
        const session = await signInWithGoogle(owner);
        assert.equal(await grantAdminIfAllowed(auth, session.idToken, []), "denied");
    });

    test("reports 'unavailable' for a token that cannot be verified", async () => {
        assert.equal(await grantAdminIfAllowed(auth, "not-a-real-token", allowed), "unavailable");
    });
});
