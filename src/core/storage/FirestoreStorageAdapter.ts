/**
 * Enterprise Architecture - Production Firestore Storage Adapter
 * Phase 15 Enterprise Readiness - 100% Firestore Integration
 */

import { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { LoggerService } from '../services/LoggerService';
import { AdminSessionService } from '../services/AdminSessionService';
import {
  db,
  getCollectionDocs,
  subscribeToCollection,
  executeBatchWrite,
} from '../../firebase/firestore';
import { firestoreHealthManager } from '../../firebase/FirestoreHealthManager';
import { doc, setDoc, Unsubscribe } from 'firebase/firestore';

export type StorageMode = 'local' | 'firestore';

export class FirestoreStorageAdapter implements StorageAdapter {
  private _fallbackAdapter?: LocalStorageAdapter;
  private mode: StorageMode;
  private activeSubscriptions: Map<string, Unsubscribe> = new Map();
  private collectionListeners: Map<string, Set<(items: any[]) => void>> = new Map();
  private pendingInitialSync: Set<string> = new Set();
  private pollingIntervals: Map<string, any> = new Map();
  private retrySubscriptionTimers: Map<string, any> = new Map();

  private get fallbackAdapter(): LocalStorageAdapter {
    if (!this._fallbackAdapter) {
      this._fallbackAdapter = new LocalStorageAdapter({ suppressQuotaToast: true });
    }
    return this._fallbackAdapter;
  }

  constructor(mode?: StorageMode) {
    let defaultMode: StorageMode = 'firestore';
    try {
      if (typeof process !== 'undefined' && process.env && process.env.VITE_STORAGE_MODE) {
        defaultMode = process.env.VITE_STORAGE_MODE as StorageMode;
      }
    } catch {}
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
      this.writeDocSingle(key, value as any).catch((err) => {
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

  private sanitizeCollectionData<T>(collectionName: string, items: T[]): { items: T[]; changed: boolean } {
    if (!Array.isArray(items) || items.length === 0) {
      return { items, changed: false };
    }
    let changed = false;
    const sanitized = items.map((item: any) => {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.productImage === 'string' &&
        item.productImage.startsWith('data:image')
      ) {
        changed = true;
        return {
          ...item,
          productImage: '',
        };
      }
      return item;
    }) as T[];
    return { items: sanitized, changed };
  }

  private sanitizeSingleItem<T>(item: T): T {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as any).productImage === 'string' &&
      (item as any).productImage.startsWith('data:image')
    ) {
      return {
        ...item,
        productImage: '',
      };
    }
    return item;
  }

  public getCollection<T>(collectionName: string): T[] {
    const rawCached = this.fallbackAdapter.getCollection<T>(collectionName);
    const { items: cached, changed } = this.sanitizeCollectionData(collectionName, rawCached);

    // If local cache contained Base64 images, resave immediately to free up localStorage quota
    if (changed) {
      this.fallbackAdapter.saveCollection(collectionName, cached);
      LoggerService.info('FirestoreStorageAdapter', `Cleaned Base64 productImage from local cache for ${collectionName}`);
    }

    // If in Firestore mode, automatically ensure live subscription is active
    if (this.getMode() === 'firestore' && !this.activeSubscriptions.has(collectionName)) {
      this.ensureSubscription<any>(collectionName);
    }

    // Trigger proactive background remote fetch once per session
    if (this.getMode() === 'firestore' && !this.pendingInitialSync.has(collectionName)) {
      this.pendingInitialSync.add(collectionName);
      this.fetchCollectionAsync<T>(collectionName).catch((err) => {
        LoggerService.warn('FirestoreStorageAdapter', `Background initial sync failed for ${collectionName}`, err);
      });
    }

    return cached;
  }

  private notifySubscribers<T>(collectionName: string, items: T[]): void {
    const listeners = this.collectionListeners.get(collectionName);
    if (listeners && listeners.size > 0) {
      listeners.forEach((listener) => {
        try {
          listener(items);
        } catch (cbErr) {
          LoggerService.warn('FirestoreStorageAdapter', `Error in listener callback for ${collectionName}`, cbErr);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('proteck:firestore_collection_sync', {
          detail: { collectionName, items, count: items.length },
        })
      );
    }
  }

  private isPermissionError(err: any): boolean {
    if (!err) return false;
    const code = String(err.code || '').toLowerCase();
    const msg = String(err.message || '').toLowerCase();
    return (
      code.includes('permission-denied') ||
      code.includes('unauthenticated') ||
      msg.includes('permission') ||
      msg.includes('insufficient')
    );
  }

  private startPollingFallback<T extends { id: string }>(collectionName: string): void {
    if (this.pollingIntervals.has(collectionName)) {
      return;
    }

    LoggerService.info(
      'FirestoreStorageAdapter',
      `Permission error detected on '${collectionName}'. Starting 10s admin fallback polling.`
    );

    const poll = async () => {
      // Only execute admin polling if an admin session token exists
      if (!AdminSessionService.hasToken()) {
        return;
      }

      try {
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          ...AdminSessionService.getAuthHeaders(),
        };

        const res = await fetch(`/api/admin/collection/${encodeURIComponent(collectionName)}`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (res.ok) {
          const items = await res.json();
          if (Array.isArray(items) && items.length > 0) {
            const { items: cleanItems } = this.sanitizeCollectionData(collectionName, items);
            this.fallbackAdapter.saveCollection(collectionName, cleanItems);
            this.notifySubscribers(collectionName, cleanItems);
          }
        } else {
          LoggerService.warn(
            'FirestoreStorageAdapter',
            `Admin polling fetch returned status ${res.status} for ${collectionName}`
          );
        }
      } catch (pollErr) {
        LoggerService.warn('FirestoreStorageAdapter', `Admin polling network error for ${collectionName}:`, pollErr);
      }
    };

    // Execute immediately on error detection so admin does not wait 10s
    poll();

    // Schedule 10-second recurring poll
    const timer = setInterval(poll, 10000);
    this.pollingIntervals.set(collectionName, timer);
  }

  private scheduleSubscriptionRetry<T extends { id: string }>(collectionName: string): void {
    if (this.retrySubscriptionTimers.has(collectionName)) {
      return;
    }

    // Periodically retry live Firestore onSnapshot (every 60s)
    // in case signBlob / custom tokens become functional later
    const retryTimer = setTimeout(() => {
      this.retrySubscriptionTimers.delete(collectionName);
      const existingUnsub = this.activeSubscriptions.get(collectionName);
      if (existingUnsub) {
        try {
          existingUnsub();
        } catch {}
        this.activeSubscriptions.delete(collectionName);
      }
      LoggerService.info('FirestoreStorageAdapter', `Retrying live Firestore onSnapshot for ${collectionName}`);
      this.ensureSubscription<T>(collectionName);
    }, 60000);

    this.retrySubscriptionTimers.set(collectionName, retryTimer);
  }

  public saveCollection<T>(collectionName: string, items: T[]): void {
    const { items: cleanItems } = this.sanitizeCollectionData(collectionName, items);
    this.fallbackAdapter.saveCollection<T>(collectionName, cleanItems);
    this.notifySubscribers(collectionName, cleanItems);

    if (this.getMode() === 'firestore' && Array.isArray(cleanItems)) {
      const validItems = cleanItems.filter((item) => item && typeof item === 'object' && 'id' in (item as any));
      if (validItems.length > 0) {
        const CHUNK_SIZE = 400;
        const chunks: any[][] = [];
        for (let i = 0; i < validItems.length; i += CHUNK_SIZE) {
          chunks.push(validItems.slice(i, i + CHUNK_SIZE));
        }

        (async () => {
          for (const chunk of chunks) {
            const batchOps = chunk.map((item: any) => ({
              type: 'set' as const,
              collection: collectionName,
              id: item.id,
              data: item,
            }));

            try {
              await executeBatchWrite(batchOps);
            } catch (err: any) {
              LoggerService.warn('FirestoreStorageAdapter', `Batch write to ${collectionName} failed for chunk of ${chunk.length} items`, err);
              if (this.isPermissionError(err) && AdminSessionService.hasToken()) {
                LoggerService.info('FirestoreStorageAdapter', `Batch write permission error for ${collectionName}. Falling back to admin server POST endpoint for ${chunk.length} items.`);
                for (const item of chunk) {
                  await this.saveDocViaAdminApi(collectionName, (item as any).id, item);
                }
              }
            }
          }
        })().catch((outerErr) => {
          LoggerService.warn('FirestoreStorageAdapter', `Error in chunked batch write for ${collectionName}`, outerErr);
        });
      }
    }
  }

  private async saveDocViaAdminApi(collectionName: string, id: string, data: any): Promise<boolean> {
    if (!AdminSessionService.hasToken()) {
      return false;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...AdminSessionService.getAuthHeaders(),
      };

      const res = await fetch(
        `/api/admin/collection/${encodeURIComponent(collectionName)}`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({ id, ...data }),
        }
      );

      if (res.ok) {
        LoggerService.info(
          'FirestoreStorageAdapter',
          `Successfully saved doc via admin server fallback: ${collectionName}/${id}`
        );
        return true;
      } else {
        LoggerService.warn(
          'FirestoreStorageAdapter',
          `Admin write endpoint returned status ${res.status} for ${collectionName}/${id}`
        );
        return false;
      }
    } catch (netErr) {
      LoggerService.warn(
        'FirestoreStorageAdapter',
        `Admin fallback network error for ${collectionName}/${id}:`,
        netErr
      );
      return false;
    }
  }

  private async writeDocSingle<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, data, { merge: true });
      firestoreHealthManager.recordSuccess();
    } catch (err: any) {
      if (this.isPermissionError(err)) {
        LoggerService.info(
          'FirestoreStorageAdapter',
          `Direct write permission error for ${collectionName}/${data.id}. Attempting admin server fallback.`
        );
        await this.saveDocViaAdminApi(collectionName, data.id, data);
        return;
      }
      firestoreHealthManager.recordError(err, `writeDocSingle:${collectionName}/${data.id}`);
      LoggerService.warn(
        'FirestoreStorageAdapter',
        `Single doc write to ${collectionName}/${data.id} failed`,
        err
      );
    }
  }

  public saveItem<T>(collectionName: string, item: T): void {
    const cleanItem = this.sanitizeSingleItem(item);
    this.fallbackAdapter.saveItem<T>(collectionName, cleanItem);
    const updatedCollection = this.fallbackAdapter.getCollection<T>(collectionName);
    this.notifySubscribers(collectionName, updatedCollection);

    if (this.getMode() === 'firestore' && cleanItem && typeof cleanItem === 'object' && 'id' in (cleanItem as any)) {
      this.writeDocSingle(collectionName, cleanItem as any).catch((err) => {
        LoggerService.warn(
          'FirestoreStorageAdapter',
          `Single doc write to ${collectionName}/${(cleanItem as any).id} failed`,
          err
        );
      });
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
      if (docs && docs.length > 0) {
        const { items: cleanDocs } = this.sanitizeCollectionData(collectionName, docs);
        this.fallbackAdapter.saveCollection(collectionName, cleanDocs as any);
        this.notifySubscribers(collectionName, cleanDocs);
        return cleanDocs;
      }
    } catch (err) {
      LoggerService.warn('FirestoreStorageAdapter', `fetchCollectionAsync failed for ${collectionName}, using local data`, err);
      if (this.isPermissionError(err)) {
        this.startPollingFallback<any>(collectionName);
      }
    }
    return this.getCollection<T>(collectionName);
  }

  public ensureSubscription<T extends { id: string }>(collectionName: string): void {
    if (this.getMode() !== 'firestore' || this.activeSubscriptions.has(collectionName)) {
      return;
    }

    const unsub = subscribeToCollection<T>(
      collectionName,
      (items) => {
        const { items: cleanItems } = this.sanitizeCollectionData(collectionName, items);

        // Data Preservation Safeguard:
        // If Firestore remote collection has 0 items but local cache already has records,
        // do not let the empty array wipe out local records! Instead, upload local records to Firestore.
        const localCached = this.fallbackAdapter.getCollection<T>(collectionName);
        if (cleanItems.length === 0 && localCached.length > 0) {
          LoggerService.info(
            'FirestoreStorageAdapter',
            `Preserving local records for ${collectionName} by syncing to empty Firestore collection`,
            { count: localCached.length }
          );
          this.saveCollection(collectionName, localCached);
          return;
        }

        if (Array.isArray(cleanItems)) {
          this.fallbackAdapter.saveCollection(collectionName, cleanItems);
        }
        this.notifySubscribers(collectionName, cleanItems);
      },
      (err) => {
        LoggerService.warn('FirestoreStorageAdapter', `Subscription update error for ${collectionName}: using local cache`, err);

        // Fallback to polling when permission error happens
        if (this.isPermissionError(err)) {
          this.startPollingFallback<T>(collectionName);
          this.scheduleSubscriptionRetry<T>(collectionName);
        }

        const cached = this.fallbackAdapter.getCollection<T>(collectionName);
        if (cached && cached.length > 0) {
          this.notifySubscribers(collectionName, cached);
        }
      }
    );

    this.activeSubscriptions.set(collectionName, unsub);
  }

  public subscribeToCollectionUpdates<T extends { id: string }>(
    collectionName: string,
    onUpdate: (items: T[]) => void
  ): () => void {
    if (!this.collectionListeners.has(collectionName)) {
      this.collectionListeners.set(collectionName, new Set());
    }
    const listeners = this.collectionListeners.get(collectionName)!;
    listeners.add(onUpdate as (items: any[]) => void);

    // Provide cached items immediately to the subscriber if available
    const cached = this.fallbackAdapter.getCollection<T>(collectionName);
    if (cached && cached.length > 0) {
      try {
        onUpdate(cached);
      } catch (err) {
        LoggerService.warn('FirestoreStorageAdapter', `Error in immediate cached dispatch for ${collectionName}`, err);
      }
    }

    // Ensure live Firestore subscription is running
    this.ensureSubscription<T>(collectionName);

    // Also trigger initial background fetch to guarantee latest state
    if (this.getMode() === 'firestore') {
      this.fetchCollectionAsync<T>(collectionName).catch(() => {});
    }

    return () => {
      listeners.delete(onUpdate as (items: any[]) => void);
    };
  }
}

export const firestoreStorageAdapter = new FirestoreStorageAdapter();
