/**
 * Enterprise Architecture - Centralized Serialization & Data Migration Service
 * Phase 14.7 Architecture Hardening
 */

import { StorageError } from '../errors/DomainErrors';
import { LoggerService } from './LoggerService';

export class SerializerService {
  private static SCHEMA_VERSION = 1;

  public static serialize<T>(data: T): string {
    try {
      const wrapper = {
        version: this.SCHEMA_VERSION,
        timestamp: new Date().toISOString(),
        payload: data,
      };
      return JSON.stringify(wrapper);
    } catch (error) {
      LoggerService.error('SerializerService', 'Failed to serialize data', error);
      throw new StorageError('Serialization failed', { error });
    }
  }

  public static deserialize<T>(raw: string): T | null {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'payload' in parsed && 'version' in parsed) {
        return parsed.payload as T;
      }
      // Fallback for raw legacy JSON without schema wrapper
      return parsed as T;
    } catch (error) {
      LoggerService.error('SerializerService', 'Failed to deserialize payload', error);
      return null;
    }
  }
}
