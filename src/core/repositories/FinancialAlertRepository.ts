/**
 * Enterprise Architecture - Single Aggregate Financial Alert Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { FinancialAlert } from '../../types/adminFinance';

const ALERTS_KEY = 'proteck_admin_financial_alerts_v1';

export class FinancialAlertRepository extends BaseRepository<FinancialAlert> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(ALERTS_KEY, storage);
  }

  public getUnacknowledgedAlerts(): FinancialAlert[] {
    return this.query((a) => !a.isAcknowledged);
  }
}

export const defaultFinancialAlertRepository = new FinancialAlertRepository();
