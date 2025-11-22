const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '..', 'service-account.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

/**
 * Set admin custom claim on a user
 * Usage: node scripts/set-admin-claim.js EMAIL@gmail.com
 */
async function setAdminClaim(email) {
    try {
        // Get user by email
        const user = await admin.auth().getUserByEmail(email);

        // Set custom claim
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        console.log(`\n✅ Admin claim set successfully for ${email}`);
        console.log(`🔐 User now has administrator access`);
        console.log(`\nIMPORTANT: User must sign out and sign in again for changes to take effect!\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error setting admin claim:\n');

        if (error.code === 'auth/user-not-found') {
            console.error(`User with email "${email}" not found.`);
            console.error(`Make sure the user has signed in to your app at least once.\n`);
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
    console.log('Usage: node scripts/set-admin-claim.js EMAIL@gmail.com');
    console.log('Example: node scripts/set-admin-claim.js john.doe@gmail.com\n');
    process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error('\n❌ Error: Invalid email format\n');
    process.exit(1);
}

console.log(`\n🔧 Setting admin claim for: ${email}...`);
setAdminClaim(email);
