export interface DeviceInfo {
  browser: string;
  os: string;
  deviceType: 'desktop' | 'mobile';
  userAgent: string;
}

export interface CustomerIdentity {
  id: string; // CUST-XXXXXX
  phone: string; // 01XXXXXXXXX (Egyptian 11 digits)
  email: string;
  name?: string;
  verified: boolean;
  createdAt: string;
  lastActivityAt: string;
  deviceInfo?: DeviceInfo;
}

export interface CustomerSession {
  token: string;
  customer: CustomerIdentity;
  authenticatedAt: string;
  expiresAt: string;
}

export interface CustomerRequestMetadata {
  customerId: string;
  customerPhone: string;
  customerEmail: string;
  customerName?: string;
  timestamp: string;
  deviceInfo: DeviceInfo;
  requestType: 'reservation' | 'purchase' | 'sell_device' | 'exchange' | 'negotiation' | 'inquiry' | 'warranty';
  status: string;
  adminNotes?: string;
}
