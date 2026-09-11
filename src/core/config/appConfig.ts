/**
 * Enterprise Architecture - Centralized Showroom & System Configuration
 * Phase 14.5 Refactoring
 */

import { MAGIC_NUMBERS } from './magicNumbers';

export interface ShowroomConfig {
  businessName: string;
  businessNameEn: string;
  tagline: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  instapayHandle: string;
  bankAccountIBAN: string;
  address: {
    city: string;
    area: string;
    street: string;
    fullArabic: string;
  };
  workingHours: {
    openTime: string; // e.g., "10:00 AM"
    closeTime: string; // e.g., "10:00 PM"
    workingDaysAr: string;
  };
  currency: {
    code: 'EGP';
    symbolAr: 'ج.م';
    symbolEn: 'LE';
  };
  limits: {
    defaultOpeningBalance: number;
    freeReservationHours: number;
  };
  prefixes: {
    expense: 'EXP';
    financialLedger: 'FIN';
    product: 'PRD';
    procurement: 'PROC';
    supplier: 'SUP';
    purchase: 'PUR';
    order: 'ORD';
    reservation: 'RES';
    invoice: 'INV';
  };
}

export const APP_CONFIG: ShowroomConfig = {
  businessName: 'برو تك للصيانة والأجهزة الإلكترونية',
  businessNameEn: 'PRO-TECK Appliances & Electronics',
  tagline: 'المعرض الأول للأجهزة المستعملة بحالة الزيرو والضمان المعتمد',
  phonePrimary: '01027281765',
  phoneSecondary: '01146693284',
  whatsappNumber: '201027281765',
  instapayHandle: 'proteck@instapay',
  bankAccountIBAN: 'EG890002000100000001234567890',
  address: {
    city: 'القاهرة',
    area: 'المعادي',
    street: 'شارع 68 تقاطع النصر',
    fullArabic: 'فرع المعادي - شارع 68 - القاهرة',
  },
  workingHours: {
    openTime: '10:00 ص',
    closeTime: '10:00 م',
    workingDaysAr: 'يومياً من السبت إلى الخميس (الجمعة عطلة)',
  },
  currency: {
    code: 'EGP',
    symbolAr: 'ج.م',
    symbolEn: 'LE',
  },
  limits: {
    defaultOpeningBalance: MAGIC_NUMBERS.DEFAULT_OPENING_CASH_BALANCE,
    freeReservationHours: MAGIC_NUMBERS.FREE_RESERVATION_HOURS,
  },
  prefixes: {
    expense: 'EXP',
    financialLedger: 'FIN',
    product: 'PRD',
    procurement: 'PROC',
    supplier: 'SUP',
    purchase: 'PUR',
    order: 'ORD',
    reservation: 'RES',
    invoice: 'INV',
  },
};

const getMetaEnv = (): Record<string, any> => {
  try {
    return new Function('return typeof import.meta !== "undefined" ? import.meta.env : {}')() || {};
  } catch {
    return {};
  }
};

/**
 * Environment configuration resolver
 * Never exposes secrets directly to UI components.
 */
export const ENV_CONFIG = {
  get isProduction(): boolean {
    const metaEnv = getMetaEnv();
    return Boolean(metaEnv?.PROD);
  },
  get isDevelopment(): boolean {
    const metaEnv = getMetaEnv();
    return Boolean(metaEnv?.DEV ?? true);
  },
  get hasGeminiKey(): boolean {
    const metaEnv = getMetaEnv();
    const processEnv = typeof process !== 'undefined' ? process.env : {};
    return Boolean(metaEnv?.VITE_GEMINI_API_KEY || processEnv?.GEMINI_API_KEY);
  },
  get firestoreRegion(): string {
    const metaEnv = getMetaEnv();
    return metaEnv?.VITE_FIRESTORE_REGION || 'europe-west1';
  },
};
