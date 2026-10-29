/**
 * Enterprise Architecture - Single Aggregate Supplier Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { SupplierRecord } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const SUPPLIERS_KEY = FIRESTORE_COLLECTIONS.SUPPLIERS;

export class SupplierRepository extends BaseRepository<SupplierRecord> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(SUPPLIERS_KEY, storage);
  }

  public getActiveSuppliers(): SupplierRecord[] {
    return this.query((item) => !item.isArchived);
  }
}

export const defaultSupplierRepository = new SupplierRepository();
