/**
 * Enterprise Architecture - Firestore Configuration & Collection Schema Definition
 * Phase 15 Enterprise Readiness - 100% Firestore Ready
 */

export const FIRESTORE_COLLECTIONS = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  PURCHASE_REQUESTS: 'purchase_requests',
  RESERVATIONS: 'reservations',
  NEGOTIATIONS: 'negotiations',
  INQUIRIES: 'inquiries',
  COMPLETED_SALES: 'completed_sales',
  SELL_REQUESTS: 'sell_requests',
  EXCHANGE_REQUESTS: 'exchange_requests',
  SUPPLIERS: 'suppliers',
  INVOICES: 'invoices',
  EXPENSES: 'expenses',
  COST_SHEETS: 'cost_sheets',
  CASH_LEDGERS: 'cash_ledgers',
  AUDIT_LOGS: 'audit_logs',
  PORTAL_TRACKING: 'portal_tracking',
  PORTAL_SESSIONS: 'portal_sessions',
  PORTAL_SUPPORT: 'portal_support',
  AUTH_SESSIONS: 'auth_sessions',
  AUTH_ATTEMPTS: 'auth_attempts',
  AUTH_LOGS: 'auth_logs',
  SHOWROOM_SETTINGS: 'showroom_settings',
  DOCUMENTS: 'documents',
  USERS: 'users',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  FINANCE: 'finance',
  INVENTORY: 'inventory',
  ANALYTICS: 'analytics',
} as const;

export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[keyof typeof FIRESTORE_COLLECTIONS];

export interface FirestoreIndexSpec {
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: Array<{
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING';
  }>;
}

export const FIRESTORE_COMPOSITE_INDEXES: FirestoreIndexSpec[] = [
  {
    collectionGroup: FIRESTORE_COLLECTIONS.PRODUCTS,
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'category', order: 'ASCENDING' },
      { fieldPath: 'price', order: 'ASCENDING' },
    ],
  },
  {
    collectionGroup: FIRESTORE_COLLECTIONS.PRODUCTS,
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: FIRESTORE_COLLECTIONS.ORDERS,
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' },
    ],
  },
  {
    collectionGroup: FIRESTORE_COLLECTIONS.RESERVATIONS,
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'customerPhone', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
    ],
  },
  {
    collectionGroup: FIRESTORE_COLLECTIONS.AUDIT_LOGS,
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'timestamp', order: 'DESCENDING' },
      { fieldPath: 'action', order: 'ASCENDING' },
    ],
  },
];
