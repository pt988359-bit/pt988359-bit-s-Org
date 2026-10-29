/**
 * Enterprise Architecture - Single Aggregate Financial Timeline Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { FinancialTimelineEvent } from '../../types/adminFinance';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

const TIMELINE_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_TIMELINE;

export class FinancialTimelineRepository extends BaseRepository<FinancialTimelineEvent> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(TIMELINE_KEY, storage);
  }
}

export const defaultFinancialTimelineRepository = new FinancialTimelineRepository();
