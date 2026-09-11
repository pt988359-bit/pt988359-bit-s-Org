import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

let adminApp: ReturnType<typeof initializeApp> | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp() {
  if (!adminApp) {
    if (getApps().length === 0) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId;
      adminApp = initializeApp({
        projectId: projectId,
      });
    } else {
      adminApp = getApp();
    }
  }
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    const dbId = process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;
    if (dbId && dbId.trim() !== '' && dbId !== '(default)') {
      adminDb = getFirestore(app, dbId.trim());
    } else {
      adminDb = getFirestore(app);
    }
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const app = getAdminApp();
    adminAuth = getAuth(app);
  }
  return adminAuth;
}
