/**
 * Enterprise Architecture - Single Aggregate Cash Ledger Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { CashLedgerEntry } from '../../types/adminFinance';

const CASH_LEDGER_KEY = 'proteck_admin_cash_ledger_v1';

export class CashLedgerRepository extends BaseRepository<CashLedgerEntry> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(CASH_LEDGER_KEY, storage);
  }

  public getActiveEntries(): CashLedgerEntry[] {
    return this.query((item) => !item.isArchived);
  }

  public getLatestRunningBalance(): number {
    const entries = this.getActiveEntries();
    return entries.length > 0 ? entries[0].runningBalance : 0;
  }
}

export const defaultCashLedgerRepository = new CashLedgerRepository();
