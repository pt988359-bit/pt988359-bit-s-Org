export type OrderWorkspaceModule =
  | 'unified_requests'
  | 'purchase_requests'
  | 'reservations'
  | 'negotiations'
  | 'inquiries'
  | 'completed_sales'
  | 'cancelled'
  | 'archived'
  | 'audit_log';

export type OrderDisplayMode = 'table' | 'kanban' | 'calendar';

export type PurchaseRequestStatus =
  | 'new'
  | 'pending_review'
  | 'waiting_customer'
  | 'approved'
  | 'rejected'
  | 'converted_to_reservation'
  | 'converted_to_sale'
  | 'archived';

export type ReservationStatus =
  | 'Reserved'
  | 'Expired'
  | 'Cancelled'
  | 'Completed'
  | 'pending'
  | 'confirmed'
  | 'expired'
  | 'cancelled'
  | 'completed';

export type ReservationType =
  | 'showroom_inspection'
  | 'online_hold'
  | 'vip_hold';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'vodafone_cash'
  | 'future_gateway';

export type NegotiationStatus =
  | 'pending'
  | 'accepted'
  | 'counter_offered'
  | 'declined';

export type InquiryStatus = 'new' | 'assigned' | 'answered' | 'archived';

export type OrderPriority = 'high' | 'medium' | 'low';

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'request_created'
    | 'reservation_started'
    | 'negotiation'
    | 'showroom_visit'
    | 'purchase_completed'
    | 'invoice_issued'
    | 'status_changed'
    | 'admin_note';
  title: string;
  description: string;
  actor: string;
  referenceNumber?: string;
}

export interface NegotiationOfferHistory {
  id: string;
  timestamp: string;
  offeredBy: 'customer' | 'admin';
  amount: number;
  note: string;
}

export interface PurchaseRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerId?: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  productCode: string;
  requestedDate: string;
  status: PurchaseRequestStatus;
  assignedAdmin: string;
  priority: OrderPriority;
  notes: string;
  timeline: OrderTimelineEvent[];
  isArchived?: boolean;
}

export interface ReservationItem {
  id: string;
  reservationNumber: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  customerName: string;
  customerPhone: string;
  reservationType: ReservationType;
  durationHours: number;
  createdAt: string;
  expiresAt: string;
  remainingBalance: number;
  status: ReservationStatus;
  assignedAdmin: string;
  autoReleaseEnabled: boolean;
  timeline: OrderTimelineEvent[];
  isArchived?: boolean;
}

export interface NegotiationItem {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  productImage: string;
  originalPrice: number;
  suggestedPrice: number;
  discountAmount: number;
  discountPercent: number;
  status: NegotiationStatus;
  customerNotes: string;
  adminNotes: string;
  assignedAdmin: string;
  history: NegotiationOfferHistory[];
  updatedAt: string;
}

export interface InquiryItem {
  id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  inquiryMessage: string;
  adminResponse?: string;
  status: InquiryStatus;
  assignedAdmin: string;
  priority: OrderPriority;
  createdAt: string;
}

export interface CompletedSaleItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  productImage: string;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  invoiceNumber: string;
  completionDate: string;
  deliveryType: 'showroom_pickup' | 'home_delivery';
  assignedAdmin: string;
}

export interface OrderAuditLogEntry {
  id: string;
  timestamp: string;
  administrator: string;
  referenceNumber: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
}

export interface ProductSyncPayload {
  productId?: string;
  productTitle: string;
  newProductStatus: 'available' | 'reserved' | 'sold';
  customerHistoryUpdated: boolean;
  reservationStatusUpdated: boolean;
  invoiceStatusPrepared: boolean;
  analyticsNotified: boolean;
  systemNotificationCreated: boolean;
}
