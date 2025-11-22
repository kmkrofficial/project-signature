const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '..', 'service-account.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

/**
 * Remove admin custom claim from a user
 * Usage: node scripts/remove-admin-claim.js EMAIL@gmail.com
 */
async function removeAdminClaim(email) {
    try {
        // Get user by email
        const user = await admin.auth().getUserByEmail(email);

        // Remove custom claim by setting it to null
        await admin.auth().setCustomUserClaims(user.uid, { admin: null });

        console.log(`\n✅ Admin claim removed successfully from ${email}`);
        console.log(`🔓 User no longer has administrator access`);
        console.log(`\nIMPORTANT: User must sign out and sign in again for changes to take effect!\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error removing admin claim:\n');

        if (error.code === 'auth/user-not-found') {
            console.error(`User with email "${email}" not found.`);
        } else {
            console.error(error.message);
        }

        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('\n❌ Error: Email address required\n');
    console.log('Usage: node scripts/remove-admin-claim.js EMAIL@gmail.com');
    console.log('Example: node scripts/remove-admin-claim.js john.doe@gmail.com\n');
    process.exit(1);
}

console.log(`\n🔧 Removing admin claim from: ${email}...`);
removeAdminClaim(email);
