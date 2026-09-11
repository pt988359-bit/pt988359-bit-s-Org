/**
 * Enterprise Architecture - Single Aggregate Cost Sheet Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { ProductCostSheet } from '../../types/adminFinance';

const COST_SHEETS_KEY = 'proteck_admin_cost_sheets_v1';

export class CostSheetRepository extends BaseRepository<ProductCostSheet & { id: string }> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
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
