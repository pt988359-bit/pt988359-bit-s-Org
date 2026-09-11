/**
 * Enterprise Architecture - Business Settings Service
 * Phase 14.7 Architecture Hardening
 */

import { SettingsRepository, defaultSettingsRepository, BusinessSettingsRecord } from '../repositories/SettingsRepository';
import { LoggerService } from './LoggerService';

export class BusinessSettingsService {
  constructor(private readonly repo: SettingsRepository = defaultSettingsRepository) {}

  public getSettings(): BusinessSettingsRecord {
    return this.repo.getSettings();
  }

  public updateBusinessInfo(payload: Partial<BusinessSettingsRecord>): BusinessSettingsRecord {
    LoggerService.info('BusinessSettingsService', 'Updating showroom business settings', payload);
    return this.repo.updateSettings(payload);
  }
}

export const defaultBusinessSettingsService = new BusinessSettingsService();
