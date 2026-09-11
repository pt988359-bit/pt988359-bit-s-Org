/**
 * Enterprise Architecture - Reservation & Product Lifecycle Validator
 * TASK-002: Enterprise Inventory Reservation Engine
 */

import { ValidationError } from '../errors/DomainErrors';
import { ReservationService } from '../services/ReservationService';

export class ReservationValidator {
  /**
   * Validates that a customer can make a reservation (limit 1 active reservation per customer).
   */
  public static validateCustomerSingleReservation(customerPhone: string): void {
    if (!customerPhone || customerPhone.trim() === '') {
      throw new ValidationError('رقم الهاتف مطلوب لتأكيد الحجز');
    }

    if (ReservationService.hasActiveReservation(customerPhone)) {
      throw new ValidationError('لديك حجز نشط بالفعل. يمكن كل عميل حجز جهاز واحد فقط في نفس الوقت.', { customerPhone });
    }
  }

  /**
   * Validates duration (strictly 24 hours).
   */
  public static validateReservationDurationHours(hours: number): void {
    if (hours !== 24) {
      throw new ValidationError('مدة الحجز المعتمدة بالنظام هي 24 ساعة فقط مجاناً', { hours });
    }
  }
}
