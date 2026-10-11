import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, '..', 'service-account.json');
if (!existsSync(serviceAccountPath)) {
    console.error(`\n❌ Error: service-account.json not found at: ${serviceAccountPath}\n`);
    process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
    credential: cert(serviceAccount)
});
const auth = getAuth(app);

/**
 * Remove admin custom claim from a user
 * Usage: node scripts/remove-admin-claim.mjs EMAIL@gmail.com
 */
async function removeAdminClaim(email) {
    try {
        const user = await auth.getUserByEmail(email);
        await auth.setCustomUserClaims(user.uid, { admin: null });

        console.log(`\n✅ Admin claim removed successfully from ${email}`);
        console.log(`🔓 User no longer has administrator access`);
        console.log(`\nIMPORTANT: User must sign out and sign in again for changes to take effect!\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error removing admin claim:\n');
        if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
            console.error(`User with email "${email}" not found.`);
        } else {
            console.error(error instanceof Error ? error.message : error);
        }
        process.exit(1);
    }
}

const email = process.argv[2];

if (!email) {
    console.error('\n❌ Error: Email address required\n');
    console.log('Usage: node scripts/remove-admin-claim.mjs EMAIL@gmail.com');
    console.log('Example: node scripts/remove-admin-claim.js john.doe@gmail.com\n');
    process.exit(1);
}

console.log(`\n🔧 Removing admin claim from: ${email}...`);
removeAdminClaim(email);
