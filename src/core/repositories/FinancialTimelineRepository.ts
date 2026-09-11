/**
 * Enterprise Architecture - Single Aggregate Financial Timeline Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { FinancialTimelineEvent } from '../../types/adminFinance';

const TIMELINE_KEY = 'proteck_admin_financial_timeline_v1';

export class FinancialTimelineRepository extends BaseRepository<FinancialTimelineEvent> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(TIMELINE_KEY, storage);
  }
}

export const defaultFinancialTimelineRepository = new FinancialTimelineRepository();
