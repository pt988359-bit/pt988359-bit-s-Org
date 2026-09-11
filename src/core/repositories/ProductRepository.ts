/**
 * Enterprise Architecture - Product Repository
 * Phase 15 Enterprise Readiness
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { Product } from '../../types';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

export class ProductRepository extends BaseRepository<Product> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.PRODUCTS, storage);
  }

  public getAvailableProducts(): Product[] {
    return this.query((product) => product.status === 'available');
  }

  public getProductsByCategory(categoryId: string): Product[] {
    return this.query((product) => product.categoryId === categoryId);
  }
}

export const defaultProductRepository = new ProductRepository();
