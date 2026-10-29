/**
 * Enterprise Architecture - Storage Adapter Interface
 * Phase 14.5 Refactoring
 *
 * Decouples repositories from underlying storage mechanisms (LocalStorage, Firestore, REST API).
 */

export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
  getCollection<T>(collectionName: string): T[];
  saveCollection<T>(collectionName: string, items: T[]): void;
  saveItem?<T>(collectionName: string, item: T): void;
  queryCollection<T>(collectionName: string, predicate: (item: T) => boolean): T[];
}
