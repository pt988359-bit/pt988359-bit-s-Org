/**
 * Enterprise Architecture - Centralized EventBus
 * Phase 14.7 Architecture Hardening
 *
 * Facilitates loose coupling via Publish-Subscribe pattern.
 */

import { DomainEvent } from './DomainEvents';
import { LoggerService } from '../services/LoggerService';
import { MetricsService } from '../services/MetricsService';

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private static handlers = new Map<string, EventHandler[]>();

  public static subscribe<T extends DomainEvent>(eventName: T['eventName'], handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    const list = this.handlers.get(eventName)!;
    list.push(handler as EventHandler);

    LoggerService.debug('EventBus', `Subscribed handler to domain event: ${eventName}`);

    return () => this.unsubscribe(eventName, handler as EventHandler);
  }

  public static unsubscribe(eventName: string, handler: EventHandler): void {
    const list = this.handlers.get(eventName);
    if (list) {
      this.handlers.set(
        eventName,
        list.filter((h) => h !== handler)
      );
      LoggerService.debug('EventBus', `Unsubscribed handler from domain event: ${eventName}`);
    }
  }

  public static publish<T extends DomainEvent>(event: T): void {
    MetricsService.trackEventPublish();
    LoggerService.info('EventBus', `Publishing Domain Event [${event.eventName}]`, event.payload);

    const list = this.handlers.get(event.eventName);
    if (list && list.length > 0) {
      list.forEach((handler) => {
        try {
          const result = handler(event);
          if (result && typeof (result as Promise<void>).catch === 'function') {
            (result as Promise<void>).catch((error) => {
              LoggerService.warn('EventBus', `Async error in event handler [${event.eventName}]`, error);
            });
          }
        } catch (error) {
          LoggerService.warn('EventBus', `Error executing handler for event: ${event.eventName}`, error);
        }
      });
    }
  }

  public static emit<T extends DomainEvent>(event: T): void {
    this.publish(event);
  }

  public static clearAll(): void {
    this.handlers.clear();
  }
}
