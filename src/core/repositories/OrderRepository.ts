/**
 * Enterprise Architecture - Order & Request Repository
 * Phase 15 Enterprise Readiness
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import {
  PurchaseRequest,
  ReservationItem,
  NegotiationItem,
  InquiryItem,
  CompletedSaleItem,
} from '../../types/orderManagementCenter';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

export class PurchaseRequestRepository extends BaseRepository<PurchaseRequest> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.PURCHASE_REQUESTS, storage);
  }
}

export class ReservationRepository extends BaseRepository<ReservationItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.RESERVATIONS, storage);
  }
}

export class NegotiationRepository extends BaseRepository<NegotiationItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.NEGOTIATIONS, storage);
  }
}

export class InquiryRepository extends BaseRepository<InquiryItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.INQUIRIES, storage);
  }
}

export class CompletedSaleRepository extends BaseRepository<CompletedSaleItem> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.COMPLETED_SALES, storage);
  }
}

export const defaultPurchaseRequestRepository = new PurchaseRequestRepository();
export const defaultReservationRepository = new ReservationRepository();
export const defaultNegotiationRepository = new NegotiationRepository();
export const defaultInquiryRepository = new InquiryRepository();
export const defaultCompletedSaleRepository = new CompletedSaleRepository();
