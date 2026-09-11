/**
 * Enterprise Architecture - Single Aggregate Supplier Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { SupplierRecord } from '../../types/adminFinance';

const SUPPLIERS_KEY = 'proteck_admin_suppliers_v1';

export class SupplierRepository extends BaseRepository<SupplierRecord> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(SUPPLIERS_KEY, storage);
  }

  public getActiveSuppliers(): SupplierRecord[] {
    return this.query((item) => !item.isArchived);
  }
}

export const defaultSupplierRepository = new SupplierRepository();
