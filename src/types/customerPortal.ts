export interface TrackingMapEntry {
  trackingCode: string;
  phone: string;
  referenceNumber: string;
  createdAt: string;
  isInvalidated?: boolean;
}

export type PortalAuthMethod = 'tracking_code' | 'otp';

export interface CustomerPortalSession {
  phoneNumber: string;
  normalizedPhone: string;
  customerName: string;
  trackingCodes: string[];
  authenticatedAt: string;
  authMethod: PortalAuthMethod;
}

export interface PortalNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'reservation' | 'warranty' | 'message' | 'purchase' | 'system';
  isRead: boolean;
  linkRoute?: string;
  referenceNumber?: string;
}

export interface PortalSupportMessage {
  id: string;
  threadId: string;
  timestamp: string;
  sender: 'customer' | 'showroom_admin';
  senderName: string;
  message: string;
  attachments?: { name: string; url: string; size?: string }[];
}

export interface PortalCustomerDocument {
  id: string;
  type: 'reservation_receipt' | 'invoice' | 'warranty_certificate' | 'purchase_receipt';
  title: string;
  documentNumber: string;
  issueDate: string;
  relatedReference: string;
  amount?: number;
  productTitle?: string;
  customerName: string;
  customerPhone: string;
  status: string;
  details?: Record<string, any>;
}

export interface PortalCustomerWarranty {
  id: string;
  warrantyNumber: string;
  productTitle: string;
  productCode: string;
  productImage: string;
  startDate: string;
  expirationDate: string;
  durationMonths: number;
  status: 'active' | 'expiring_soon' | 'expired';
  replacementPolicy: string;
  conditions: string[];
  referenceNumber: string;
  serialNumber: string;
}

export interface PortalCustomerTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  eventType: 'request' | 'reservation' | 'purchase' | 'warranty' | 'support' | 'document';
  referenceNumber: string;
  statusBadge?: string;
  actor?: string;
}

export interface PortalSettingsState {
  phoneNumber: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'sms';
  language: 'ar' | 'en';
  notificationPreferences: {
    reservationAlerts: boolean;
    warrantyReminders: boolean;
    promotionalNotice: boolean;
  };
  futureOtpEnabled: boolean;
  otpDeliveryChannel: 'whatsapp' | 'sms' | 'email';
}
