import { LoggerService } from './LoggerService';
import { supabase } from '../../supabase/client';

export type NotificationChannel = 'in_app' | 'whatsapp' | 'sms' | 'email';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipientPhone?: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private static notifications: AppNotification[] = [];

  /**
   * Send a notification through abstraction channel.
   * Default mode is in_app; ready for WhatsApp Cloud API, SMS, or Email integrations.
   */
  public static async sendNotification(payload: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
    const notification: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      read: false,
      ...payload,
    };

    this.notifications.unshift(notification);
    LoggerService.info('NotificationService', `Notification created [${notification.channel}]: ${notification.title}`);

    // Future extension point for WhatsApp Cloud API / SMS / Email integrations
    switch (notification.channel) {
      case 'whatsapp':
        // WhatsApp API webhook / provider dispatch stub
        LoggerService.info('NotificationService', `[WhatsApp API Stub] Dispatching to ${notification.recipientPhone}`);
        break;
      case 'sms':
        // SMS provider dispatch stub
        LoggerService.info('NotificationService', `[SMS API Stub] Dispatching to ${notification.recipientPhone}`);
        break;
      case 'email':
        // Email provider dispatch stub
        LoggerService.info('NotificationService', `[Email API Stub] Dispatching to ${notification.recipientEmail}`);
        break;
      case 'in_app':
      default:
        // Already recorded in memory / local store
        try {
          const derivedType =
            payload.title.includes('طلب شراء') ? 'purchase' :
            payload.title.includes('تفاوض') ? 'negotiation' :
            payload.title.includes('استبدال') ? 'trade_in' : 'system_alert';
          const derivedPriority =
            derivedType === 'purchase' || derivedType === 'trade_in' ? 'high' :
            derivedType === 'negotiation' ? 'medium' : 'medium';
          void Promise.resolve(
            supabase
              .from('notifications')
              .insert({
                type: derivedType,
                priority: derivedPriority,
                title: payload.title,
                message: payload.message,
                reference_number: payload.metadata?.referenceNumber || null,
                state: 'unread',
                is_read: false,
                data: payload.metadata || {},
                created_at: new Date().toISOString(),
              })
          ).catch(() => {});
        } catch { /* silent — never break the app flow */ }
        break;
    }

    return notification;
  }

  public static getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public static markAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
  }
}
