/**
 * Enterprise Architecture - Business Settings Repository
 * Phase 14.7 Architecture Hardening
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';

export interface BusinessSettingsRecord {
  id: string; // 'showroom_settings'
  businessName: string;
  businessNameEn: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  whatsappNumberSecondary?: string;
  facebookUrl?: string;
  instapayRecipient: string;
  instapayNumber: string;
  instapayHandle: string;
  workingHoursAr: string;
  addressAr: string;
  updatedAt: string;
}

const SETTINGS_KEY = FIRESTORE_COLLECTIONS.SHOWROOM_SETTINGS;

export class SettingsRepository extends BaseRepository<BusinessSettingsRecord> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(SETTINGS_KEY, storage);
  }

  public getSettings(): BusinessSettingsRecord {
    const existing = this.getById('showroom_settings');
    if (existing) return existing;

    const defaultSettings: BusinessSettingsRecord = {
      id: 'showroom_settings',
      businessName: BUSINESS_CONFIG.name,
      businessNameEn: BUSINESS_CONFIG.name + ' Electronics',
      phonePrimary: BUSINESS_CONFIG.phone,
      phoneSecondary: BUSINESS_CONFIG.secondaryPhone,
      whatsappNumber: BUSINESS_CONFIG.whatsappPhone,
      whatsappNumberSecondary: BUSINESS_CONFIG.secondaryWhatsappPhone,
      facebookUrl: BUSINESS_CONFIG.socialLinks.facebook,
      instapayRecipient: BUSINESS_CONFIG.instapay.recipientName,
      instapayNumber: BUSINESS_CONFIG.phone,
      instapayHandle: BUSINESS_CONFIG.instapay.accountHandle,
      workingHoursAr: BUSINESS_CONFIG.workingHours.text,
      addressAr: BUSINESS_CONFIG.address.fullAddress,
      updatedAt: new Date().toISOString(),
    };

    return this.save(defaultSettings);
  }

  public updateSettings(settings: Partial<BusinessSettingsRecord>): BusinessSettingsRecord {
    const current = this.getSettings();
    const updated: BusinessSettingsRecord = {
      ...current,
      ...settings,
      id: 'showroom_settings',
      updatedAt: new Date().toISOString(),
    };
    return this.save(updated);
  }
}

export const defaultSettingsRepository = new SettingsRepository();
