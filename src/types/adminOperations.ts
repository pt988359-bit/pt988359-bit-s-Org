export type OperationHealthStatus = 'green' | 'yellow' | 'red';

export interface OperationsSummary {
  // Products
  activeProductsCount: number;
  reservedProductsCount: number;
  soldProductsCount: number;
  archivedProductsCount: number;

  // Reservations
  activeReservationsCount: number;
  expiringTodayCount: number;
  expiredReservationsCount: number;

  // Orders & Sales
  ordersTodayCount: number;
  salesTodayAmount: number;
  monthlySalesAmount: number;

  // Financials
  netProfitAmount: number;
  expensesAmount: number;
  cashBalanceAmount: number;

  // Customer Services
  newRepairRequestsCount: number;
  tradeInRequestsCount: number;
  sellDeviceRequestsCount: number;

  // Negotiations
  pendingNegotiationsCount: number;
}

export interface SystemHealthItem {
  id: string;
  name: string;
  nameAr: string;
  category: 'database' | 'storage' | 'auth' | 'network' | 'system' | 'runtime';
  status: OperationHealthStatus;
  value: string;
  details: string;
  lastChecked: string;
}

export interface FirestoreMonitorData {
  collections: {
    name: string;
    path: string;
    documentCount: number;
    estimatedSizeKb: number;
    activeListeners: number;
  }[];
  totalDocuments: number;
  realtimeListenersCount: number;
  pendingWritesCount: number;
  failedWritesCount: number;
  syncQueueCount: number;
  offlineQueueCount: number;
  retryQueueCount: number;
  lastSynchronization: string;
  connectionLatencyMs: number;
}

export interface StorageMonitorData {
  totalUsageMb: number;
  totalImagesCount: number;
  unusedImagesCount: number;
  brokenReferencesCount: number;
  orphanFilesCount: number;
  largestFiles: {
    id: string;
    name: string;
    sizeMb: number;
    url: string;
  }[];
  duplicateFilesCount: number;
  recentUploads: {
    id: string;
    name: string;
    sizeKb: number;
    uploadedAt: string;
    url: string;
  }[];
  uploadSpeedKbps: number;
  downloadSpeedKbps: number;
}

export interface VersionCenterInfo {
  currentVersion: string;
  buildDate: string;
  commitHash: string;
  environment: 'production' | 'development';
  databaseVersion: string;
  firebaseSdkVersion: string;
  applicationUptimeSeconds: number;
  nodeEnvironment: string;
}

export type AuditActionType =
  | 'admin_login'
  | 'admin_logout'
  | 'failed_login'
  | 'reservation_created'
  | 'reservation_expired'
  | 'sale_completed'
  | 'product_edited'
  | 'price_changed'
  | 'warranty_updated'
  | 'settings_changed'
  | 'ai_action';

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  action: AuditActionType;
  actor: string;
  actorRole: string;
  target: string;
  ipAddress?: string;
  device?: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export interface DiagnosticCheckItem {
  id: string;
  code: string;
  title: string;
  category: string;
  status: 'PASS' | 'WARNING' | 'ERROR';
  explanation: string;
  timestamp: string;
  metric?: string;
}
