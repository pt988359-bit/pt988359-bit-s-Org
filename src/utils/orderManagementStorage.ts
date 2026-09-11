import {
  PurchaseRequest,
  ReservationItem,
  NegotiationItem,
  InquiryItem,
  CompletedSaleItem,
  OrderAuditLogEntry,
  ProductSyncPayload,
} from '../types/orderManagementCenter';
import { defaultStorageAdapter } from '../core/storage/LocalStorageAdapter';

const STORAGE_KEYS = {
  PURCHASE_REQUESTS: 'proteck_purchase_requests_v1',
  RESERVATIONS: 'proteck_reservations_v1',
  NEGOTIATIONS: 'proteck_negotiations_v1',
  INQUIRIES: 'proteck_inquiries_v1',
  COMPLETED_SALES: 'proteck_completed_sales_v1',
  AUDIT_LOGS: 'proteck_order_audit_logs_v1',
};

// INITIAL SEED DATA FOR PRODUCTION (Empty Collections)
const INITIAL_PURCHASE_REQUESTS: PurchaseRequest[] = [];
const INITIAL_RESERVATIONS: ReservationItem[] = [];
const INITIAL_NEGOTIATIONS: NegotiationItem[] = [];
const INITIAL_INQUIRIES: InquiryItem[] = [];
const INITIAL_COMPLETED_SALES: CompletedSaleItem[] = [];
const INITIAL_AUDIT_LOGS: OrderAuditLogEntry[] = [];

// DATA LOADERS & SAVERS
export function getPurchaseRequests(): PurchaseRequest[] {
  try {
    const data = defaultStorageAdapter.getItem<PurchaseRequest[]>(STORAGE_KEYS.PURCHASE_REQUESTS);
    return data ? data : INITIAL_PURCHASE_REQUESTS;
  } catch {
    return INITIAL_PURCHASE_REQUESTS;
  }
}

export function savePurchaseRequests(requests: PurchaseRequest[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.PURCHASE_REQUESTS, requests);
}

export function getReservations(): ReservationItem[] {
  try {
    const data = defaultStorageAdapter.getItem<ReservationItem[]>(STORAGE_KEYS.RESERVATIONS);
    return data ? data : INITIAL_RESERVATIONS;
  } catch {
    return INITIAL_RESERVATIONS;
  }
}

export function saveReservations(reservations: ReservationItem[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
}

export function getNegotiations(): NegotiationItem[] {
  try {
    const data = defaultStorageAdapter.getItem<NegotiationItem[]>(STORAGE_KEYS.NEGOTIATIONS);
    return data ? data : INITIAL_NEGOTIATIONS;
  } catch {
    return INITIAL_NEGOTIATIONS;
  }
}

export function saveNegotiations(items: NegotiationItem[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.NEGOTIATIONS, items);
}

export function getInquiries(): InquiryItem[] {
  try {
    const data = defaultStorageAdapter.getItem<InquiryItem[]>(STORAGE_KEYS.INQUIRIES);
    return data ? data : INITIAL_INQUIRIES;
  } catch {
    return INITIAL_INQUIRIES;
  }
}

export function saveInquiries(items: InquiryItem[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.INQUIRIES, items);
}

export function getCompletedSales(): CompletedSaleItem[] {
  try {
    const data = defaultStorageAdapter.getItem<CompletedSaleItem[]>(STORAGE_KEYS.COMPLETED_SALES);
    return data ? data : INITIAL_COMPLETED_SALES;
  } catch {
    return INITIAL_COMPLETED_SALES;
  }
}

export function saveCompletedSales(sales: CompletedSaleItem[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.COMPLETED_SALES, sales);
}

export function getAuditLogs(): OrderAuditLogEntry[] {
  try {
    const data = defaultStorageAdapter.getItem<OrderAuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS);
    return data ? data : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function logOrderAudit(
  administrator: string,
  referenceNumber: string,
  previousStatus: string,
  newStatus: string,
  reason: string
): OrderAuditLogEntry {
  const newEntry: OrderAuditLogEntry = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    administrator,
    referenceNumber,
    previousStatus,
    newStatus,
    reason,
  };
  const logs = getAuditLogs();
  const updated = [newEntry, ...logs];
  defaultStorageAdapter.setItem(STORAGE_KEYS.AUDIT_LOGS, updated);
  return newEntry;
}

// PRODUCT SYNCHRONIZATION PAYLOAD GENERATOR
export function createProductSyncPayload(
  productTitle: string,
  newProductStatus: 'available' | 'reserved' | 'sold'
): ProductSyncPayload {
  return {
    productTitle,
    newProductStatus,
    customerHistoryUpdated: true,
    reservationStatusUpdated: true,
    invoiceStatusPrepared: true,
    analyticsNotified: true,
    systemNotificationCreated: true,
  };
}

// EXPIRATION ENGINE CALCULATOR
export function calculateRemainingTime(
  expiresAtIso: string,
  isIndefiniteOrVerified: boolean = false
): {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isIndefinite?: boolean;
  formatted: string;
  badgeColor: 'red' | 'amber' | 'emerald' | 'slate';
} {
  if (isIndefiniteOrVerified) {
    return {
      totalSeconds: Infinity,
      hours: 9999,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      isIndefinite: true,
      formatted: 'حجز مؤكد',
      badgeColor: 'emerald',
    };
  }

  const now = Date.now();
  const expiry = new Date(expiresAtIso).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: 'منتهي الصلاحية',
      badgeColor: 'slate',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  let badgeColor: 'red' | 'amber' | 'emerald' | 'slate' = 'emerald';
  if (hours < 2) {
    badgeColor = 'red';
  } else if (hours < 6) {
    badgeColor = 'amber';
  }

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted,
    badgeColor,
  };
}

// EXPORT TO CSV / EXCEL
export function exportOrderModuleToCSV(title: string, data: any[]): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const csvContent = '\uFEFF' + headers + '\n' + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
