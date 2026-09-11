/**
 * Enterprise Architecture - Reservation Expiration Service
 * TASK-002: Automatic Expiration & Inventory Restoration Engine
 */

import { defaultReservationRepository } from '../repositories/OrderRepository';
import { defaultProductRepository } from '../repositories/ProductRepository';
import { ReservationItem } from '../../types/orderManagementCenter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { EventBus } from '../events/EventBus';

export class ReservationExpirationService {
  private static timerId: any = null;
  private static isRunning = false;

  /**
   * Evaluates all reservations and processes expired ones.
   * Restores product status to 'available' and sets reservation status to 'Expired'.
   */
  public static processExpiredReservations(): { expiredCount: number; restoredProductIds: string[] } {
    const now = new Date();
    const restoredProductIds: string[] = [];
    let expiredCount = 0;

    try {
      // 1. Get all active/reserved reservations
      const allReservations = defaultReservationRepository.findAll();
      let reservationsChanged = false;

      const updatedReservations = allReservations.map((res) => {
        const isCurrentlyActive = res.status === 'Reserved' || res.status === 'pending' || res.status === 'confirmed' || (res as any).status === 'active';
        
        if (isCurrentlyActive && res.expiresAt) {
          const expirationDate = new Date(res.expiresAt);
          if (now.getTime() >= expirationDate.getTime()) {
            // Reservation expired!
            expiredCount++;
            reservationsChanged = true;

            // Find matching product and restore to 'available'
            const allProducts = defaultProductRepository.findAll();
            const matchingProduct = allProducts.find(
              (p) => p.title === res.productTitle || (p as any).id === (res as any).productId
            );

            if (matchingProduct) {
              defaultProductRepository.update(matchingProduct.id, { status: 'available' });
              restoredProductIds.push(matchingProduct.id);
            }

            // Return updated reservation with status 'Expired'
            return {
              ...res,
              status: 'Expired' as const,
              timeline: [
                ...(res.timeline || []),
                {
                  id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  timestamp: now.toISOString(),
                  eventType: 'status_changed' as const,
                  title: 'انتهاء مهلة الحجز آلياً',
                  description: 'انتهت فترة الحجز (24 ساعة) دون إتمام البيع. تم إرجاع الجهاز للملاحة في المعرض آلياً.',
                  actor: 'مُحرك الانتهاء الآلي',
                },
              ],
            };
          }
        }
        return res;
      });

      if (reservationsChanged) {
        defaultReservationRepository.saveAll(updatedReservations);
        EventBus.emit({
          eventId: 'evt-' + Date.now(),
          eventName: 'ReservationExpired',
          timestamp: new Date().toISOString(),
          payload: { expiredCount, restoredProductIds },
        });
      }

      // Also handle localStorage keys directly for legacy compatibility
      const legacyKey = 'proteck_reservations_v1';
      const storedLegacy = defaultStorageAdapter.getItem<ReservationItem[]>(legacyKey);
      if (storedLegacy && Array.isArray(storedLegacy)) {
        let legacyChanged = false;
        const legacyUpdated = storedLegacy.map((res) => {
          const isCurrentlyActive = res.status === 'Reserved' || res.status === 'pending' || res.status === 'confirmed' || (res as any).status === 'active';
          if (isCurrentlyActive && res.expiresAt && now.getTime() >= new Date(res.expiresAt).getTime()) {
            legacyChanged = true;
            return { ...res, status: 'Expired' as const };
          }
          return res;
        });

        if (legacyChanged) {
          defaultStorageAdapter.setItem(legacyKey, legacyUpdated);
        }
      }
    } catch (err) {
      console.error('[ReservationExpirationService] Error processing expirations:', err);
    }

    return { expiredCount, restoredProductIds };
  }

  /**
   * Starts automatic periodic expiration check (runs every 10 seconds).
   */
  public static startScheduler(intervalMs = 10000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run immediately once
    this.processExpiredReservations();

    // Schedule interval
    this.timerId = setInterval(() => {
      this.processExpiredReservations();
    }, intervalMs);
  }

  /**
   * Stops the automatic scheduler.
   */
  public static stopScheduler(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }
}
