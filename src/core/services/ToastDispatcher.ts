/**
 * Global Toast Dispatcher
 * Allows services and non-React modules (like LocalStorageAdapter) to trigger UI toasts.
 */

import { ToastType } from '../../types';

type ToastListener = (title: string, message?: string, type?: ToastType, duration?: number) => void;

class ToastDispatcherService {
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dispatch(title: string, message?: string, type: ToastType = 'info', duration = 4000): void {
    this.listeners.forEach((listener) => {
      try {
        listener(title, message, type, duration);
      } catch (err) {
        console.error('Failed to notify toast listener:', err);
      }
    });
  }
}

export const ToastDispatcher = new ToastDispatcherService();
