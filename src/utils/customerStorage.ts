import {
  PurchaseRequestRecord,
  ReservationRequestRecord,
  NegotiationRequestRecord,
  InquiryRequestRecord,
  CustomerDocument,
  CustomerActivitySummary,
} from '../types/customerActions';
import { firestoreStorageAdapter } from '../core/storage/FirestoreStorageAdapter';
import { defaultCustomerActivityRepository } from '../core/repositories/CustomerRepository';
import { LoggerService } from '../core/services/LoggerService';
import { IdGenerator } from '../core/services/IdGenerator';
import { normalizePhoneForMatching } from './customerStats';

const STORAGE_KEY = 'proteck_customer_activity_v1';
const FAVORITES_KEY = 'proteck_favorites_v1';
const RECENTLY_VIEWED_KEY = 'proteck_recently_viewed_v1';

// Initial Empty State
function getInitialActivity(): CustomerActivitySummary {
  return {
    purchaseRequests: [],
    reservations: [],
    negotiations: [],
    inquiries: [],
    documents: [],
    favorites: [],
    recentlyViewed: [],
  };
}

export function getCustomerActivity(customerPhone?: string): CustomerActivitySummary {
  const normalized = normalizePhoneForMatching(customerPhone);
  if (!normalized) {
    LoggerService.warn('customerStorage', 'getCustomerActivity called with empty or invalid customerPhone');
    return getInitialActivity();
  }
  const activityId = `activity-${normalized}`;
  const storageKey = `${STORAGE_KEY}_${normalized}`;
  try {
    const repoItem = defaultCustomerActivityRepository.getById(activityId);
    if (repoItem) {
      return {
        purchaseRequests: repoItem.purchaseRequests || [],
        reservations: repoItem.reservations || [],
        negotiations: repoItem.negotiations || [],
        inquiries: repoItem.inquiries || [],
        documents: repoItem.documents || [],
        favorites: getFavorites(),
        recentlyViewed: getRecentlyViewed(),
      };
    }
    const parsed = firestoreStorageAdapter.getItem<CustomerActivitySummary>(storageKey);
    if (!parsed) return getInitialActivity();
    return {
      purchaseRequests: parsed.purchaseRequests || [],
      reservations: parsed.reservations || [],
      negotiations: parsed.negotiations || [],
      inquiries: parsed.inquiries || [],
      documents: parsed.documents || [],
      favorites: getFavorites(),
      recentlyViewed: getRecentlyViewed(),
    };
  } catch (e) {
    LoggerService.error('customerStorage', `Failed to read customer activity from storage for ${activityId}`, e);
    return getInitialActivity();
  }
}

function saveCustomerActivity(customerPhone: string, data: CustomerActivitySummary): void {
  const normalized = normalizePhoneForMatching(customerPhone);
  if (!normalized) {
    LoggerService.warn('customerStorage', 'saveCustomerActivity skipped: empty or invalid customerPhone');
    return;
  }
  const activityId = `activity-${normalized}`;
  const storageKey = `${STORAGE_KEY}_${normalized}`;
  try {
    firestoreStorageAdapter.setItem(storageKey, data);
    defaultCustomerActivityRepository.save({ id: activityId, ...data });
  } catch (e) {
    LoggerService.error('customerStorage', `Failed to save customer activity to storage for ${activityId}`, e);
  }
}

// Generate Reference Numbers with Year prefix
export function generateReferenceNumber(prefix: 'PUR' | 'RES' | 'NEG' | 'INQ' | 'EXC' | 'DOC'): string {
  const year = new Date().getFullYear();
  const uniqueCode = IdGenerator.generateUniqueId(prefix.toLowerCase()).slice(-5).toUpperCase();
  return `${prefix}-${year}-${uniqueCode}`;
}

// 1. Purchase Request
export function savePurchaseRequest(req: PurchaseRequestRecord): CustomerDocument {
  const phone = req.customer?.phone || '';
  const activity = getCustomerActivity(phone);
  activity.purchaseRequests.unshift(req);

  const doc: CustomerDocument = {
    id: 'doc-' + Date.now(),
    documentNumber: `DOC-${req.referenceNumber}`,
    type: 'purchase_request_receipt',
    title: 'إشعار طلب شراء جهاز من المعرض',
    referenceNumber: req.referenceNumber,
    customerName: req.customer.fullName,
    customerPhone: req.customer.phone,
    productTitle: req.product.title,
    productPrice: req.product.price,
    issueDate: new Date().toISOString(),
    status: 'بانتظار موافقة المعرض والمعاينة',
    termsAndConditions: [
      'هذا الطلب هو إبداء رغبة بالشراء ولا يمثل عقداً نائياً إلا بعد المعاينة وسداد القيمة.',
      'حق المعاينة والتجربة المباشرة مكفول بالكامل داخل معرض PRO TECK بالمعادي.',
      'سيتم الاحتفاظ بالجهاز لمدة 24 ساعة كمهلة استلام.',
    ],
  };

  activity.documents.unshift(doc);
  saveCustomerActivity(phone, activity);
  return doc;
}

