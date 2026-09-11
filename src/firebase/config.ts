import firebaseConfigJson from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
  measurementId?: string;
}

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key] && process.env[key].trim() !== '') {
    return process.env[key].trim();
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[key];
      if (val && typeof val === 'string' && val.trim() !== '') {
        return val.trim();
      }
    }
  } catch {
    // Environment without import.meta
  }
  return undefined;
};

export const firebaseConfig: FirebaseAppConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || firebaseConfigJson.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfigJson.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfigJson.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfigJson.storageBucket || 'quadratic-infusion-gzp2g.firebasestorage.app',
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfigJson.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || firebaseConfigJson.appId,
  firestoreDatabaseId: getEnv('VITE_FIREBASE_DATABASE_ID') || firebaseConfigJson.firestoreDatabaseId,
};
