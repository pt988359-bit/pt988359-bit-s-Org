/**
 * Enterprise Architecture - Single Aggregate Cost Sheet Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { ProductCostSheet } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const COST_SHEETS_KEY = FIRESTORE_COLLECTIONS.COST_SHEETS;

export class CostSheetRepository extends BaseRepository<ProductCostSheet & { id: string }> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(COST_SHEETS_KEY, storage);
  }

  public getByProductId(productId: string): ProductCostSheet | null {
    const sheets = this.getAll();
    return sheets.find((s) => s.productId === productId) || null;
  }

  public saveSheet(sheet: ProductCostSheet): void {
    const itemToSave = {
      ...sheet,
      id: sheet.productId,
    };
    this.save(itemToSave);
  }
}

export const defaultCostSheetRepository = new CostSheetRepository();
