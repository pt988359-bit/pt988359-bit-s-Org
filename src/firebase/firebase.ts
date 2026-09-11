import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';
import { LoggerService } from '../core/services/LoggerService';

let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    LoggerService.info('Firebase', `App initialized successfully for project ${firebaseConfig.projectId}`);
  } else {
    app = getApp();
  }
} catch (error) {
  LoggerService.warn('Firebase', 'Failed to initialize Firebase App', error);
  app = getApps()[0] as FirebaseApp;
}

export { app };
