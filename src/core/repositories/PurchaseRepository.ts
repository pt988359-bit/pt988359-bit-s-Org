/**
 * Enterprise Architecture - Single Aggregate Purchase History Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { AppliancePurchaseRecord } from '../../types/adminFinance';

const PURCHASE_HISTORY_KEY = 'proteck_admin_purchase_history_v1';

export class PurchaseRepository extends BaseRepository<AppliancePurchaseRecord> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(PURCHASE_HISTORY_KEY, storage);
  }
}

export const defaultPurchaseRepository = new PurchaseRepository();
