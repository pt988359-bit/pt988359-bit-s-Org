/**
 * Enterprise Architecture - Centralized ID Generator
 * Phase 14.5 Refactoring
 *
 * Replaces unstandardized `Math.random()` and ad-hoc string concatenation.
 * Supports structured sequential numbers, NanoID-style unique keys, and UUIDs.
 */

import { APP_CONFIG } from '../config/appConfig';
import { MAGIC_NUMBERS } from '../config/magicNumbers';

export type ReferencePrefix = keyof typeof APP_CONFIG.prefixes;

export class IdGenerator {
  /**
   * Generates a domain-specific reference number (e.g. EXP-2026-000005, FIN-2026-000012)
   */
  public static generateReference(prefixKey: ReferencePrefix, sequenceNumber: number): string {
    const prefix = APP_CONFIG.prefixes[prefixKey] || 'REF';
    const year = new Date().getFullYear();
    const padded = String(sequenceNumber).padStart(MAGIC_NUMBERS.REFERENCE_PADDING_LENGTH, '0');
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Generates a deterministic or nano unique identifier with custom entity prefix (e.g. exp-1722212345, prod-98210)
   */
  public static generateUniqueId(entityPrefix: string): string {
    const timestamp = Date.now().toString(36);
    let randomVal = 1000;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      randomVal = 1000 + (array[0] % 9000);
    }
    return `${entityPrefix}-${timestamp}-${randomVal.toString(36)}`;
  }

  /**
   * Generates a UUID v4 surrogate using cryptographically safe random values
   */
  public static generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    const timestamp = Date.now().toString(16);
    return `f${timestamp.slice(-7)}-0000-4000-8000-000000000000`;
  }

  /**
   * Generates invoice code (e.g. INV-2026-0419)
   */
  public static generateInvoiceNumber(seq: number): string {
    return this.generateReference('invoice', seq);
  }

  /**
   * Generates warranty code (e.g. WAR-2026-8812)
   */
  public static generateWarrantyCode(productId: string): string {
    const cleanId = productId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    const year = new Date().getFullYear();
    return `WAR-${year}-${cleanId || '8812'}`;
  }
}
