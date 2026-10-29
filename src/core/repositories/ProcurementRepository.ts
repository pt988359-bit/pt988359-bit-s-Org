/**
 * Enterprise Architecture - Single Aggregate Procurement Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { ProcurementItem } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const PROCUREMENT_KEY = FIRESTORE_COLLECTIONS.PROCUREMENT;

export class ProcurementRepository extends BaseRepository<ProcurementItem> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(PROCUREMENT_KEY, storage);
  }

  public getActiveProcurements(): ProcurementItem[] {
    return this.query((item) => !item.isArchived);
  }
}

export const defaultProcurementRepository = new ProcurementRepository();
