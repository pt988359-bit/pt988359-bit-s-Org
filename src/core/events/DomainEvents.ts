/**
 * Enterprise Architecture - Domain Events Definition
 * Phase 14.7 Architecture Hardening
 */

export interface BaseDomainEvent<TName extends string, TPayload> {
  eventId: string;
  eventName: TName;
  timestamp: string;
  payload: TPayload;
}

export type ExpenseCreatedEvent = BaseDomainEvent<'ExpenseCreated', {
  expenseId: string;
  referenceNumber: string;
  category: string;
  amount: number;
  description: string;
  createdBy: string;
}>;

export type ReservationApprovedEvent = BaseDomainEvent<'ReservationApproved', {
  reservationId: string;
  reservationNumber: string;
  productId: string;
  customerName: string;
}>;

export type SaleCompletedEvent = BaseDomainEvent<'SaleCompleted', {
  orderId: string;
  invoiceNumber: string;
  productId: string;
  customerName: string;
  totalAmount: number;
}>;

export type WarrantyActivatedEvent = BaseDomainEvent<'WarrantyActivated', {
  warrantyCode: string;
  productId: string;
  customerName: string;
}>;

export type NegotiationAcceptedEvent = BaseDomainEvent<'NegotiationAccepted', {
  productId: string;
  originalPrice: number;
  offeredPrice: number;
  discountPercent: number;
  approvedBy: string;
}>;

export type ReservationCreatedEvent = BaseDomainEvent<'ReservationCreated', {
  reservationId: string;
  reservationNumber: string;
  productId: string;
  customerPhone: string;
  expiresAt: string;
}>;

export type ReservationExpiredEvent = BaseDomainEvent<'ReservationExpired', {
  reservationId?: string;
  expiredCount?: number;
  restoredProductIds?: string[];
}>;

export type ReservationCancelledEvent = BaseDomainEvent<'ReservationCancelled', {
  reservationId: string;
  productId: string;
  cancelledBy: string;
}>;

export type ReservationExtendedEvent = BaseDomainEvent<'ReservationExtended', {
  reservationId: string;
  extensionHours: number;
  newExpiresAt: string;
}>;

export type DomainEvent =
  | ExpenseCreatedEvent
  | ReservationApprovedEvent
  | SaleCompletedEvent
  | WarrantyActivatedEvent
  | NegotiationAcceptedEvent
  | ReservationCreatedEvent
  | ReservationExpiredEvent
  | ReservationCancelledEvent
  | ReservationExtendedEvent;
