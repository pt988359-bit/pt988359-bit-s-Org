/**
 * Enterprise Architecture - Single Aggregate Expense Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { ExpenseItem } from '../../types/adminFinance';

const EXPENSES_KEY = 'proteck_admin_expenses_v1';

export class ExpenseRepository extends BaseRepository<ExpenseItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
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
