import { UnifiedCustomerRequest, RequestStatus } from '../repositories/RequestRepository';
import { Product } from '../../types';
import {
  PurchaseRequest,
  PurchaseRequestStatus,
  NegotiationItem,
  InquiryItem,
  CompletedSaleItem,
  OrderPriority,
} from '../../types/orderManagementCenter';

/**
 * Maps Unified request status to legacy PurchaseRequestStatus
 * new -> new
 * viewed -> pending_review
 * contacted -> pending_review
 * waiting_customer -> waiting_customer
 * pending_approval -> pending_review
 * active -> approved
 * approved -> approved
 * completed -> converted_to_sale
 * cancelled -> rejected
 * rejected -> rejected
 * expired -> archived
 * archived -> archived
 */
export function mapUnifiedStatusToLegacy(status: RequestStatus): PurchaseRequestStatus {
  switch (status) {
    case 'new':
      return 'new';
    case 'viewed':
    case 'contacted':
    case 'pending_approval':
      return 'pending_review';
    case 'waiting_customer':
      return 'waiting_customer';
    case 'active':
    case 'approved':
      return 'approved';
    case 'completed':
      return 'converted_to_sale';
    case 'cancelled':
    case 'rejected':
      return 'rejected';
    case 'expired':
    case 'archived':
      return 'archived';
    default:
      return 'pending_review';
  }
}

/**
 * Maps legacy status back to Unified RequestStatus
 * approved -> approved
 * rejected -> rejected
 * converted_to_sale / completed -> completed
 * archived -> archived
 * Default fallback -> waiting_customer
 */
export function mapLegacyStatusToUnified(legacyStatus: string): RequestStatus {
  switch (legacyStatus) {
    case 'new':
      return 'new';
    case 'pending_review':
      return 'contacted';
    case 'waiting_customer':
      return 'waiting_customer';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'converted_to_sale':
    case 'completed':
      return 'completed';
    case 'archived':
      return 'archived';
    default:
      return 'waiting_customer';
  }
}

/**
 * Centralized adapter converting UnifiedCustomerRequest to legacy PurchaseRequest
 */
export function mapUnifiedToLegacy(item: UnifiedCustomerRequest, products?: Product[]): PurchaseRequest {
  const priority: OrderPriority = item.priority === 'urgent' ? 'high' : (item.priority as OrderPriority) || 'medium';
  const matchedProduct = products?.find((p) => p.id === item.productId);
  const productImage = matchedProduct?.images?.[0] || item.productImage || '';

  return {
    id: item.id,
    referenceNumber: item.referenceNumber,
    customerName: item.customer?.fullName || '',
    customerPhone: item.customer?.phone || '',
    customerWhatsapp: item.customer?.whatsappPhone || item.customer?.phone || '',
    customerId: (item.customer as any)?.id || undefined,
    productTitle: item.productTitle || matchedProduct?.title || '',
    productPrice: item.productPrice || matchedProduct?.price || 0,
    productImage,
    productCode: item.productId || item.referenceNumber || '',
    requestedDate: item.createdAt || new Date().toISOString(),
    notes: item.adminNotes || item.internalNotes || '',
    priority,
    status: mapUnifiedStatusToLegacy(item.status),
    assignedAdmin: 'PRO TECK Admin',
    timeline: [],
    isArchived: item.status === 'archived',
  };
}

/**
 * Adapter converting UnifiedCustomerRequest to NegotiationItem
 */
export function mapUnifiedToNegotiation(item: UnifiedCustomerRequest, products?: Product[]): NegotiationItem {
  const matchedProduct = products?.find((p) => p.id === item.productId);
  const productImage = matchedProduct?.images?.[0] || item.productImage || '';
  const originalPrice = item.productPrice || matchedProduct?.price || 0;
  const suggestedPrice =
    item.details?.negotiationOffer ??
    item.details?.offeredPrice ??
    item.details?.budget ??
    item.finalPrice ??
    originalPrice;
  const discountAmount = Math.max(0, originalPrice - suggestedPrice);
  const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  let status: 'pending' | 'accepted' | 'counter_offered' | 'declined' = 'pending';
  if (item.details?.negotiationDecision) {
    status = item.details.negotiationDecision;
  } else if (item.status === 'approved' || item.status === 'completed') {
    status = 'accepted';
  } else if (item.status === 'rejected' || item.status === 'cancelled') {
    status = 'declined';
  }

  return {
    id: item.id,
    referenceNumber: item.referenceNumber,
    customerName: item.customer?.fullName || '',
    customerPhone: item.customer?.phone || '',
    productTitle: item.productTitle || matchedProduct?.title || '',
    productImage,
    originalPrice,
    suggestedPrice,
    discountAmount,
    discountPercent,
    status,
    customerNotes: item.details?.notes || item.details?.customerNotes || item.details?.reason || item.adminNotes || '',
    adminNotes: item.adminNotes || item.internalNotes || '',
    assignedAdmin: 'PRO TECK Admin',
    history: item.details?.history || [],
    updatedAt: item.updatedAt || item.createdAt,
  };
}

/**
 * Adapter converting UnifiedCustomerRequest to InquiryItem
 */
export function mapUnifiedToInquiry(item: UnifiedCustomerRequest, products?: Product[]): InquiryItem {
  const priority: OrderPriority = item.priority === 'urgent' ? 'high' : (item.priority as OrderPriority) || 'medium';
  const matchedProduct = products?.find((p) => p.id === item.productId);

  let status: 'new' | 'assigned' | 'answered' | 'archived' = 'new';
  if (item.status === 'archived') {
    status = 'archived';
  } else if (item.details?.adminResponse || item.status === 'completed' || item.status === 'approved' || item.status === 'contacted') {
    status = 'answered';
  }

  return {
    id: item.id,
    referenceNumber: item.referenceNumber,
    customerName: item.customer?.fullName || '',
    customerPhone: item.customer?.phone || '',
    productTitle: item.productTitle || matchedProduct?.title || '',
    inquiryMessage:
      item.details?.question ||
      item.details?.message ||
      item.details?.inquiryMessage ||
      item.details?.notes ||
      item.adminNotes ||
      'استفسار عن الجهاز والأسعار',
    adminResponse: item.details?.adminResponse || (item.status === 'contacted' ? item.adminNotes : undefined),
    status,
    assignedAdmin: 'PRO TECK Admin',
    priority,
    createdAt: item.createdAt,
  };
}

/**
 * Adapter converting UnifiedCustomerRequest to CompletedSaleItem
 */
export function mapUnifiedToCompletedSale(item: UnifiedCustomerRequest, products?: Product[]): CompletedSaleItem {
  const matchedProduct = products?.find((p) => p.id === item.productId);
  const productImage = matchedProduct?.images?.[0] || item.productImage || '';
  const finalPrice = item.finalPrice ?? item.details?.finalPrice ?? item.productPrice ?? matchedProduct?.price ?? 0;

  return {
    id: item.id,
    orderNumber: item.referenceNumber,
    customerName: item.customer?.fullName || '',
    customerPhone: item.customer?.phone || '',
    productTitle: item.productTitle || matchedProduct?.title || '',
    productImage,
    finalPrice,
    paymentMethod: item.details?.paymentMethod || 'cash',
    invoiceNumber: item.details?.invoiceNumber || `INV-${item.referenceNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
    completionDate: item.updatedAt || item.createdAt,
    deliveryType: item.details?.deliveryType || 'showroom_pickup',
    assignedAdmin: 'PRO TECK Admin',
  };
}
