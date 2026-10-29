/**
 * Enterprise Architecture - Single Aggregate Financial Alert Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { FinancialAlert } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const ALERTS_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_ALERTS;

export class FinancialAlertRepository extends BaseRepository<FinancialAlert> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(ALERTS_KEY, storage);
  }

  public getUnacknowledgedAlerts(): FinancialAlert[] {
    return this.query((a) => !a.isAcknowledged);
  }
}

export const defaultFinancialAlertRepository = new FinancialAlertRepository();
