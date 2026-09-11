/**
 * Enterprise Architecture - In-Memory & TTL Caching Layer
 * Phase 14.7 Architecture Hardening
 */

import { LoggerService } from './LoggerService';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static cacheMap = new Map<string, CacheEntry<unknown>>();

  public static get<T>(key: string): T | null {
    const entry = this.cacheMap.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      LoggerService.debug('CacheService', `Cache expired for key: ${key}`);
      this.cacheMap.delete(key);
      return null;
    }

    LoggerService.debug('CacheService', `Cache hit for key: ${key}`);
    return entry.value as T;
  }

  public static set<T>(key: string, value: T, ttlMs: number = 60000): void {
    const expiresAt = Date.now() + ttlMs;
    this.cacheMap.set(key, { value, expiresAt });
    LoggerService.debug('CacheService', `Cache stored for key: ${key} (TTL: ${ttlMs}ms)`);
  }

  public static invalidate(key: string): void {
    this.cacheMap.delete(key);
    LoggerService.debug('CacheService', `Cache invalidated for key: ${key}`);
  }

  public static clear(): void {
    this.cacheMap.clear();
    LoggerService.debug('CacheService', 'Cache cleared');
  }
}
