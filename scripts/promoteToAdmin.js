/**
 * Promote User to Admin Script
 * 
 * This script promotes an existing user to admin role.
 * The user must already exist in Firebase Auth (created via Signup page).
 * 
 * Usage: 
 *   cd placement-backend
 *   node scripts/promoteToAdmin.js your.email@domain.com
 */

import { adminDb, adminAuth } from '../src/config/firebase-admin.js';

async function promoteToAdmin(email) {
    if (!email) {
        console.log('❌ Usage: node scripts/promoteToAdmin.js <email>');
        console.log('   Example: node scripts/promoteToAdmin.js admin@college.edu');
        process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}\n`);

    try {
        // Get user from Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
            console.log(`✅ Found user in Firebase Auth: ${userRecord.uid}`);
        } catch (authError) {
            console.log(`❌ User not found in Firebase Auth.`);
            console.log(`\n💡 Please sign up first via the app, then run this script.`);
            console.log(`   1. Go to /signup`);
            console.log(`   2. Create account with email: ${email}`);
            console.log(`   3. Run this script again`);
            process.exit(1);
        }

        // Update role in Firestore to admin
        const userDocRef = adminDb.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            // Update existing document
            await userDocRef.update({
                role: 'admin',
                updatedAt: new Date().toISOString(),
                permissions: ['manage_users', 'manage_drives', 'manage_students', 'view_analytics', 'system_settings']
            });
            console.log(`✅ Updated existing user document to admin role`);
        } else {
            // Create new document
            await userDocRef.set({
                email: email,
                role: 'admin',
                name: userRecord.displayName || 'Admin User',
                active: true,
                createdAt: new Date().toISOString(),
                permissions: ['manage_users', 'manage_drives', 'manage_students', 'view_analytics', 'system_settings']
            });
            console.log(`✅ Created new user document with admin role`);
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 USER PROMOTED TO ADMIN SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log(`\n📧 Email: ${email}`);
        console.log(`🔑 Password: Use the password you set during signup`);
        console.log(`\n🚀 Login at /login and you'll be redirected to /admin/dashboard`);
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get email from command line args
const email = process.argv[2];
promoteToAdmin(email);
