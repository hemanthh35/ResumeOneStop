/**
 * Admin User Seed Script
 * 
 * Creates an admin user in Firebase for testing the Admin Dashboard.
 * 
 * Usage: 
 *   cd placement-backend
 *   node scripts/seedAdmin.js
 */

import { adminDb, adminAuth } from '../src/config/firebase-admin.js';

// Admin credentials
const adminUser = {
    email: 'admin@placementpro.edu',
    password: 'Admin@123',  // Change this in production!
    displayName: 'System Administrator'
};

async function createAdminUser() {
    console.log('🔐 Creating Admin User...\n');

    try {
        // Check if admin already exists in Firestore
        const existingAdmin = await adminDb.collection('users').where('role', '==', 'admin').get();

        if (!existingAdmin.empty) {
            console.log('⚠️  Admin user already exists!');
            existingAdmin.forEach(doc => {
                const data = doc.data();
                console.log(`\n📧 Email: ${data.email}`);
                console.log(`👤 Name: ${data.name || data.displayName}`);
                console.log(`🔑 Password: (Use the password you set during signup, or reset it)`);
            });
            process.exit(0);
        }

        // Try to create Firebase Auth user
        let uid;
        try {
            const userRecord = await adminAuth.createUser({
                email: adminUser.email,
                password: adminUser.password,
                displayName: adminUser.displayName,
                emailVerified: true
            });
            uid = userRecord.uid;
            console.log(`✅ Firebase Auth user created: ${uid}`);
        } catch (authError) {
            if (authError.code === 'auth/email-already-exists') {
                // User exists in Auth, get their UID
                const existingUser = await adminAuth.getUserByEmail(adminUser.email);
                uid = existingUser.uid;
                console.log(`ℹ️  Auth user already exists, using UID: ${uid}`);
            } else {
                throw authError;
            }
        }

        // Create/update Firestore user document with admin role
        await adminDb.collection('users').doc(uid).set({
            email: adminUser.email,
            name: adminUser.displayName,
            role: 'admin',
            department: 'IT Administration',
            designation: 'System Administrator',
            active: true,
            createdAt: new Date().toISOString(),
            permissions: ['manage_users', 'manage_drives', 'manage_students', 'view_analytics', 'system_settings']
        });

        console.log('✅ Firestore user document created with admin role');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('\n📧 Email:    ' + adminUser.email);
        console.log('🔑 Password: ' + adminUser.password);
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin user:', error);
        process.exit(1);
    }
}

// Run
createAdminUser();
