/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes Firebase Admin SDK for server-side operations
 * including user verification, database access, and token validation.
 * 
 * Supports multiple credential sources:
 * 1. serviceAccountKey.json file in project root
 * 2. FIREBASE_SERVICE_ACCOUNT env var (JSON string)
 * 3. Individual env vars (FIREBASE_PROJECT_ID, etc.)
 * 4. Falls back to mock mode for development without credentials
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app;
let isInitialized = false;
let isMockMode = false;

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // Try to load service account from file or environment variable
  let serviceAccount = null;
  const serviceAccountPath = join(__dirname, '../../serviceAccountKey.json');
  
  if (existsSync(serviceAccountPath)) {
    try {
      const fileContent = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
      console.log('📁 Loaded Firebase credentials from serviceAccountKey.json');
    } catch (error) {
      console.warn('⚠️  Failed to parse serviceAccountKey.json:', error.message);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('🔑 Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT env');
    } catch (error) {
      console.warn('⚠️  Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables for each field
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'key-id',
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
    };
    console.log('🔑 Loaded Firebase credentials from individual env vars');
  }

  if (serviceAccount && serviceAccount.project_id) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      isInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`   Project: ${serviceAccount.project_id}`);
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      isMockMode = true;
    }
  } else {
    console.warn('⚠️  No Firebase credentials found. Running in mock mode.');
    console.warn('   To enable Firebase features, add serviceAccountKey.json or set environment variables.');
    isMockMode = true;
  }

  return app;
};

// Initialize immediately
initializeFirebaseAdmin();

// Create mock implementations for development without Firebase
const createMockFirestore = () => ({
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    }),
    get: async () => ({ empty: true, docs: [], forEach: () => {} }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({
      get: async () => ({ empty: true, docs: [], forEach: () => {} }),
      where: function() { return this; },
      orderBy: function() { return this; },
      limit: function() { return this; }
    })
  })
});

const createMockAuth = () => ({
  verifyIdToken: async () => { throw new Error('Mock mode: Token verification not available'); },
  getUser: async () => { throw new Error('Mock mode: User lookup not available'); },
  createUser: async () => ({ uid: 'mock-uid' })
});

// Export Firestore and Auth references (use mock if not initialized)
export const adminDb = isInitialized ? admin.firestore() : createMockFirestore();
export const adminAuth = isInitialized ? admin.auth() : createMockAuth();
export const isFirebaseInitialized = () => isInitialized;
export const isFirebaseMockMode = () => isMockMode;
export default admin;
