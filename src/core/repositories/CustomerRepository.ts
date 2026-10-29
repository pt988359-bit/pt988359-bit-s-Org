/**
 * Enterprise Architecture - Customer Repository
 * Phase 15 Enterprise Readiness
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { Customer, SellDeviceRequest, ExchangeDeviceRequest } from '../../types/customerHub';
import { CustomerActivitySummary } from '../../types/customerActions';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

export class CustomerRepository extends BaseRepository<Customer> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.CUSTOMERS, storage);
  }
}

export class CustomerSellRequestRepository extends BaseRepository<SellDeviceRequest> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.SELL_REQUESTS, storage);
  }
}

export class CustomerExchangeRequestRepository extends BaseRepository<ExchangeDeviceRequest> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(FIRESTORE_COLLECTIONS.EXCHANGE_REQUESTS, storage);
  }
}

export class CustomerActivityRepository extends BaseRepository<CustomerActivitySummary & { id: string }> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super('customer_activities', storage);
  }
}

export const defaultCustomerRepository = new CustomerRepository();
export const defaultCustomerSellRequestRepository = new CustomerSellRequestRepository();
export const defaultCustomerExchangeRequestRepository = new CustomerExchangeRequestRepository();
export const defaultCustomerActivityRepository = new CustomerActivityRepository();
