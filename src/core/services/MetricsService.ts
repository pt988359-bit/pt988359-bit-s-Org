/**
 * Enterprise Architecture - Performance & Operations Metrics Service
 * Phase 15 Enterprise Readiness - Full Monitoring Layer
 */

export interface SystemMetrics {
  repositoryCalls: number;
  storageReads: number;
  storageWrites: number;
  transactionCount: number;
  validationFailures: number;
  aiSuggestions: number;
  eventPublishes: number;
  crashCount: number;
  businessEventsCount: number;
  totalProcessingTimeMs: number;
}

export interface BusinessEvent {
  eventName: string;
  category: 'sale' | 'reservation' | 'customer' | 'auth' | 'system';
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface CrashReport {
  id: string;
  errorName: string;
  message: string;
  stack?: string;
  timestamp: string;
}

export class MetricsService {
  private static metrics: SystemMetrics = {
    repositoryCalls: 0,
    storageReads: 0,
    storageWrites: 0,
    transactionCount: 0,
    validationFailures: 0,
    aiSuggestions: 0,
    eventPublishes: 0,
    crashCount: 0,
    businessEventsCount: 0,
    totalProcessingTimeMs: 0,
  };

  private static businessEvents: BusinessEvent[] = [];
  private static crashReports: CrashReport[] = [];

  public static trackRepositoryCall(): void {
    this.metrics.repositoryCalls++;
  }

  public static trackStorageRead(): void {
    this.metrics.storageReads++;
  }

  public static trackStorageWrite(): void {
    this.metrics.storageWrites++;
  }

  public static trackTransaction(): void {
    this.metrics.transactionCount++;
  }

  public static trackValidationFailure(): void {
    this.metrics.validationFailures++;
  }

  public static trackAISuggestion(): void {
    this.metrics.aiSuggestions++;
  }

  public static trackEventPublish(): void {
    this.metrics.eventPublishes++;
  }

  public static trackBusinessEvent(eventName: string, category: BusinessEvent['category'], payload?: Record<string, unknown>): void {
    this.metrics.businessEventsCount++;
    this.businessEvents.unshift({
      eventName,
      category,
      payload,
      timestamp: new Date().toISOString(),
    });
    if (this.businessEvents.length > 100) this.businessEvents.pop();
  }

  public static recordCrash(errorName: string, message: string, stack?: string): void {
    this.metrics.crashCount++;
    this.crashReports.unshift({
      id: 'crash-' + Date.now(),
      errorName,
      message,
      stack,
      timestamp: new Date().toISOString(),
    });
    if (this.crashReports.length > 50) this.crashReports.pop();
  }

  public static recordProcessingTime(timeMs: number): void {
    this.metrics.totalProcessingTimeMs += timeMs;
  }

  public static getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public static getBusinessEvents(): BusinessEvent[] {
    return [...this.businessEvents];
  }

  public static getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  public static reset(): void {
    this.metrics = {
      repositoryCalls: 0,
      storageReads: 0,
      storageWrites: 0,
      transactionCount: 0,
      validationFailures: 0,
      aiSuggestions: 0,
      eventPublishes: 0,
      crashCount: 0,
      businessEventsCount: 0,
      totalProcessingTimeMs: 0,
    };
    this.businessEvents = [];
    this.crashReports = [];
  }
}
