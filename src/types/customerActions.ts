import { ProductCondition } from './index';

export type CustomerActionType =
  | 'request_purchase'
  | 'reserve'
  | 'negotiate'
  | 'visit_showroom'
  | 'ask_question'
  | 'exchange';

export type RequestAuditStatus =
  | 'pending_approval'
  | 'pending_verification'
  | 'active'
  | 'contacted'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface AuditTrailEntry {
  timestamp: string;
  status: RequestAuditStatus;
  note?: string;
  actor?: string; // 'Customer' or 'Showroom Admin'
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  whatsappPhone: string;
  email?: string;
  governorate?: string;
  cityArea?: string;
}

// 1. Purchase Request
export interface PurchaseRequestRecord {
  id: string;
  referenceNumber: string; // e.g., PUR-2026-00001
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    warrantyAvailable?: boolean;
    condition: ProductCondition;
    image: string;
    showroomLocation?: string;
  };
  customer: CustomerInfo;
  status: RequestAuditStatus; // Default: 'pending_approval' (Pending Showroom Approval)
  createdAt: string;
  auditTrail: AuditTrailEntry[];
}

// 2. Reservation Request
export type ReservationDurationOption = '24h' | '48h' | '72h' | 'custom';

export interface ReservationRequestRecord {
  id: string;
  referenceNumber: string; // e.g., RES-2026-00001
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    image: string;
  };
  customer: CustomerInfo;
  duration: ReservationDurationOption;
  durationHours: number;
  status: RequestAuditStatus;
  createdAt: string;
  expiresAt: string;
  auditTrail: AuditTrailEntry[];
}

// 3. Negotiation Record
export interface NegotiationRequestRecord {
  id: string;
  referenceNumber: string; // e.g., NEG-2026-00001
  product: {
    id: string;
    title: string;
    originalPrice: number;
    minNegotiationPrice?: number;
    image: string;
  };
  suggestedPrice: number;
  customer: CustomerInfo;
  notes?: string;
  status: RequestAuditStatus;
  createdAt: string;
  auditTrail: AuditTrailEntry[];
}

// 4. Product Inquiry Record
export interface InquiryRequestRecord {
  id: string;
  referenceNumber: string; // e.g., INQ-2026-00001
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    image: string;
  };
  customer: CustomerInfo;
  question: string;
  status: RequestAuditStatus;
  createdAt: string;
  auditTrail: AuditTrailEntry[];
}

// Document Types
export type CustomerDocumentType =
  | 'purchase_request_receipt'
  | 'reservation_receipt'
  | 'exchange_request_receipt'
  | 'inquiry_receipt'
  | 'purchase_receipt';

export interface CustomerDocument {
  id: string;
  documentNumber: string;
  type: CustomerDocumentType;
  title: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  productPrice: number;
  remainingAmount?: number;
  issueDate: string;
  status: string;
  termsAndConditions: string[];
  metaData?: Record<string, unknown>;
}

export interface CustomerActivitySummary {
  purchaseRequests: PurchaseRequestRecord[];
  reservations: ReservationRequestRecord[];
  negotiations: NegotiationRequestRecord[];
  inquiries: InquiryRequestRecord[];
  documents: CustomerDocument[];
  favorites: string[];
  recentlyViewed: string[];
}
