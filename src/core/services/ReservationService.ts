/**
 * Enterprise Architecture - Reservation & Product Lifecycle Service
 * TASK-002: Enterprise Inventory Reservation Engine
 */

import { DateTimeService } from './DateTimeService';
import { IdGenerator } from './IdGenerator';
import { defaultSequenceService } from './SequenceService';
import { defaultReservationRepository } from '../repositories/OrderRepository';
import { defaultProductRepository } from '../repositories/ProductRepository';
import { EventBus } from '../events/EventBus';

export type AllowedReservationStatus = 'Reserved' | 'Expired' | 'Cancelled' | 'Completed';

export interface ReservationInfo {
  id: string;
  reservationNumber: string;
  productId: string;
  productTitle?: string;
  productPrice?: number;
  customerName: string;
  customerPhone: string;
  reservedAtISO: string;
  expiresAtISO: string;
  durationHours: number;
  status: AllowedReservationStatus;
  notes?: string;
}

export class ReservationService {
  /**
   * Check if an authenticated customer (by phone number) already has an active reservation.
   * TASK-002 Rule: One customer can reserve ONLY ONE PRODUCT at a time.
   */
  public static hasActiveReservation(customerPhone: string): boolean {
    if (!customerPhone) return false;
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const allReservations = defaultReservationRepository.findAll();

    return allReservations.some((res) => {
      const resPhone = res.customerPhone ? res.customerPhone.replace(/\D/g, '') : '';
      const isActive = res.status === 'Reserved' || (res as any).status === 'active' || (res as any).status === 'confirmed' || (res as any).status === 'pending';
      return cleanPhone === resPhone && isActive;
    });
  }

