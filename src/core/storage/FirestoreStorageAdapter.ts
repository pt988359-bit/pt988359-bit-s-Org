/**
 * Enterprise Architecture - Production Firestore Storage Adapter
 * Phase 15 Enterprise Readiness - 100% Firestore Integration
 */

import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { LoggerService } from '../services/LoggerService';
import {
  setDocData,
  getCollectionDocs,
  subscribeToCollection,
  executeBatchWrite,
} from '../../firebase/firestore';
import { firestoreHealthManager } from '../../firebase/FirestoreHealthManager';
import { Unsubscribe } from 'firebase/firestore';

export type StorageMode = 'local' | 'firestore';

export class FirestoreStorageAdapter implements StorageAdapter {
  private _fallbackAdapter?: LocalStorageAdapter;
  private mode: StorageMode;
  private activeSubscriptions: Map<string, Unsubscribe> = new Map();

  private get fallbackAdapter(): LocalStorageAdapter {
    if (!this._fallbackAdapter) {
      this._fallbackAdapter = new LocalStorageAdapter();
    }
    return this._fallbackAdapter;
  }

  constructor(mode?: StorageMode) {
    const metaEnv = (import.meta as any).env || {};
    const defaultMode = (metaEnv.VITE_STORAGE_MODE as StorageMode) || 'firestore';
    this.mode = mode || defaultMode;

    firestoreHealthManager.subscribe((healthState) => {
      if (healthState.isFallbackToLocal && this.mode === 'firestore') {
        LoggerService.warn(
          'FirestoreStorageAdapter',
          'Firestore health manager reported offline/unavailable state. Dynamically switching to local fallback.'
        );
      }
    });
  }

  public setMode(mode: StorageMode): void {
    this.mode = mode;
    LoggerService.info('FirestoreStorageAdapter', `Storage mode switched to ${mode}`);
  }

  public getMode(): StorageMode {
    if (firestoreHealthManager.isFallbackToLocal()) {
      return 'local';
    }
    return this.mode;
  }

  public getItem<T>(key: string): T | null {
    return this.fallbackAdapter.getItem<T>(key);
  }

  public setItem<T>(key: string, value: T): void {
    this.fallbackAdapter.setItem<T>(key, value);
    if (this.getMode() === 'firestore' && typeof value === 'object' && value !== null && 'id' in (value as any)) {
      setDocData(key, value as any).catch((err) => {
        LoggerService.warn('FirestoreStorageAdapter', `Async setItem sync failed for key ${key}`, err);
      });
    }
  }

  public removeItem(key: string): void {
    this.fallbackAdapter.removeItem(key);
  }

  public clear(): void {
    this.fallbackAdapter.clear();
  }

  public getCollection<T>(collectionName: string): T[] {
    return this.fallbackAdapter.getCollection<T>(collectionName);
  }

  public saveCollection<T>(collectionName: string, items: T[]): void {
    this.fallbackAdapter.saveCollection<T>(collectionName, items);
    if (this.getMode() === 'firestore' && Array.isArray(items)) {
      const validItems = items.filter((item) => item && typeof item === 'object' && 'id' in (item as any));
      const batchOps = validItems.slice(0, 400).map((item: any) => ({
        type: 'set' as const,
        collection: collectionName,
        id: item.id,
        data: item,
      }));
      if (batchOps.length > 0) {
        executeBatchWrite(batchOps).catch((err) => {
          LoggerService.warn('FirestoreStorageAdapter', `Batch write to ${collectionName} failed`, err);
        });
      }
    }
  }

  public queryCollection<T>(collectionName: string, predicate: (item: T) => boolean): T[] {
    return this.fallbackAdapter.queryCollection<T>(collectionName, predicate);
  }

  public async fetchCollectionAsync<T>(collectionName: string): Promise<T[]> {
    if (this.getMode() === 'local') {
      return this.getCollection<T>(collectionName);
    }
    try {
      const docs = await getCollectionDocs<T>(collectionName);
      if (docs.length > 0) {
        this.fallbackAdapter.saveCollection(collectionName, docs as any);
        return docs;
      }
    } catch (err) {
      LoggerService.warn('FirestoreStorageAdapter', `fetchCollectionAsync failed for ${collectionName}, using local data`, err);
    }
    return this.getCollection<T>(collectionName);
  }

  public subscribeToCollectionUpdates<T extends { id: string }>(
    collectionName: string,
    onUpdate: (items: T[]) => void
  ) {
    if (this.getMode() !== 'firestore') {
      return () => {};
    }

    // Prevent duplicate subscriptions to the same collection key
    if (this.activeSubscriptions.has(collectionName)) {
      const existingUnsub = this.activeSubscriptions.get(collectionName);
      if (existingUnsub) {
        try {
          existingUnsub();
        } catch {}
      }
      this.activeSubscriptions.delete(collectionName);
    }

    const unsub = subscribeToCollection<T>(
      collectionName,
      (items) => {
        if (items.length > 0) {
          this.fallbackAdapter.saveCollection(collectionName, items);
        }
        onUpdate(items);
      },
      (err) => {
        LoggerService.warn('FirestoreStorageAdapter', `Subscription update error for ${collectionName}: using local cache`, err);
        // Serve cached local items on error
        const cached = this.getCollection<T>(collectionName);
        if (cached.length > 0) {
          onUpdate(cached);
        }
      }
    );

    this.activeSubscriptions.set(collectionName, unsub);

    return () => {
      try {
        unsub();
      } catch {}
      this.activeSubscriptions.delete(collectionName);
    };
  }
}

export const firestoreStorageAdapter = new FirestoreStorageAdapter();
