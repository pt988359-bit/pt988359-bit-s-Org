/**
 * Enterprise Architecture - Atomic Sequence Counter Repository
 * Phase 14.7 Architecture Hardening
 *
 * Persists independent sequence counters for document and reference prefixes.
 * Guarantees that deleting or archiving records NEVER causes duplicate sequence numbers.
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';

export interface SequenceCounter {
  id: string; // prefix name e.g. "EXP", "FIN", "PUR"
  prefix: string;
  lastValue: number;
  updatedAt: string;
}

const SEQUENCE_COLLECTION_KEY = 'proteck_sequence_counters_v1';

export class SequenceRepository extends BaseRepository<SequenceCounter> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(SEQUENCE_COLLECTION_KEY, storage);
  }

  public getCounter(prefix: string): SequenceCounter {
    const existing = this.getById(prefix.toUpperCase());
    if (existing) return existing;

    const initialCounter: SequenceCounter = {
      id: prefix.toUpperCase(),
      prefix: prefix.toUpperCase(),
      lastValue: 0,
      updatedAt: new Date().toISOString(),
    };
    return this.save(initialCounter);
  }

  public incrementCounter(prefix: string): number {
    const counter = this.getCounter(prefix);
    const newValue = counter.lastValue + 1;
    const updated: SequenceCounter = {
      ...counter,
      lastValue: newValue,
      updatedAt: new Date().toISOString(),
    };
    this.save(updated);
    return newValue;
  }
}

export const defaultSequenceRepository = new SequenceRepository();