  /**
   * Create a Free Reservation (strictly 24 hours).
   * Automatically sets product status to 'reserved' (hidden from showroom).
   */
  public static createFreeReservation(payload: {
    productId: string;
    productPrice: number;
    productTitle?: string;
    productImage?: string;
    customerName: string;
    customerPhone: string;
  }): ReservationInfo {
    // TASK-002 Rule: Limit 1 reservation per customer
    if (this.hasActiveReservation(payload.customerPhone)) {
      throw new Error('لديك حجز نشط بالفعل. يمكن كل عميل حجز جهاز واحد فقط في نفس الوقت.');
    }

    const hours = 24; // Strictly 24 hours
    const reservedAt = new Date();
    const expiresAt = DateTimeService.addHours(hours, reservedAt);
    const reservationNumber = defaultSequenceService.generateNextReference('reservation');

    const reservation: ReservationInfo = {
      id: IdGenerator.generateUniqueId('res'),
      reservationNumber,
      productId: payload.productId,
      productTitle: payload.productTitle,
      productPrice: payload.productPrice,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      reservedAtISO: reservedAt.toISOString(),
      expiresAtISO: expiresAt.toISOString(),
      durationHours: hours,
      status: 'Reserved',
    };

    // Update Product Status in inventory to 'reserved' (Hold)
    const product = defaultProductRepository.findById(payload.productId);
    if (product) {
      defaultProductRepository.update(payload.productId, { status: 'reserved' });
    }

    // Save Reservation Record
    defaultReservationRepository.save({
      id: reservation.id,
      reservationNumber: reservation.reservationNumber,
      productTitle: payload.productTitle || product?.title || 'جهاز مباع/محجوز',
      productPrice: payload.productPrice || product?.price || 0,
      productImage: payload.productImage || product?.images?.[0] || '',
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      reservationType: 'online_hold',
      durationHours: 24,
      createdAt: reservation.reservedAtISO,
      expiresAt: reservation.expiresAtISO,
      remainingBalance: payload.productPrice || product?.price || 0,
      status: 'Reserved' as any,

      assignedAdmin: 'النظام الآلي',
      autoReleaseEnabled: true,
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: reservation.reservedAtISO,
          eventType: 'reservation_started',
          title: 'تثبيت الحجز المجاني (24 ساعة)',
          description: 'تم تثبيت حجز الجهاز وحجبه مؤقتاً عن المعرض لمدة 24 ساعة.',
          actor: payload.customerName,
        },
      ],
    });

    EventBus.emit({
      eventId: 'evt-' + Date.now(),
      eventName: 'ReservationCreated',
      timestamp: new Date().toISOString(),
      payload: {
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        productId: payload.productId,
        customerPhone: payload.customerPhone,
        expiresAt: reservation.expiresAtISO,
      },
    });

    return reservation;
  }

  /**
   * Converts a reservation into a sale (Complete Sale).
   * TASK-002 Rule: Reservation becomes Completed, Product becomes Sold (disappears permanently from public website).
   */
  public static completeSale(reservationId: string, adminName = 'المدير المسؤول'): void {
    const res = defaultReservationRepository.findById(reservationId);
    if (!res) return;

    defaultReservationRepository.update(reservationId, {
      status: 'Completed' as any,
      timeline: [
        ...(res.timeline || []),
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'purchase_completed',
          title: 'إتمام البيع النهائي',
          description: 'تم إتمام عملية بيع الجهاز بنجاح وتحويل الحجز إلى بيع مكتمل.',
          actor: adminName,
        },
      ],
    });

    // Mark product as 'sold'
    const products = defaultProductRepository.findAll();
    const product = products.find(p => p.title === res.productTitle || p.id === (res as any).productId);
    if (product) {
      defaultProductRepository.update(product.id, { status: 'sold' });
    }

    EventBus.emit({
      eventId: 'evt-' + Date.now(),
      eventName: 'SaleCompleted',
      timestamp: new Date().toISOString(),
      payload: {
        orderId: reservationId,
        invoiceNumber: res.reservationNumber,
        productId: product ? product.id : (res as any).productId || '',
        customerName: res.customerName,
        totalAmount: res.productPrice || 0,
      },
    });
  }

  /**
   * Cancels a reservation.
   * Product returns to 'available' status.
   */
  public static cancelReservation(reservationId: string, reason = 'إلغاء الحجز بواسطة الإدارة/العميل', adminName = 'المدير المسؤول'): void {
    const res = defaultReservationRepository.findById(reservationId);
    if (!res) return;

    defaultReservationRepository.update(reservationId, {
      status: 'Cancelled' as any,
      timeline: [
        ...(res.timeline || []),
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'status_changed',
          title: 'إلغاء الحجز',
          description: reason,
          actor: adminName,
        },
      ],
    });

    // Restore product to 'available'
    const products = defaultProductRepository.findAll();
    const product = products.find(p => p.title === res.productTitle || p.id === (res as any).productId);
    if (product) {
      defaultProductRepository.update(product.id, { status: 'available' });
    }

    EventBus.emit({
      eventId: 'evt-' + Date.now(),
      eventName: 'ReservationCancelled',
      timestamp: new Date().toISOString(),
      payload: {
        reservationId,
        productId: product ? product.id : '',
        cancelledBy: adminName,
      },
    });
  }

  /**
   * Extends a reservation duration (Admin action).
   */
  public static extendReservation(reservationId: string, additionalHours = 24, adminName = 'المدير المسؤول'): void {
    const res = defaultReservationRepository.findById(reservationId);
    if (!res) return;

    const currentExpiry = new Date(res.expiresAt || res.createdAt);
    const newExpiry = DateTimeService.addHours(additionalHours, currentExpiry);

    defaultReservationRepository.update(reservationId, {
      expiresAt: newExpiry.toISOString(),
      durationHours: (res.durationHours || 24) + additionalHours,
      timeline: [
        ...(res.timeline || []),
        {
          id: `t-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'status_changed',
          title: `تمديد مهلة الحجز +${additionalHours} ساعة`,
          description: `تم تمديد انتهاء الحجز حتى ${newExpiry.toLocaleString('ar-EG')}`,
          actor: adminName,
        },
      ],
    });

    EventBus.emit({
      eventId: 'evt-' + Date.now(),
      eventName: 'ReservationExtended',
      timestamp: new Date().toISOString(),
      payload: {
        reservationId,
        extensionHours: additionalHours,
        newExpiresAt: newExpiry.toISOString(),
      },
    });
  }

  /**
   * Checks whether a reservation is expired based on current timestamp.
   */
  public static isReservationExpired(reservation: {
    expiresAt?: string;
    expiresAtISO?: string;
    status?: string;
  }): boolean {
    const expiry = reservation.expiresAt || reservation.expiresAtISO;
    if (!expiry) return false;
    return new Date().getTime() > new Date(expiry).getTime();
  }

  /**
   * Formats remaining duration into human-readable countdown string.
   */
  public static formatRemainingTime(expiresAtISO: string): string {
    const now = new Date().getTime();
    const target = new Date(expiresAtISO).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return 'منتهي';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    if (minutes > 0) {
      return `${minutes} دقيقة و ${seconds} ثانية`;
    }
    return `${seconds} ثانية`;
  }
}
