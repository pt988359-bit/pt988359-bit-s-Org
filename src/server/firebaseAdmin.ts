import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp() {
  if (!adminApp) {
    try {
      if (getApps().length === 0) {
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId;
        adminApp = initializeApp({
          projectId: projectId,
        });
      } else {
        adminApp = getApp();
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('[FirebaseAdmin] Firebase Admin initialization failed:', errMsg);
      throw new Error(`Firebase Admin initialization failed: ${errMsg}`);
    }
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    try {
      const app = getAdminApp();
      // The user's firestore database id is specified in firebase-applet-config.json
      // (e.g. 'ai-studio-proteck-f11aa4ca-9bc5-40c4-a06f-9a11f191c8e8')
      // Do not allow generic 'default' environment variable to override real named database
      let dbId = firebaseConfigJson.firestoreDatabaseId;
      if (!dbId || dbId.trim() === '' || dbId === '(default)' || dbId === 'default') {
        const envDbId = process.env.VITE_FIREBASE_DATABASE_ID;
        if (envDbId && envDbId.trim() !== '' && envDbId !== '(default)' && envDbId !== 'default') {
          dbId = envDbId.trim();
        } else {
          dbId = undefined;
        }
      }

      if (dbId) {
        adminDb = getFirestore(app, dbId.trim());
      } else {
        adminDb = getFirestore(app);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('[FirebaseAdmin] Firebase Admin Firestore initialization failed:', errMsg);
      throw new Error(`Firebase Admin Firestore initialization failed: ${errMsg}`);
    }
  }
  return adminDb;
}

export function getAdminDbSafe(): Firestore | null {
  try {
    return getAdminDb();
  } catch (err) {
    console.warn('[FirebaseAdmin] Firestore Admin safe init notice:', err);
    return null;
  }
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    try {
      const app = getAdminApp();
      adminAuth = getAuth(app);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error('[FirebaseAdmin] Firebase Admin Auth initialization failed:', errMsg);
      throw new Error(`Firebase Admin Auth initialization failed: ${errMsg}`);
    }
  }
  return adminAuth;
}
