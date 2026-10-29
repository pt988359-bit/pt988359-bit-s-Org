import { BaseRepository } from './BaseRepository';
import { CustomerInfo, AuditTrailEntry } from '../../types/customerActions';

export type UnifiedRequestType =
  | 'reservation'
  | 'purchase'
  | 'negotiation'
  | 'sell_device'
  | 'trade_in'
  | 'inquiry';

export type RequestStatus =
  | 'new'
  | 'viewed'
  | 'contacted'
  | 'waiting_customer'
  | 'pending_approval'
  | 'active'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'archived';

export interface UnifiedCustomerRequest {
  id: string;
  referenceNumber: string;
  type: UnifiedRequestType;
  customer: CustomerInfo;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  finalPrice?: number;
  productImage?: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  details?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  auditTrail: AuditTrailEntry[];
  internalNotes?: string;
  adminNotes?: string;
}

export class RequestRepository extends BaseRepository<UnifiedCustomerRequest> {
  constructor() {
    super('customer_requests');
  }

  private sanitizeRequest(req: UnifiedCustomerRequest): UnifiedCustomerRequest {
    if (typeof req.productImage === 'string' && req.productImage.startsWith('data:image')) {
      return {
        ...req,
        productImage: '',
      };
    }
    return req;
  }

  public override getAll(): UnifiedCustomerRequest[] {
    return super.getAll().map((r) => this.sanitizeRequest(r));
  }

  public override async fetchLive(): Promise<UnifiedCustomerRequest[]> {
    const items = await super.fetchLive();
    return items.map((r) => this.sanitizeRequest(r));
  }

  public override save(item: UnifiedCustomerRequest): UnifiedCustomerRequest {
    return super.save(this.sanitizeRequest(item));
  }

  public override saveAll(items: UnifiedCustomerRequest[]): void {
    super.saveAll(items.map((r) => this.sanitizeRequest(r)));
  }

  public override subscribe(callback: (items: UnifiedCustomerRequest[]) => void): () => void {
    return super.subscribe((items) => {
      callback(items.map((r) => this.sanitizeRequest(r)));
    });
  }

  public createRequest(request: Omit<UnifiedCustomerRequest, 'id' | 'createdAt'>): UnifiedCustomerRequest {
    const fullRequest: UnifiedCustomerRequest = {
      id: 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...request,
    };
    this.save(fullRequest);
    return fullRequest;
  }

  public getByCustomerPhone(phone: string): UnifiedCustomerRequest[] {
    return this.getAll().filter((r) => r.customer.phone === phone || r.customer.whatsappPhone === phone);
  }

  public getByStatus(status: RequestStatus): UnifiedCustomerRequest[] {
    return this.getAll().filter((r) => r.status === status);
  }

  public addTimelineEntry(id: string, note: string, actor = 'Showroom Admin', statusOverride?: RequestStatus): UnifiedCustomerRequest | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const newTrail: AuditTrailEntry = {
      timestamp: new Date().toISOString(),
      status: (statusOverride || existing.status) as any,
      note,
      actor,
    };

    return this.update(id, {
      status: statusOverride || existing.status,
      updatedAt: new Date().toISOString(),
      auditTrail: [newTrail, ...(existing.auditTrail || [])],
    });
  }

  public updateStatus(
    id: string,
    status: RequestStatus,
    note?: string,
    actor = 'Showroom Admin',
    finalPrice?: number
  ): UnifiedCustomerRequest | null {
    const statusLabels: Record<string, string> = {
      new: 'جديد',
      viewed: 'تم الاطلاع',
      contacted: 'تم التواصل مع العميل',
      waiting_customer: 'في انتظار العميل بالمعرض',
      completed: 'مكتمل (تمت عملية البيع)',
      cancelled: 'إلغاء الطلب',
      expired: 'انتهى الحجز (24 ساعة)',
      archived: 'أرشفة الطلب',
    };

    const statusNote = note || `تغيير حالة الطلب إلى: ${statusLabels[status] || status}`;
    const result = this.addTimelineEntry(id, statusNote, actor, status);
    if (result && typeof finalPrice === 'number') {
      return this.update(id, { finalPrice, updatedAt: new Date().toISOString() });
    }
    return result;
  }

  public setFinalPrice(id: string, finalPrice: number): UnifiedCustomerRequest | null {
    return this.update(id, { finalPrice, updatedAt: new Date().toISOString() });
  }

  public bulkUpdateStatus(ids: string[], status: RequestStatus, actor = 'Showroom Admin'): number {
    let count = 0;
    ids.forEach((id) => {
      if (this.updateStatus(id, status, undefined, actor)) count++;
    });
    return count;
  }

  public bulkDelete(ids: string[]): number {
    let count = 0;
    ids.forEach((id) => {
      this.remove(id);
      count++;
    });
    return count;
  }

  // PART 3: Calculate priority score (Lower score = higher priority)
  public static calculatePriorityScore(request: UnifiedCustomerRequest): number {
    if (request.type === 'reservation') {
      const createdTime = new Date(request.createdAt).getTime();
      const expirationTime = createdTime + 24 * 3600 * 1000;
      const diffMs = expirationTime - Date.now();
      if (diffMs <= 0) return 1; // 1. Expired Reservation
      if (diffMs <= 2 * 3600 * 1000) return 2; // 2. Expires < 2 hours
      return 3;
    }
    if (request.status === 'waiting_customer') return 3; // 3. Customer waiting
    if (request.type === 'purchase') return 4; // 4. New purchase
    if (request.type === 'negotiation') return 5; // 5. Negotiation
    if (request.type === 'trade_in') return 6; // 6. Trade request
    if (request.type === 'sell_device') return 7; // 7. Sell request
    if (request.type === 'inquiry') return 8; // 8. General inquiry
    return 9;
  }
}

export const defaultRequestRepository = new RequestRepository();
