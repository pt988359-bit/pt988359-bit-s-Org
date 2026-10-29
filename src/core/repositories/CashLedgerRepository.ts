/**
 * Enterprise Architecture - Single Aggregate Cash Ledger Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { CashLedgerEntry } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const CASH_LEDGER_KEY = FIRESTORE_COLLECTIONS.CASH_LEDGERS;

export class CashLedgerRepository extends BaseRepository<CashLedgerEntry> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(CASH_LEDGER_KEY, storage);
  }

  public getActiveEntries(): CashLedgerEntry[] {
    return this.query((item) => !item.isArchived);
  }

  public getLatestRunningBalance(): number {
    const entries = this.getActiveEntries()
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return entries.length > 0 ? entries[0].runningBalance : 0;
  }
}

export const defaultCashLedgerRepository = new CashLedgerRepository();
