/**
 * Enterprise Architecture - Document Engine & Verification Service
 * Phase 14.5 Refactoring
 */

import { APP_CONFIG } from '../config/appConfig';
import { IdGenerator } from './IdGenerator';
import { DateTimeService } from './DateTimeService';
import { defaultSequenceService } from './SequenceService';

export interface GeneratedDocument {
  documentId: string;
  referenceNumber: string;
  type: 'invoice' | 'warranty_certificate' | 'inspection_report' | 'purchase_contract';
  createdAt: string;
  qrPayload: string;
  verificationUrl: string;
}

export class DocumentService {
  public static generateInvoiceDocument(orderId: string, customerName: string, totalAmount: number): GeneratedDocument {
    const documentId = IdGenerator.generateUniqueId('doc-inv');
    const referenceNumber = defaultSequenceService.generateNextReference('invoice');
    const createdAt = DateTimeService.nowISO();

    const qrPayload = JSON.stringify({
      issuer: APP_CONFIG.businessName,
      ref: referenceNumber,
      orderId,
      customer: customerName,
      total: totalAmount,
      date: createdAt.split('T')[0],
    });

    return {
      documentId,
      referenceNumber,
      type: 'invoice',
      createdAt,
      qrPayload,
      verificationUrl: `https://proteck-app.com/verify/${referenceNumber}`,
    };
  }

  public static generateWarrantyCertificate(productId: string, customerName: string): GeneratedDocument {
    const documentId = IdGenerator.generateUniqueId('doc-war');
    const referenceNumber = IdGenerator.generateWarrantyCode(productId);
    const createdAt = DateTimeService.nowISO();

    const qrPayload = JSON.stringify({
      issuer: APP_CONFIG.businessName,
      warrantyCode: referenceNumber,
      productId,
      customer: customerName,
      warrantyAvailable: true,
    });

    return {
      documentId,
      referenceNumber,
      type: 'warranty_certificate',
      createdAt,
      qrPayload,
      verificationUrl: `https://proteck-app.com/warranty/${referenceNumber}`,
    };
  }
}
