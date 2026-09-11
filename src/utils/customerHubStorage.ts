import {
  Customer,
  SellDeviceRequest,
  ExchangeDeviceRequest,
  CustomerFilterOptions,
  DuplicateMatchGroup,
} from '../types/customerHub';
import { defaultStorageAdapter } from '../core/storage/LocalStorageAdapter';
import { LoggerService } from '../core/services/LoggerService';

const STORAGE_KEY = 'proteck_customer_hub_customers_v1';
const SELL_REQUESTS_KEY = 'proteck_sell_requests_v1';
const EXCHANGE_REQUESTS_KEY = 'proteck_exchange_requests_v1';

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SELL_REQUESTS: SellDeviceRequest[] = [];

export const INITIAL_EXCHANGE_REQUESTS: ExchangeDeviceRequest[] = [];

// Local Storage Helper Functions
export function getStoredCustomers(): Customer[] {
  try {
    const parsed = defaultStorageAdapter.getItem<Customer[]>(STORAGE_KEY);
    if (!parsed) return INITIAL_CUSTOMERS;
    return Array.isArray(parsed) ? parsed : INITIAL_CUSTOMERS;
  } catch (err) {
    LoggerService.error('customerHubStorage', 'Error loading stored customers:', err);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    defaultStorageAdapter.setItem(STORAGE_KEY, customers);
  } catch (err) {
    LoggerService.error('customerHubStorage', 'Error saving customers:', err);
  }
}

export function getStoredSellRequests(): SellDeviceRequest[] {
  try {
    const parsed = defaultStorageAdapter.getItem<SellDeviceRequest[]>(SELL_REQUESTS_KEY);
    if (!parsed) return INITIAL_SELL_REQUESTS;
    return Array.isArray(parsed) ? parsed : INITIAL_SELL_REQUESTS;
  } catch {
    return INITIAL_SELL_REQUESTS;
  }
}

export function saveSellRequests(requests: SellDeviceRequest[]): void {
  try {
    defaultStorageAdapter.setItem(SELL_REQUESTS_KEY, requests);
  } catch (err) {
    LoggerService.error('customerHubStorage', 'Error saving sell requests:', err);
  }
}

export function getStoredExchangeRequests(): ExchangeDeviceRequest[] {
  try {
    const parsed = defaultStorageAdapter.getItem<ExchangeDeviceRequest[]>(EXCHANGE_REQUESTS_KEY);
    if (!parsed) return INITIAL_EXCHANGE_REQUESTS;
    return Array.isArray(parsed) ? parsed : INITIAL_EXCHANGE_REQUESTS;
  } catch {
    return INITIAL_EXCHANGE_REQUESTS;
  }
}

export function saveExchangeRequests(requests: ExchangeDeviceRequest[]): void {
  try {
    defaultStorageAdapter.setItem(EXCHANGE_REQUESTS_KEY, requests);
  } catch (err) {
    LoggerService.error('customerHubStorage', 'Error saving exchange requests:', err);
  }
}

// Filter Function
export function filterCustomers(
  customers: Customer[],
  filters: CustomerFilterOptions
): Customer[] {
  return customers.filter((cust) => {
    // Soft Delete check
    if (filters.archivedOnly) {
      if (!cust.isArchived) return false;
    } else {
      if (cust.isArchived) return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchName = cust.fullName.toLowerCase().includes(q);
      const matchPhone = cust.primaryPhone.includes(q);
      const matchWa = cust.whatsappPhone.includes(q);
      const matchId = cust.id.toLowerCase().includes(q);
      const matchEmail = cust.email.toLowerCase().includes(q);
      const matchArea = cust.address.cityArea.toLowerCase().includes(q);

      if (!matchName && !matchPhone && !matchWa && !matchId && !matchEmail && !matchArea) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== 'all' && cust.status !== filters.status) {
      return false;
    }

    // Area filter
    if (filters.area !== 'all' && !cust.address.cityArea.includes(filters.area)) {
      return false;
    }

    // VIP filter
    if (filters.vipOnly && cust.status !== 'vip' && !cust.tags.includes('VIP')) {
      return false;
    }

    // Has Purchases Only
    if (filters.hasPurchasesOnly && cust.totalPurchases <= 0) {
      return false;
    }

    // Has Reservations Only
    if (filters.hasReservationsOnly && cust.totalReservations <= 0) {
      return false;
    }

    return true;
  });
}

// Duplicate Detection
export function findDuplicateCandidates(customers: Customer[]): DuplicateMatchGroup[] {
  const activeCustomers = customers.filter((c) => !c.isArchived);
  const groups: DuplicateMatchGroup[] = [];

  for (let i = 0; i < activeCustomers.length; i++) {
    const custA = activeCustomers[i];
    const matches: DuplicateMatchGroup['matchedCustomers'] = [];

    for (let j = i + 1; j < activeCustomers.length; j++) {
      const custB = activeCustomers[j];

      // Exact phone match
      if (custA.primaryPhone === custB.primaryPhone) {
        matches.push({
          customer: custB,
          reason: 'phone_exact',
          similarityScore: 100,
        });
        continue;
      }

      // Exact WhatsApp match
      if (custA.whatsappPhone === custB.whatsappPhone) {
        matches.push({
          customer: custB,
          reason: 'whatsapp_exact',
          similarityScore: 95,
        });
        continue;
      }

      // Name similarity match (e.g. "أحمد محمود الشريف")
      const nameA = custA.fullName.trim().toLowerCase();
      const nameB = custB.fullName.trim().toLowerCase();
      if (nameA === nameB || (nameA.length > 5 && nameB.includes(nameA)) || (nameB.length > 5 && nameA.includes(nameB))) {
        matches.push({
          customer: custB,
          reason: 'name_similar',
          similarityScore: 85,
        });
      }
    }

    if (matches.length > 0) {
      groups.push({
        primaryCustomer: custA,
        matchedCustomers: matches,
      });
    }
  }

  return groups;
}

// Export functions
export function exportCustomersToCSV(customers: Customer[]): void {
  const headers = [
    'كود العميل',
    'الاسم بالكامل',
    'الهاتف الرئيسي',
    'واتساب',
    'البريد الإلكتروني',
    'المنطقة/المحافظة',
    'الحالة',
    'أول تواصل',
    'آخر نشاط',
    'إجمالي الطلبات',
    'إجمالي الشراء',
    'إجمالي الحجوزات',
    'إجمالي الإنفاق (ج.م)',
  ];

  const rows = customers.map((c) => [
    c.id,
    `"${c.fullName.replace(/"/g, '""')}"`,
    c.primaryPhone,
    c.whatsappPhone,
    c.email,
    `"${c.address.cityArea} - ${c.address.governorate}"`,
    c.status,
    c.firstContactDate.split('T')[0],
    c.lastActivityDate.split('T')[0],
    c.totalRequests,
    c.totalPurchases,
    c.totalReservations,
    c.totalSpent,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PRO_TECK_Customers_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