// 2. Reservation Request (Free 24 Hours)
export function saveReservationRequest(req: ReservationRequestRecord): CustomerDocument {
  const phone = req.customer?.phone || '';
  const activity = getCustomerActivity(phone);
  activity.reservations.unshift(req);

  const doc: CustomerDocument = {
    id: 'doc-' + Date.now(),
    documentNumber: `DOC-${req.referenceNumber}`,
    type: 'reservation_receipt',
    title: 'وثيقة حجز جهاز (مجاني 24 ساعة)',
    referenceNumber: req.referenceNumber,
    customerName: req.customer.fullName,
    customerPhone: req.customer.phone,
    productTitle: req.product.title,
    productPrice: req.product.price,
    remainingAmount: req.product.price,
    issueDate: new Date().toISOString(),
    status: 'حجز نشط 24 ساعة',
    termsAndConditions: [
      'مدة الحجز المعتمدة: 24 ساعة من تاريخ الصدور.',
      'الحجز مجاني بالكامل وبدون أي دفع إلكتروني أو مصاريف حجز.',
      'يتم إخفاء الجهاز من الموقع وإيقاف حجزه لعملاء آخرين خلال الـ 24 ساعة.',
      'ينتهي الحجز تلقائياً وتعاد إتاحة الجهاز للجميع إذا لم يتم الشراء خلال الـ 24 ساعة.',
    ],
  };

  activity.documents.unshift(doc);
  saveCustomerActivity(phone, activity);
  return doc;
}

// 3. Negotiation Request
export function saveNegotiationRequest(neg: NegotiationRequestRecord): CustomerDocument {
  const phone = neg.customer?.phone || '';
  const activity = getCustomerActivity(phone);
  activity.negotiations.unshift(neg);

  const doc: CustomerDocument = {
    id: 'doc-' + Date.now(),
    documentNumber: `DOC-${neg.referenceNumber}`,
    type: 'purchase_request_receipt',
    title: 'طلب تفاوض واقتراح سعر لشراء جهاز',
    referenceNumber: neg.referenceNumber,
    customerName: neg.customer.fullName,
    customerPhone: neg.customer.phone,
    productTitle: neg.product.title,
    productPrice: neg.product.originalPrice,
    issueDate: new Date().toISOString(),
    status: 'مرفوع لإدارة المعرض للمراجعة',
    termsAndConditions: [
      'العرض المقدم يعتبر اقتراحاً من العميل وخاضع لموافقة مسؤول المبيعات بالمعرض.',
      'سيتم الرد بالقبول أو العرض المقابل خلال ساعات العمل الرسمية.',
    ],
  };

  activity.documents.unshift(doc);
  saveCustomerActivity(phone, activity);
  return doc;
}

// 4. Inquiry Request
export function saveInquiryRequest(inq: InquiryRequestRecord): CustomerDocument {
  const phone = inq.customer?.phone || '';
  const activity = getCustomerActivity(phone);
  activity.inquiries.unshift(inq);

  const doc: CustomerDocument = {
    id: 'doc-' + Date.now(),
    documentNumber: `DOC-${inq.referenceNumber}`,
    type: 'inquiry_receipt',
    title: 'بطاقة استفسار فني مباشر',
    referenceNumber: inq.referenceNumber,
    customerName: inq.customer.fullName,
    customerPhone: inq.customer.phone,
    productTitle: inq.product.title,
    productPrice: inq.product.price,
    issueDate: new Date().toISOString(),
    status: 'تم توجيهه لفريق الدعم الفني',
    termsAndConditions: [
      'فريق المبيعات والدعم الفني متواجد يومياً من 10 صباحاً إلى 10 مساءً للرد المباشر.',
    ],
  };

  activity.documents.unshift(doc);
  saveCustomerActivity(phone, activity);
  return doc;
}

// Favorites & Recently Viewed
export function getFavorites(): string[] {
  try {
    const raw = firestoreStorageAdapter.getItem<string[]>(FAVORITES_KEY);
    return raw || [];
  } catch {
    return [];
  }
}

export function toggleFavoriteInStorage(productId: string): string[] {
  const current = getFavorites();
  const exists = current.includes(productId);
  const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
  try {
    firestoreStorageAdapter.setItem(FAVORITES_KEY, updated);
  } catch (e) {
    LoggerService.error('customerStorage', 'Failed to update favorites in storage', e);
  }
  return updated;
}

export function getRecentlyViewed(): string[] {
  try {
    const raw = firestoreStorageAdapter.getItem<string[]>(RECENTLY_VIEWED_KEY);
    return raw || [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedInStorage(productId: string): string[] {
  const current = getRecentlyViewed().filter((id) => id !== productId);
  const updated = [productId, ...current].slice(0, 10);
  try {
    firestoreStorageAdapter.setItem(RECENTLY_VIEWED_KEY, updated);
  } catch (e) {
    LoggerService.error('customerStorage', 'Failed to update recently viewed in storage', e);
  }
  return updated;
}
