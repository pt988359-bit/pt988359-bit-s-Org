import { getAdminDb } from '../src/server/firebaseAdmin.js';
import { ADMIN_FIREBASE_UID, ADMIN_EMAIL } from '../src/server/adminSessionConfig.js';

/**
 * Secure Server Script: Initialize /admins/{ADMIN_FIREBASE_UID}
 * 
 * Uses Firebase Admin SDK ONLY (isolated backend script, never exposed to client).
 * Ensures the master administrator document exists with verified role and permissions,
 * satisfying Firestore Security Rules `isAdmin()` helper check:
 * `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`
 */
export async function initializeAdminDocument(): Promise<void> {
  console.log(`🔒 Initializing Admin Document for UID: ${ADMIN_FIREBASE_UID}...`);

  try {
    const db = getAdminDb();
    const adminDocRef = db.collection('admins').doc(ADMIN_FIREBASE_UID);
    const docSnap = await adminDocRef.get();

    const adminData = {
      uid: ADMIN_FIREBASE_UID,
      email: ADMIN_EMAIL,
      role: 'superadmin',
      name: 'PRO TECK Showroom Master Admin',
      status: 'active',
      permissions: ['*'],
      createdAt: docSnap.exists ? docSnap.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      isProtectedSystemAdmin: true,
    };

    await adminDocRef.set(adminData, { merge: true });
    console.log(`✅ Admin Document /admins/${ADMIN_FIREBASE_UID} securely provisioned & verified.`);
  } catch (error: any) {
    console.error(`❌ Failed to initialize admin document /admins/${ADMIN_FIREBASE_UID}:`, error);
    throw error;
  }
}

// Execute if called directly
if (process.argv[1]?.endsWith('initAdminDoc.ts') || process.argv[1]?.endsWith('initAdminDoc.js')) {
  initializeAdminDocument()
    .then(() => {
      console.log('🎉 Admin initialization completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
