/**
 * Enterprise Architecture - Abstract Base Repository
 * Phase 14.5 Refactoring
 */

import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { RepositoryError } from '../errors/DomainErrors';
import { LoggerService } from '../services/LoggerService';
import { AdminSessionService } from '../services/AdminSessionService';

export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly collectionKey: string,
    protected readonly storage: StorageAdapter = firestoreStorageAdapter
  ) {}

  protected isPermissionError(err: any): boolean {
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

  protected async syncDocViaAdminPost(data: T): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...AdminSessionService.getAuthHeaders(),
      };
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://127.0.0.1:3000';
      const res = await fetch(`${baseUrl}/api/admin/collection/${encodeURIComponent(this.collectionKey)}`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        LoggerService.info('BaseRepository', `Synced doc ${data.id} in ${this.collectionKey} via admin POST endpoint`);
        return true;
      } else {
        LoggerService.warn('BaseRepository', `Admin POST endpoint returned status ${res.status} for ${this.collectionKey}/${data.id}`);
        return false;
      }
    } catch (netErr) {
      LoggerService.warn('BaseRepository', `Admin POST endpoint network error for ${this.collectionKey}/${data.id}:`, netErr);
      return false;
    }
  }

  protected async deleteDocViaAdminProxy(id: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...AdminSessionService.getAuthHeaders(),
      };
      const baseUrl = typeof window !== 'undefined' ? '' : 'http://127.0.0.1:3000';
      const res = await fetch(
        `${baseUrl}/api/admin/collection/${encodeURIComponent(this.collectionKey)}/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers,
        }
      );
      if (res.ok) {
        LoggerService.info('BaseRepository', `Deleted doc ${id} from ${this.collectionKey} via admin DELETE endpoint`);
        return true;
      } else {
        LoggerService.warn('BaseRepository', `Admin DELETE endpoint returned status ${res.status} for ${this.collectionKey}/${id}`);
        return false;
      }
    } catch (netErr) {
      LoggerService.warn('BaseRepository', `Admin DELETE endpoint network error for ${this.collectionKey}/${id}:`, netErr);
      return false;
    }
  }

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
      if (this.storage.saveItem) {
        this.storage.saveItem(this.collectionKey, item);
      } else {
        const items = this.getAll();
        const index = items.findIndex((existing) => existing.id === item.id);
        const updated = index >= 0 ? items.map((x) => (x.id === item.id ? item : x)) : [item, ...items];
        this.storage.saveCollection(this.collectionKey, updated);
      }

      // Ensure remote sync: try client direct Firestore write, fallback to Admin POST endpoint if permission denied or error
      if (typeof window !== 'undefined') {
        import('../../firebase/firestore')
          .then(async ({ setDocData }) => {
            try {
              await setDocData(this.collectionKey, item);
            } catch (err: any) {
              if (this.isPermissionError(err) || AdminSessionService.hasToken()) {
                LoggerService.info(
                  'BaseRepository',
                  `Direct write permission error for ${this.collectionKey}/${item.id}. Falling back to admin server POST proxy.`
                );
                await this.syncDocViaAdminPost(item);
              }
            }
          })
          .catch(() => {
            if (AdminSessionService.hasToken()) {
              this.syncDocViaAdminPost(item).catch(() => {});
            }
          });
      }

      return item;
    } catch (error) {
      LoggerService.warn('BaseRepository', `Failed to save item ${item.id} in collection: ${this.collectionKey}`, error);
      if (AdminSessionService.hasToken()) {
        this.syncDocViaAdminPost(item).catch(() => {});
      }
      return item;
    }
  }

  public saveAll(items: T[]): void {
    try {
      this.storage.saveCollection(this.collectionKey, items);

      if (typeof window !== 'undefined' && Array.isArray(items) && items.length > 0) {
        import('../../firebase/firestore')
          .then(async ({ executeBatchWrite }) => {
            try {
              const ops = items.slice(0, 400).map((it) => ({
                type: 'set' as const,
                collection: this.collectionKey,
                id: it.id,
                data: it,
              }));
              await executeBatchWrite(ops);
            } catch (err: any) {
              if (this.isPermissionError(err) || AdminSessionService.hasToken()) {
                LoggerService.info(
                  'BaseRepository',
                  `Direct batch write failed for ${this.collectionKey}. Falling back to admin server POST proxy.`
                );
                for (const it of items) {
                  await this.syncDocViaAdminPost(it);
                }
              }
            }
          })
          .catch(async () => {
            if (AdminSessionService.hasToken()) {
              for (const it of items) {
                await this.syncDocViaAdminPost(it);
              }
            }
          });
      }
    } catch (error) {
      LoggerService.warn('BaseRepository', `Failed to save batch in collection: ${this.collectionKey}`, error);
      if (AdminSessionService.hasToken()) {
        for (const it of items) {
          this.syncDocViaAdminPost(it).catch(() => {});
        }
      }
    }
  }

  public async remove(id: string): Promise<void> {
    const originalItems = this.getAll();
    const filtered = originalItems.filter((item) => item.id !== id);

    // Optimistically update local storage so synchronous UI readers see the deletion immediately
    this.storage.saveCollection(this.collectionKey, filtered);

    let deletedRemotely = false;
    let attemptedRemote = false;

    if (typeof window !== 'undefined' || AdminSessionService.hasToken()) {
      attemptedRemote = true;

      // 1. Try direct Firestore deletion
      try {
        const { deleteDocData } = await import('../../firebase/firestore');
        await deleteDocData(this.collectionKey, id);
        deletedRemotely = true;
        LoggerService.info('BaseRepository', `Direct deleteDocData succeeded for ${this.collectionKey}/${id}`);
      } catch (directErr: any) {
        LoggerService.info(
          'BaseRepository',
          `Direct deleteDocData failed for ${this.collectionKey}/${id}, attempting admin DELETE endpoint fallback: ${directErr?.message || directErr}`
        );
      }

      // 2. If direct deletion failed or threw, attempt admin DELETE endpoint fallback
      if (!deletedRemotely) {
        deletedRemotely = await this.deleteDocViaAdminProxy(id);
      }

      // "لا تعتبر العملية ناجحة للمستخدم النهائي إلا بعد نجاح أحد المسارين فعليًا (وليس فقط إزالته من الكاش المحلي)"
      if (!deletedRemotely) {
        // Rollback local storage cache so it does not falsely display as deleted
        this.storage.saveCollection(this.collectionKey, originalItems);
        throw new RepositoryError(
          `فشل حذف المستند (${id}) من مجموعة (${this.collectionKey}): تعذر الحذف المباشر وعبر السيرفر.`,
          { id, collectionKey: this.collectionKey }
        );
      }
    }
  }

  public async delete(id: string): Promise<void> {
    return this.remove(id);
  }

  public query(predicate: (item: T) => boolean): T[] {
    return this.storage.queryCollection<T>(this.collectionKey, predicate);
  }

  public subscribe(callback: (items: T[]) => void): () => void {
    if (
      'subscribeToCollectionUpdates' in this.storage &&
      typeof (this.storage as any).subscribeToCollectionUpdates === 'function'
    ) {
      return (this.storage as any).subscribeToCollectionUpdates(this.collectionKey, callback);
    }
    return () => {};
  }

  public async fetchLive(): Promise<T[]> {
    if (
      'fetchCollectionAsync' in this.storage &&
      typeof (this.storage as any).fetchCollectionAsync === 'function'
    ) {
      return (this.storage as any).fetchCollectionAsync(this.collectionKey);
    }
    return this.getAll();
  }
}
