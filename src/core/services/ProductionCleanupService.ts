import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';
import { LoggerService } from './LoggerService';

export interface CleanupResult {
  collection: string;
  deletedCount: number;
  success: boolean;
}

/**
 * Enterprise Production Cleanup Service
 * Allows showroom owners to remove demo/test/sample data cleanly before full launch.
 */
export class ProductionCleanupService {
  /**
   * Deletes all demo/sample products marked with `isDemo: true` or internal test codes.
   */
  static async cleanupDemoProducts(): Promise<CleanupResult> {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.PRODUCTS);
      const snap = await getDocs(colRef);
      let deletedCount = 0;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.isDemo === true || data.title?.includes('تجريبي') || data.internalCode?.includes('TEST')) {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.PRODUCTS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} demo products.`);
      return { collection: FIRESTORE_COLLECTIONS.PRODUCTS, deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupDemoProducts failed', error);
      return { collection: FIRESTORE_COLLECTIONS.PRODUCTS, deletedCount: 0, success: false };
    }
  }

  /**
   * Deletes test customers (e.g., phone starting with 000 or marked isTest).
   */
  static async cleanupTestCustomers(): Promise<CleanupResult> {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.CUSTOMERS);
      const snap = await getDocs(colRef);
      let deletedCount = 0;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (
          data.isTest === true ||
          data.phone === '01000000000' ||
          data.name?.includes('تجريبي') ||
          data.email?.endsWith('@example.com')
        ) {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.CUSTOMERS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} test customers.`);
      return { collection: FIRESTORE_COLLECTIONS.CUSTOMERS, deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupTestCustomers failed', error);
      return { collection: FIRESTORE_COLLECTIONS.CUSTOMERS, deletedCount: 0, success: false };
    }
  }

  /**
   * Deletes fake reservations created for demo purposes.
   */
  static async cleanupFakeReservations(): Promise<CleanupResult> {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.RESERVATIONS);
      const snap = await getDocs(colRef);
      let deletedCount = 0;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.isDemo === true || data.customerPhone === '01000000000' || data.customerName?.includes('تجريبي')) {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.RESERVATIONS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} fake reservations.`);
      return { collection: FIRESTORE_COLLECTIONS.RESERVATIONS, deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupFakeReservations failed', error);
      return { collection: FIRESTORE_COLLECTIONS.RESERVATIONS, deletedCount: 0, success: false };
    }
  }

  /**
   * Deletes dummy exchange and sell requests.
   */
  static async cleanupDummyRequests(): Promise<CleanupResult> {
    try {
      let deletedCount = 0;

      const sellRef = collection(db, FIRESTORE_COLLECTIONS.SELL_REQUESTS);
      const sellSnap = await getDocs(sellRef);
      const batch = writeBatch(db);

      sellSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.isDemo === true || data.customerPhone === '01000000000') {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.SELL_REQUESTS, d.id));
          deletedCount++;
        }
      });

      const exchangeRef = collection(db, FIRESTORE_COLLECTIONS.EXCHANGE_REQUESTS);
      const exSnap = await getDocs(exchangeRef);
      exSnap.docs.forEach((d) => {
        const data = d.data();
        if (data.isDemo === true || data.customerPhone === '01000000000') {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.EXCHANGE_REQUESTS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} dummy requests.`);
      return { collection: 'requests', deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupDummyRequests failed', error);
      return { collection: 'requests', deletedCount: 0, success: false };
    }
  }

  /**
   * Deletes development and debug logs from audit_logs and auth_logs.
   */
  static async cleanupDevelopmentLogs(): Promise<CleanupResult> {
    try {
      let deletedCount = 0;
      const logsRef = collection(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS);
      const snap = await getDocs(logsRef);
      const batch = writeBatch(db);

      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.isDev === true || data.environment === 'development') {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} development logs.`);
      return { collection: FIRESTORE_COLLECTIONS.AUDIT_LOGS, deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupDevelopmentLogs failed', error);
      return { collection: FIRESTORE_COLLECTIONS.AUDIT_LOGS, deletedCount: 0, success: false };
    }
  }

  /**
   * Deletes sample system notifications.
   */
  static async cleanupSampleNotifications(): Promise<CleanupResult> {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS);
      const snap = await getDocs(colRef);
      let deletedCount = 0;

      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.isSample === true || data.title?.includes('تجريبي')) {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, d.id));
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      LoggerService.info('ProductionCleanupService', `Removed ${deletedCount} sample notifications.`);
      return { collection: FIRESTORE_COLLECTIONS.NOTIFICATIONS, deletedCount, success: true };
    } catch (error) {
      LoggerService.error('ProductionCleanupService', 'cleanupSampleNotifications failed', error);
      return { collection: FIRESTORE_COLLECTIONS.NOTIFICATIONS, deletedCount: 0, success: false };
    }
  }

  /**
   * Executes full production cleanup of all demo/test artifacts safely.
   */
  static async purgeAllDemoData(): Promise<CleanupResult[]> {
    LoggerService.info('ProductionCleanupService', 'Starting purge of all demo data...');
    const results: CleanupResult[] = [];

    results.push(await this.cleanupDemoProducts());
    results.push(await this.cleanupTestCustomers());
    results.push(await this.cleanupFakeReservations());
    results.push(await this.cleanupDummyRequests());
    results.push(await this.cleanupDevelopmentLogs());
    results.push(await this.cleanupSampleNotifications());

    LoggerService.info('ProductionCleanupService', 'Full demo data purge completed.');
    return results;
  }
}
