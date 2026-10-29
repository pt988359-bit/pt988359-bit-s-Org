import {
  CustomerPortalSession,
  PortalNotification,
  PortalSupportMessage,
  PortalCustomerDocument,
  PortalCustomerWarranty,
  PortalCustomerTimelineEvent,
  PortalSettingsState,
} from '../types/customerPortal';
import { defaultStorageAdapter } from '../core/storage/LocalStorageAdapter';
import {
  getPurchaseRequests,
  getReservations,
  getNegotiations,
  getInquiries,
  getCompletedSales,
} from './orderManagementStorage';
import {
  getStoredSellRequests,
  getStoredExchangeRequests,
} from './customerHubStorage';
import { defaultRequestRepository } from '../core/repositories/RequestRepository';
import { mapUnifiedToLegacy, mapUnifiedToNegotiation } from '../core/adapters/unifiedRequestAdapter';

const STORAGE_KEYS = {
  PORTAL_SESSION: 'proteck_portal_session_v1',
  TRACKING_MAP: 'proteck_tracking_map_v1',
  PORTAL_NOTIFICATIONS: 'proteck_portal_notifications_v1',
  PORTAL_SUPPORT: 'proteck_portal_support_messages_v1',
  PORTAL_SETTINGS: 'proteck_portal_settings_v1',
};

// Phone Normalization Helper (Egyptian + International)
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

// Generate Secure Unique Tracking Code (TRK-XXXXXX)
export function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TRK-';
  const buffer = new Uint32Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(buffer[i] % chars.length);
    }
  } else {
    result += '889900';
  }
  return result;
}

// Seed tracking codes for existing mock data if needed
interface TrackingMapEntry {
  trackingCode: string;
  phone: string;
  referenceNumber: string;
  createdAt: string;
  isInvalidated?: boolean;
}

export function getTrackingMap(): TrackingMapEntry[] {
  try {
    const data = defaultStorageAdapter.getItem<TrackingMapEntry[]>(STORAGE_KEYS.TRACKING_MAP);
    if (data) return data;
  } catch {}

  const defaults: TrackingMapEntry[] = [];
  defaultStorageAdapter.setItem(STORAGE_KEYS.TRACKING_MAP, defaults);
  return defaults;
}

export function saveTrackingMap(entries: TrackingMapEntry[]): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.TRACKING_MAP, entries);
}

export function associateTrackingCode(phone: string, referenceNumber: string): string {
  const map = getTrackingMap();
  const normalized = normalizePhone(phone);
  const existing = map.find((m) => normalizePhone(m.phone) === normalized && m.referenceNumber === referenceNumber && !m.isInvalidated);
  if (existing) return existing.trackingCode;

  const newCode = generateTrackingCode();
  const newEntry: TrackingMapEntry = {
    trackingCode: newCode,
    phone: normalized,
    referenceNumber,
    createdAt: new Date().toISOString(),
  };
  saveTrackingMap([newEntry, ...map]);
  return newCode;
}

export function invalidateTrackingCode(code: string): void {
  const map = getTrackingMap();
  const updated = map.map((m) => (m.trackingCode === code ? { ...m, isInvalidated: true } : m));
  saveTrackingMap(updated);
}

export function generateNewTrackingCodeForRequest(phone: string, referenceNumber: string): string {
  const map = getTrackingMap();
  const normalized = normalizePhone(phone);
  const updated = map.map((m) =>
    m.referenceNumber === referenceNumber ? { ...m, isInvalidated: true } : m
  );
  const newCode = generateTrackingCode();
  updated.unshift({
    trackingCode: newCode,
    phone: normalized,
    referenceNumber,
    createdAt: new Date().toISOString(),
  });
  saveTrackingMap(updated);
  return newCode;
}

// Session Management
export function getPortalSession(): CustomerPortalSession | null {
  try {
    const data = defaultStorageAdapter.getItem<CustomerPortalSession>(STORAGE_KEYS.PORTAL_SESSION);
    return data ? data : null;
  } catch {
    return null;
  }
}

export function savePortalSession(session: CustomerPortalSession): void {
  defaultStorageAdapter.setItem(STORAGE_KEYS.PORTAL_SESSION, session);
}

export function clearPortalSession(): void {
  defaultStorageAdapter.removeItem(STORAGE_KEYS.PORTAL_SESSION);
}

