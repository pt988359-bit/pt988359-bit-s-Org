export type NotificationType =
  | 'purchase_request'
  | 'reservation'
  | 'negotiation'
  | 'sell_request'
  | 'exchange_request'
  | 'ai_suggestion'
  | 'system_alert'
  | 'invoice'
  | 'payment'
  | 'product_warning'
  | 'reservation_expiring'
  | 'low_stock';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationState = 'unread' | 'read' | 'archived' | 'snoozed';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceNumber?: string;
  priority: NotificationPriority;
  state: NotificationState;
  timestamp: string;
  linkRoute?: string;
  metadata?: Record<string, unknown>;
}

export type ApprovalType =
  | 'purchase_request'
  | 'reservation'
  | 'negotiation'
  | 'sell_request'
  | 'exchange_request'
  | 'ai_suggestion'
  | 'manual_adjustment';

export type ApprovalPriority = 'critical' | 'high' | 'medium' | 'low';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  relatedProductTitle?: string;
  relatedProductId?: string;
  amount?: number;
  description: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'critical';
export type ActivityCategory =
  | 'login'
  | 'logout'
  | 'product_change'
  | 'reservation_update'
  | 'payment_update'
  | 'invoice_creation'
  | 'ai_suggestion'
  | 'system_change'
  | 'customer_action';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  category: ActivityCategory;
  referenceNumber?: string;
  description: string;
  severity: ActivitySeverity;
  ipAddress?: string;
}

export type RecentItemType = 'product' | 'invoice' | 'customer' | 'request' | 'category';

export interface RecentWorkItem {
  id: string;
  type: RecentItemType;
  title: string;
  subtitle: string;
  timestamp: string;
  route: string;
  routeParams?: Record<string, string>;
}

export type DraftType = 'product' | 'category' | 'invoice' | 'ai_content' | 'settings';

export interface AdminDraft {
  id: string;
  type: DraftType;
  title: string;
  data: Record<string, unknown>;
  updatedAt: string;
  autoSaved: boolean;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface FailedLoginAttempt {
  id: string;
  timestamp: string;
  email: string;
  ipAddress: string;
  device: string;
  reason: string;
}

export interface ServiceHealthStatus {
  name: string;
  key: 'database' | 'ai_service' | 'whatsapp' | 'instapay' | 'storage' | 'api' | 'email';
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  latencyMs: number;
  lastChecked: string;
  details: string;
}
