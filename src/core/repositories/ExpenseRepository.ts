/**
 * Enterprise Architecture - Single Aggregate Expense Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { ExpenseItem } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const EXPENSES_KEY = FIRESTORE_COLLECTIONS.EXPENSES;

export class ExpenseRepository extends BaseRepository<ExpenseItem> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(EXPENSES_KEY, storage);
  }

  public getActiveExpenses(): ExpenseItem[] {
    return this.query((item) => !item.isArchived);
  }

  public getExpensesByCategory(category: string): ExpenseItem[] {
    return this.query((item) => item.category === category && !item.isArchived);
  }

  public getExpensesByProduct(productId: string): ExpenseItem[] {
    return this.query((item) => item.relatedProductId === productId && !item.isArchived);
  }
}

export const defaultExpenseRepository = new ExpenseRepository();