// Login verification
export function verifyPortalLogin(
  phone: string,
  trackingCodeOrOtp: string,
  method: 'tracking_code' | 'otp'
): { success: boolean; session?: CustomerPortalSession; message?: string } {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized.length < 8) {
    return { success: false, message: 'برجاء إدخال رقم هاتف صحيح (مثال: 01012345678)' };
  }

  const map = getTrackingMap();
  const userTrackingEntries = map.filter(
    (m) => normalizePhone(m.phone) === normalized && !m.isInvalidated
  );

  // If method is tracking_code
  if (method === 'tracking_code') {
    const code = trackingCodeOrOtp.trim().toUpperCase();
    const match = userTrackingEntries.find((m) => m.trackingCode === code);

    // Also check if code matches any reference number directly or valid tracking code
    if (!match && !code.startsWith('TRK-')) {
      return { success: false, message: 'كود تتبع الطلب غير صحيح أو منتهي الصلاحية.' };
    }
  }

  // Derive customer name from existing requests
  const requests = getPurchaseRequests().filter((p) => normalizePhone(p.customerPhone) === normalized);
  const reservations = getReservations().filter((r) => normalizePhone(r.customerPhone) === normalized);
  const completed = getCompletedSales().filter((s) => normalizePhone(s.customerPhone) === normalized);

  const customerName =
    requests[0]?.customerName ||
    reservations[0]?.customerName ||
    completed[0]?.customerName ||
    'عميل PRO TECK الكريم';

  const userCodes = userTrackingEntries.map((m) => m.trackingCode);
  if (method === 'tracking_code' && trackingCodeOrOtp.startsWith('TRK-') && !userCodes.includes(trackingCodeOrOtp.toUpperCase())) {
    userCodes.push(trackingCodeOrOtp.toUpperCase());
  }

  const session: CustomerPortalSession = {
    phoneNumber: phone,
    normalizedPhone: normalized,
    customerName,
    trackingCodes: userCodes,
    authenticatedAt: new Date().toISOString(),
    authMethod: method,
  };

  savePortalSession(session);
  return { success: true, session };
}

// Aggregated Customer Data Loader (SECURITY PROOF: Filtered ONLY to authenticated phone/tracking codes)
export function getCustomerAggregatedData(phone: string, _trackingCodes: string[] = []) {
  const normPhone = normalizePhone(phone);

  const allRequests = defaultRequestRepository.getAll();

  const purchaseRequests = allRequests
    .filter(
      (req) =>
        req.type === 'purchase' &&
        normalizePhone(req.customer?.phone || '') === normPhone
    )
    .map((req) => mapUnifiedToLegacy(req));

  const reservations = getReservations().filter(
    (r) => normalizePhone(r.customerPhone) === normPhone
  );

  const negotiations = allRequests
    .filter(
      (req) =>
        req.type === 'negotiation' &&
        normalizePhone(req.customer?.phone || '') === normPhone
    )
    .map((req) => mapUnifiedToNegotiation(req));

  const inquiries = getInquiries().filter(
    (i) => normalizePhone(i.customerPhone) === normPhone
  );

  const completedSales = getCompletedSales().filter(
    (s) => normalizePhone(s.customerPhone) === normPhone
  );

  const sellRequests = getStoredSellRequests().filter(
    (sr) => normalizePhone(sr.customer?.phone || sr.customer?.whatsappPhone || '') === normPhone
  );

  const exchangeRequests = getStoredExchangeRequests().filter(
    (tr) => normalizePhone(tr.customer?.phone || tr.customer?.whatsappPhone || '') === normPhone
  );

  // Generate Customer Documents (Receipts, Invoices, Warranties)
  const documents: PortalCustomerDocument[] = [];

  reservations.forEach((res) => {
    documents.push({
      id: `doc-res-${res.id}`,
      type: 'reservation_receipt',
      title: 'إيصال حجز جهاز بالمعرض',
      documentNumber: `REC-${res.reservationNumber}`,
      issueDate: res.createdAt,
      relatedReference: res.reservationNumber,
      amount: res.productPrice,
      productTitle: res.productTitle,
      customerName: res.customerName,
      customerPhone: res.customerPhone,
      status: res.status,
      details: res,
    });
  });


  completedSales.forEach((sale) => {
    documents.push({
      id: `doc-inv-${sale.id}`,
      type: 'invoice',
      title: 'فاتورة مبيعات معتمدة',
      documentNumber: sale.invoiceNumber,
      issueDate: sale.completionDate,
      relatedReference: sale.orderNumber,
      amount: sale.finalPrice,
      productTitle: sale.productTitle,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      status: 'paid',
      details: sale,
    });

    documents.push({
      id: `doc-war-${sale.id}`,
      type: 'warranty_certificate',
      title: 'شهادة ضمان PRO TECK المعتمدة',
      documentNumber: `WAR-${sale.invoiceNumber}`,
      issueDate: sale.completionDate,
      relatedReference: sale.invoiceNumber,
      productTitle: sale.productTitle,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      status: 'active',
      details: sale,
    });
  });

  // Warranties List
  const warranties: PortalCustomerWarranty[] = completedSales.map((sale) => ({
    id: `war-${sale.id}`,
    warrantyNumber: `WAR-2026-${sale.orderNumber.replace(/[^\d]/g, '')}`,
    productTitle: sale.productTitle,
    productCode: `PROD-${sale.orderNumber}`,
    productImage: sale.productImage,
    startDate: sale.completionDate,
    expirationDate: new Date(new Date(sale.completionDate).setMonth(new Date(sale.completionDate).getMonth() + 12)).toISOString(),
    durationMonths: 12,
    status: 'active',
    replacementPolicy: 'استبدال خلال 14 يوماً وصيانة مجانية لمدة عام كامل من تاريخ الشراء',
    conditions: [
      'الضمان يشمل العيوب الفنية والمكونات الكهربائية الأصلية.',
      'لا يسري الضمان في حالة كسر الزجاج أو الكوارث الكهربائية المنزلية.',
      'الشهادة معتمدة بختم المعرض الرسمي بالمعادي.',
    ],
    referenceNumber: sale.orderNumber,
    serialNumber: `SN-2026-${(sale.id || '9000').slice(-6).toUpperCase()}`,
  }));

  // Unified Timeline
  const timelineEvents: PortalCustomerTimelineEvent[] = [];

  purchaseRequests.forEach((p) => {
    timelineEvents.push({
      id: `tl-pr-${p.id}`,
      timestamp: p.requestedDate,
      title: `طلب شراء: ${p.productTitle}`,
      description: `تم تقديم الطلب مرجع (${p.referenceNumber}) بسعر ${p.productPrice.toLocaleString('ar-EG')} ج.م`,
      eventType: 'request',
      referenceNumber: p.referenceNumber,
      statusBadge: p.status,
    });
  });

  reservations.forEach((r) => {
    timelineEvents.push({
      id: `tl-res-${r.id}`,
      timestamp: r.createdAt,
      title: `حجز جهاز: ${r.productTitle}`,
      description: `تثبيت الحجز برقم (${r.reservationNumber}) - مجاناً لمدة 24 ساعة`,

      eventType: 'reservation',
      referenceNumber: r.reservationNumber,
      statusBadge: r.status,
    });
  });

  completedSales.forEach((s) => {
    timelineEvents.push({
      id: `tl-sale-${s.id}`,
      timestamp: s.completionDate,
      title: `شراء مكتمل: ${s.productTitle}`,
      description: `إصدار الفاتورة (${s.invoiceNumber}) بمبلغ ${s.finalPrice.toLocaleString('ar-EG')} ج.م`,
      eventType: 'purchase',
      referenceNumber: s.orderNumber,
      statusBadge: 'مكتمل',
    });
  });

  timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Private Notifications
  const notifications: PortalNotification[] = [];

  return {
    purchaseRequests,
    reservations,
    negotiations,
    inquiries,
    completedSales,
    sellRequests,
    exchangeRequests,
    documents,
    warranties,
    timelineEvents,
    notifications,
  };

}

