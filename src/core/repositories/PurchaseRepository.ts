/**
 * Enterprise Architecture - Single Aggregate Purchase History Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { AppliancePurchaseRecord } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const PURCHASE_HISTORY_KEY = FIRESTORE_COLLECTIONS.PURCHASE_HISTORY;

export class PurchaseRepository extends BaseRepository<AppliancePurchaseRecord> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(PURCHASE_HISTORY_KEY, storage);
  }
}

export const defaultPurchaseRepository = new PurchaseRepository();
