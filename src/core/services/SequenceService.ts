/**
 * Enterprise Architecture - Atomic Sequence Service
 * Phase 14.7 Architecture Hardening
 *
 * Replaces all legacy `collection.length + 1` patterns across the entire codebase.
 */

import { SequenceRepository, defaultSequenceRepository } from '../repositories/SequenceRepository';
import { IdGenerator, ReferencePrefix } from './IdGenerator';
import { APP_CONFIG } from '../config/appConfig';
import { LoggerService } from './LoggerService';

export class SequenceService {
  constructor(private readonly sequenceRepo: SequenceRepository = defaultSequenceRepository) {}

  /**
   * Generates the next atomic sequence number for a given prefix key or string
   */
  public async getNextSequence(prefixKey: ReferencePrefix | string): Promise<number> {
    const rawPrefix = APP_CONFIG.prefixes[prefixKey as ReferencePrefix] || prefixKey;
    const nextVal = await this.sequenceRepo.incrementCounter(rawPrefix);
    LoggerService.debug('SequenceService', `Generated next sequence [${rawPrefix}]: ${nextVal}`);
    return nextVal;
  }

  /**
   * Generates formatted reference ID using atomic sequence (e.g. EXP-2026-000012)
   */
  public async generateNextReference(prefixKey: ReferencePrefix): Promise<string> {
    const sequenceNum = await this.getNextSequence(prefixKey);
    return IdGenerator.generateReference(prefixKey, sequenceNum);
  }
}

export const defaultSequenceService = new SequenceService();
