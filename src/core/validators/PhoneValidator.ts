/**
 * Enterprise Architecture - Phone Number & WhatsApp Validator
 * Phase 14.5 Refactoring & Enterprise Identity
 */

import { ValidationError } from '../errors/DomainErrors';

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber: string;
  errorMessage?: string;
}

export class PhoneValidator {
  /**
   * Validates Egyptian mobile phone format (010, 011, 012, 015 + 8 digits)
   */
  public static validateEgyptianPhone(phone: string): boolean {
    const cleaned = this.normalizeEgyptianPhone(phone);
    const egRegex = /^01[0125]\d{8}$/;
    return egRegex.test(cleaned);
  }

  /**
   * Detailed validation returning object for OTP & Form flows
   */
  public static validateEgyptianPhoneDetailed(phone: string): PhoneValidationResult {
    const normalizedNumber = this.normalizeEgyptianPhone(phone);
    const isValid = /^01[0125]\d{8}$/.test(normalizedNumber);
    return {
      isValid,
      normalizedNumber,
      errorMessage: isValid ? undefined : 'رقم الهاتف يجب أن يكون رقم مصري مكون من 11 رقم يبدأ بـ 01 (مثال: 01012345678)',
    };
  }

  /**
   * Normalizes Egyptian phone number string to standard 11-digit 01XXXXXXXXX format
   */
  public static normalizeEgyptianPhone(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+20')) {
      cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.startsWith('20') && cleaned.length === 12) {
      cleaned = '0' + cleaned.slice(2);
    }
    return cleaned;
  }

  /**
   * Sanitizes phone number to standard international WhatsApp format (e.g., 201004455667)
   */
  public static formatWhatsAppNumber(phone: string): string {
    let cleaned = this.normalizeEgyptianPhone(phone);
    if (cleaned.startsWith('01')) {
      cleaned = '2' + cleaned;
    }
    if (!cleaned.startsWith('20')) {
      cleaned = '20' + cleaned;
    }
    return cleaned;
  }

  public static assertValidPhone(phone: string, fieldName: string = 'رقم الهاتف'): void {
    if (!this.validateEgyptianPhone(phone)) {
      throw new ValidationError(`${fieldName} غير صحيح. يرجى إدخال رقم محمول مصري مكون من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015`, { phone });
    }
  }
}
