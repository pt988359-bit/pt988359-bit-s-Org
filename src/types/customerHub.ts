import { RequestAuditStatus, AuditTrailEntry } from './customerActions';

export type CustomerStatus = 'new' | 'active' | 'vip' | 'returning' | 'blocked' | 'archived';

export type PreferredContactMethod = 'whatsapp' | 'phone' | 'email';

export interface CustomerAddress {
  governorate: string;
  cityArea: string;
  streetAddress?: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  isPinned: boolean;
  author: string;
  createdAt: string;
  mentions?: string[];
}

export interface CommunicationLogEntry {
  id: string;
  type: 'whatsapp' | 'phone_call' | 'email' | 'manual_note';
  direction: 'inbound' | 'outbound';
  summary: string;
  details?: string;
  actor: string;
  timestamp: string;
  outcome?: string; // e.g. 'تم التوافق على السعر', 'لم يتم الرد', 'مهتم بالمعاينة'
  durationSeconds?: number;
}

export interface CustomerTimelineEvent {
  id: string;
  timestamp: string;
  actor: string; // e.g. 'المشرف: م. أحمد', 'العميل', 'النظام'
  eventType:
    | 'customer_created'
    | 'reservation_created'
    | 'negotiation_started'
    | 'purchase_approved'
    | 'invoice_generated'
    | 'warranty_issued'
    | 'device_sold_to_proteck'
    | 'exchange_requested'
    | 'status_changed'
    | 'note_added';
  title: string;
  description: string;
  referenceNumber?: string;
  productId?: string;
  productTitle?: string;
}

export interface SellDeviceRequest {
  id: string;
  referenceNumber: string; // e.g. SELL-2026-00001
  customer: {
    fullName: string;
    phone: string;
    whatsappPhone: string;
    email?: string;
  };
  deviceTitle: string;
  deviceBrand: string;
  deviceCategory: string;
  expectedPrice: number;
  offeredPrice?: number;
  condition: 'like_new' | 'excellent' | 'good' | 'needs_repair';
  description: string;
  images: string[];
  status: RequestAuditStatus;
  createdAt: string;
  assignedAdmin?: string;
  auditTrail: AuditTrailEntry[];
}

export interface ExchangeDeviceRequest {
  id: string;
  referenceNumber: string; // e.g. EXC-2026-00001
  customer: {
    fullName: string;
    phone: string;
    whatsappPhone: string;
    email?: string;
  };
  oldDeviceTitle: string;
  oldDeviceEstimatedValue: number;
  targetProductId: string;
  targetProductTitle: string;
  targetProductPrice: number;
  cashDifference: number; // targetProductPrice - oldDeviceEstimatedValue
  status: RequestAuditStatus;
  createdAt: string;
  assignedAdmin?: string;
  auditTrail: AuditTrailEntry[];
}

export interface CustomerDocument {
  id: string;
  documentNumber: string;
  type:
    | 'reservation_receipt'
    | 'purchase_request_receipt'
    | 'invoice'
    | 'warranty_certificate';
  title: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  productPrice: number;
  remainingAmount?: number;
  issueDate: string;
  status: string; // e.g. 'ساري', 'ملغى', 'مكتمل'
  termsAndConditions: string[];
  pdfUrl?: string;
}

export interface VisitedProduct {
  productId: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  visitedAt: string;
}

export interface Customer {
  id: string; // e.g., CUST-1001
  fullName: string;
  primaryPhone: string;
  whatsappPhone: string;
  email: string;
  address: CustomerAddress;
  preferredContactMethod: PreferredContactMethod;
  status: CustomerStatus;
  tags: string[]; // ['VIP', 'Frequent Buyer', 'Negotiates Often', 'High Value', 'Referral', 'Warranty Case', 'Blacklist']
  firstContactDate: string; // ISO
  lastActivityDate: string; // ISO
  totalRequests: number;
  totalPurchases: number;
  totalSpent: number;
  assignedAdmin?: string; // Admin name
  isArchived: boolean;
  notes: CustomerNote[];
  communicationLogs: CommunicationLogEntry[];
  timeline: CustomerTimelineEvent[];
  documents: CustomerDocument[];
  visitedProducts: VisitedProduct[];
  firebaseUid?: string;
  isDuplicateCandidate?: boolean;
  duplicateMatchedCustomerIds?: string[];
}

export type CustomerDirectoryViewMode = 'table' | 'grid' | 'compact';

export type CustomerWorkspaceTab =
  | 'overview'
  | 'purchase_requests'
  | 'reservations'
  | 'negotiations'
  | 'sell_requests'
  | 'exchange_requests'
  | 'invoices'
  | 'visited_products'
  | 'documents'
  | 'communication_history'
  | 'notes'
  | 'timeline'
  | 'ai_assistant';

export interface CustomerFilterOptions {
  searchQuery: string;
  status: string; // 'all' or CustomerStatus
  area: string; // 'all' or area name
  vipOnly: boolean;
  hasPurchasesOnly: boolean;
  archivedOnly: boolean;
}

export interface DuplicateMatchGroup {
  primaryCustomer: Customer;
  matchedCustomers: {
    customer: Customer;
    reason: 'phone_exact' | 'whatsapp_exact' | 'name_similar';
    similarityScore: number; // 0-100%
  }[];
}