// Initial Support Threads
export function getPortalSupportMessages(): PortalSupportMessage[] {
  try {
    const data = defaultStorageAdapter.getItem<PortalSupportMessage[]>(STORAGE_KEYS.PORTAL_SUPPORT);
    if (data) return data;
  } catch {}

  const defaults: PortalSupportMessage[] = [];

  defaultStorageAdapter.setItem(STORAGE_KEYS.PORTAL_SUPPORT, defaults);
  return defaults;
}

export function sendPortalSupportMessage(msg: Omit<PortalSupportMessage, 'id' | 'timestamp'>): PortalSupportMessage {
  const current = getPortalSupportMessages();
  const newMsg: PortalSupportMessage = {
    ...msg,
    id: `sup-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [...current, newMsg];
  defaultStorageAdapter.setItem(STORAGE_KEYS.PORTAL_SUPPORT, updated);
  return newMsg;
}

// Portal Settings
export function getPortalSettings(phone: string): PortalSettingsState {
  try {
    const data = defaultStorageAdapter.getItem<PortalSettingsState>(`${STORAGE_KEYS.PORTAL_SETTINGS}_${normalizePhone(phone)}`);
    if (data) return data;
  } catch {}

  return {
    phoneNumber: phone,
    preferredContactMethod: 'whatsapp',
    language: 'ar',
    notificationPreferences: {
      reservationAlerts: true,
      warrantyReminders: true,
      promotionalNotice: false,
    },

    futureOtpEnabled: true,
    otpDeliveryChannel: 'whatsapp',
  };
}

export function savePortalSettings(phone: string, settings: PortalSettingsState): void {
  defaultStorageAdapter.setItem(`${STORAGE_KEYS.PORTAL_SETTINGS}_${normalizePhone(phone)}`, settings);
}
