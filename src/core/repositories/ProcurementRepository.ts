/**
 * Enterprise Architecture - Single Aggregate Procurement Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { ProcurementItem } from '../../types/adminFinance';

const PROCUREMENT_KEY = 'proteck_admin_procurement_v1';

export class ProcurementRepository extends BaseRepository<ProcurementItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(PROCUREMENT_KEY, storage);
  }

  public getActiveProcurements(): ProcurementItem[] {
    return this.query((item) => !item.isArchived);
  }
}

export const defaultProcurementRepository = new ProcurementRepository();
