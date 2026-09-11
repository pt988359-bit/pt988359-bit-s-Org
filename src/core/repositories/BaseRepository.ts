/**
 * Enterprise Architecture - Abstract Base Repository
 * Phase 14.5 Refactoring
 */

import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { RepositoryError } from '../errors/DomainErrors';

export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly collectionKey: string,
    protected readonly storage: StorageAdapter = firestoreStorageAdapter
  ) {}

  public getAll(): T[] {
    try {
      return this.storage.getCollection<T>(this.collectionKey);
    } catch (error) {
      throw new RepositoryError(`Failed to fetch collection: ${this.collectionKey}`, { collectionKey: this.collectionKey, error });
    }
  }

  public findAll(): T[] {
    return this.getAll();
  }

  public getById(id: string): T | null {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  public findById(id: string): T | null {
    return this.getById(id);
  }

  public update(id: string, partial: Partial<T>): T | null {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated = { ...existing, ...partial };
    return this.save(updated);
  }

  public save(item: T): T {
    try {
      const items = this.getAll();
      const index = items.findIndex((existing) => existing.id === item.id);
      let updated: T[];
      if (index >= 0) {
        updated = [...items];
        updated[index] = item;
      } else {
        updated = [item, ...items];
      }
      this.storage.saveCollection(this.collectionKey, updated);
      return item;
    } catch (error) {
      throw new RepositoryError(`Failed to save item in collection: ${this.collectionKey}`, { id: item.id, error });
    }
  }

  public saveAll(items: T[]): void {
    try {
      this.storage.saveCollection(this.collectionKey, items);
    } catch (error) {
      throw new RepositoryError(`Failed to save batch in collection: ${this.collectionKey}`, { error });
    }
  }

  public remove(id: string): void {
    try {
      const items = this.getAll();
      const filtered = items.filter((item) => item.id !== id);
      this.storage.saveCollection(this.collectionKey, filtered);
    } catch (error) {
      throw new RepositoryError(`Failed to remove item ${id} from collection: ${this.collectionKey}`, { id, error });
    }
  }

  public query(predicate: (item: T) => boolean): T[] {
    return this.storage.queryCollection<T>(this.collectionKey, predicate);
  }
}
