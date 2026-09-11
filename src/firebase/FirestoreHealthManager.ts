import { LoggerService } from '../core/services/LoggerService';

export type FirestoreHealthStatus = 'online' | 'offline' | 'degraded' | 'reconnecting' | 'unavailable';

export interface FirestoreHealthState {
  status: FirestoreHealthStatus;
  isFallbackToLocal: boolean;
  lastError: Error | null;
  failureCount: number;
  lastCheckedAt: string | null;
}

export type FirestoreHealthListener = (state: FirestoreHealthState) => void;

export class FirestoreHealthManager {
  private static instance: FirestoreHealthManager;

  private state: FirestoreHealthState = {
    status: 'online',
    isFallbackToLocal: false,
    lastError: null,
    failureCount: 0,
    lastCheckedAt: new Date().toISOString(),
  };

  private listeners: Set<FirestoreHealthListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffDelayMs = 5000;
  private maxBackoffDelayMs = 60000;

  private constructor() {}

  public static getInstance(): FirestoreHealthManager {
    if (!FirestoreHealthManager.instance) {
      FirestoreHealthManager.instance = new FirestoreHealthManager();
    }
    return FirestoreHealthManager.instance;
  }

  public getState(): FirestoreHealthState {
    return { ...this.state };
  }

  public subscribe(listener: FirestoreHealthListener): () => void {
    this.listeners.add(listener);
    // Send current state immediately upon subscription
    try {
      listener(this.getState());
    } catch (e) {
      LoggerService.warn('FirestoreHealthManager', 'Error in subscriber initial notification', e);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifySubscribers(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (e) {
        LoggerService.warn('FirestoreHealthManager', 'Error notifying subscriber', e);
      }
    });
  }

  public recordSuccess(): void {
    const previousStatus = this.state.status;
    this.state.failureCount = 0;
    this.state.lastError = null;
    this.state.lastCheckedAt = new Date().toISOString();
    this.state.status = 'online';
    this.state.isFallbackToLocal = false;
    this.backoffDelayMs = 5000;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (previousStatus !== 'online') {
      LoggerService.info('FirestoreHealthManager', 'Firestore connection recovered. System status: online');
      this.notifySubscribers();
    }
  }

  public recordError(error: any, context = 'Firestore'): void {
    const errorObj = error instanceof Error ? error : new Error(String(error || 'Unknown Firestore Error'));
    const message = errorObj.message || '';
    const code = (error as any)?.code || '';

    this.state.failureCount += 1;
    this.state.lastError = errorObj;
    this.state.lastCheckedAt = new Date().toISOString();

    const isNotFound = message.includes('NOT_FOUND') || code === 'not-found' || code === 5;
    const isUnavailable = message.includes('unavailable') || code === 'unavailable';
    const isPermissionDenied = message.includes('permission') || code === 'permission-denied';

    const previousStatus = this.state.status;

    // Permission-denied or Not-Found are application/security responses from an ONLINE server.
    // They must NEVER trigger global offline fallback (isFallbackToLocal).
    if (isPermissionDenied || isNotFound) {
      this.state.status = 'online';
      this.state.isFallbackToLocal = false;
    } else if (isUnavailable || this.state.failureCount >= 3) {
      this.state.status = 'offline';
      this.state.isFallbackToLocal = true;
    } else {
      this.state.status = 'degraded';
    }

    // Non-fatal status reporting using console.warn / LoggerService.warn
    console.warn(
      `[FirestoreHealthManager] Firestore status update: ${this.state.status} (Fallback to local: ${this.state.isFallbackToLocal}, context: ${context})`
    );

    LoggerService.warn(
      'FirestoreHealthManager',
      `Firestore error recorded [${context}]. Status: ${this.state.status}, Failures: ${this.state.failureCount}, Fallback to local: ${this.state.isFallbackToLocal}`,
      errorObj
    );

    if (previousStatus !== this.state.status) {
      this.notifySubscribers();
    }

    this.scheduleReconnectCheck();
  }

  private scheduleReconnectCheck(): void {
    if (this.reconnectTimer) return;

    this.state.status = this.state.isFallbackToLocal ? 'reconnecting' : this.state.status;
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      // Exponential backoff
      this.backoffDelayMs = Math.min(this.backoffDelayMs * 2, this.maxBackoffDelayMs);
      LoggerService.info('FirestoreHealthManager', `Attempting silent health reconnect check (backoff: ${this.backoffDelayMs}ms)...`);
    }, this.backoffDelayMs);
  }

  public isFallbackToLocal(): boolean {
    return this.state.isFallbackToLocal;
  }
}

export const firestoreHealthManager = FirestoreHealthManager.getInstance();
