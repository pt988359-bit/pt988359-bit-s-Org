/**
 * Enterprise Architecture - Category Repository
 * Unified Firestore persistence for Categories with Local Fallback & Live Subscriptions
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { Category } from '../../types';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.CATEGORIES, storage);
  }

  public getActiveCategories(): Category[] {
    return this.query((c) => c.isActive !== false);
  }

  public getBySlug(slug: string): Category | null {
    const items = this.getAll();
    return items.find((c) => c.slug === slug || c.seoSlug === slug) || null;
  }
}

export const defaultCategoryRepository = new CategoryRepository();
