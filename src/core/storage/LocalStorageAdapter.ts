/**
 * Enterprise Architecture - LocalStorage Adapter Implementation
 * Phase 14.5 Refactoring
 *
 * Provides safe wrapped operations over LocalStorage with fallback memory storage.
 */

import { StorageAdapter } from './StorageAdapter';
import { StorageError } from '../errors/DomainErrors';
import { LoggerService } from '../services/LoggerService';
import { ToastDispatcher } from '../services/ToastDispatcher';

export interface LocalStorageAdapterOptions {
  suppressQuotaToast?: boolean;
}

export class LocalStorageAdapter implements StorageAdapter {
  private inMemoryFallback: Map<string, string> = new Map();
  private suppressQuotaToast: boolean = false;

  constructor(options?: LocalStorageAdapterOptions | boolean) {
    if (typeof options === 'boolean') {
      this.suppressQuotaToast = options;
    } else if (options && typeof options.suppressQuotaToast === 'boolean') {
      this.suppressQuotaToast = options.suppressQuotaToast;
    }
  }

  public setSuppressQuotaToast(suppress: boolean): void {
    this.suppressQuotaToast = suppress;
  }

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
        try {
          window.localStorage.setItem(key, serialized);
        } catch (lsWriteError) {
          // If browser localStorage quota is exceeded or storage is disabled, use fast memory cache
          LoggerService.warn('LocalStorageAdapter', `localStorage.setItem failed for key "${key}", falling back to in-memory:`, lsWriteError);
          this.inMemoryFallback.set(key, serialized);

          // Alert admin/user via visible UI toast when falling back to volatile in-memory storage,
          // only if not suppressed (e.g. suppressed when functioning as Firestore's internal local cache)
          if (!this.suppressQuotaToast) {
            ToastDispatcher.dispatch(
              'تنبيه سعة التخزين المؤقت',
              `تعذر الحفظ الدائم في ذاكرة المتصفح للمفتاح (${key}) لامتلائها. تم الحفظ مؤقتًا في الذاكرة الحالية للجلسة.`,
              'warning',
              6000
            );
          }
        }
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

  public saveItem<T>(collectionName: string, item: T): void {
    const items = this.getCollection<T>(collectionName);
    const itemId = item && typeof item === 'object' && 'id' in (item as any) ? (item as any).id : undefined;

    let updated: T[];
    if (itemId !== undefined) {
      const index = items.findIndex((existing: any) => existing && typeof existing === 'object' && existing.id === itemId);
      if (index >= 0) {
        updated = [...items];
        updated[index] = item;
      } else {
        updated = [item, ...items];
      }
    } else {
      updated = [item, ...items];
    }

    this.setItem(collectionName, updated);
  }

  public queryCollection<T>(collectionName: string, predicate: (item: T) => boolean): T[] {
    const collection = this.getCollection<T>(collectionName);
    return collection.filter(predicate);
  }
}

export const defaultStorageAdapter = new LocalStorageAdapter();

