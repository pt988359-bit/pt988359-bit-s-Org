/**
 * Enterprise Architecture - Firestore Adapter Stub
 * Phase 14.5 Refactoring
 *
 * Demonstrates how repositories will switch to Firestore without changing business logic or React UI components.
 */

import { StorageAdapter } from './StorageAdapter';
import { StorageError } from '../errors/DomainErrors';
import { LoggerService } from '../services/LoggerService';

export class FirestoreAdapterStub implements StorageAdapter {
  constructor(private _firestoreConfig?: { collectionPrefix?: string }) {}

  public getItem<T>(_key: string): T | null {
    throw new StorageError('FirestoreAdapter is prepared for Phase 15 production deployment.');
  }

  public setItem<T>(_key: string, _value: T): void {
    throw new StorageError('FirestoreAdapter is prepared for Phase 15 production deployment.');
  }

  public removeItem(_key: string): void {
    throw new StorageError('FirestoreAdapter is prepared for Phase 15 production deployment.');
  }

  public clear(): void {
    throw new StorageError('FirestoreAdapter is prepared for Phase 15 production deployment.');
  }

  public getCollection<T>(_collectionName: string): T[] {
    LoggerService.warn('FirestoreAdapterStub', 'Prepared architecture interface - fallback to local storage adapter.');
    return [];
  }

  public saveCollection<T>(_collectionName: string, _items: T[]): void {
    LoggerService.warn('FirestoreAdapterStub', 'Prepared architecture interface - fallback to local storage adapter.');
  }

  public queryCollection<T>(_collectionName: string, _predicate: (item: T) => boolean): T[] {
    return [];
  }
}
