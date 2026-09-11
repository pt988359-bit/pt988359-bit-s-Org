/**
 * Enterprise Architecture - LocalStorage Adapter Implementation
 * Phase 14.5 Refactoring
 *
 * Provides safe wrapped operations over LocalStorage with fallback memory storage.
 */

import { StorageAdapter } from './StorageAdapter';
import { StorageError } from '../errors/DomainErrors';
import { LoggerService } from '../services/LoggerService';

export class LocalStorageAdapter implements StorageAdapter {
  private inMemoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test_ls__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem<T>(key: string): T | null {
    try {
      if (this.isLocalStorageAvailable()) {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
      }
      const memoryRaw = this.inMemoryFallback.get(key);
      if (!memoryRaw) return null;
      return JSON.parse(memoryRaw) as T;
    } catch (error) {
      LoggerService.warn('LocalStorageAdapter', `Failed to parse key "${key}" from storage`, error);
      return null;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(key, serialized);
      } else {
        this.inMemoryFallback.set(key, serialized);
      }
    } catch (error) {
      throw new StorageError(`Failed to save key "${key}" to storage`, { key, error });
    }
  }

  public removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      } else {
        this.inMemoryFallback.delete(key);
      }
    } catch (error) {
      throw new StorageError(`Failed to remove key "${key}" from storage`, { key, error });
    }
  }

  public clear(): void {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.clear();
      }
      this.inMemoryFallback.clear();
    } catch (error) {
      throw new StorageError('Failed to clear storage', { error });
    }
  }

  public getCollection<T>(collectionName: string): T[] {
    const data = this.getItem<T[]>(collectionName);
    return Array.isArray(data) ? data : [];
  }

  public saveCollection<T>(collectionName: string, items: T[]): void {
    this.setItem(collectionName, items);
  }

  public queryCollection<T>(collectionName: string, predicate: (item: T) => boolean): T[] {
    const collection = this.getCollection<T>(collectionName);
    return collection.filter(predicate);
  }
}

import { firestoreStorageAdapter } from './FirestoreStorageAdapter';

export const defaultStorageAdapter = firestoreStorageAdapter;

