/**
 * Enterprise Architecture - Global Error Handling & Exception Management
 * Phase 15 Enterprise Readiness
 */

import { LoggerService } from './LoggerService';

export class GlobalErrorHandler {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    window.addEventListener('error', (event) => {
      LoggerService.error('GlobalErrorHandler', 'Uncaught Window Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || event.error,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      LoggerService.warn('GlobalErrorHandler', 'Unhandled Promise Rejection caught and neutralized', {
        reason: event.reason?.message || String(event.reason || ''),
      });
      if (event.preventDefault) {
        event.preventDefault();
      }
    });

    this.isInitialized = true;
    LoggerService.info('GlobalErrorHandler', 'Global Exception & Rejection Handlers initialized');
  }
}
