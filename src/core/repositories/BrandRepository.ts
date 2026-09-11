/**
 * Enterprise Architecture - Brand Repository
 * TASK-003 Dynamic Brand Management
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';

export interface Brand {
  id: string;
  name: string;
  arabicName?: string;
  logoUrl?: string;
  isActive: boolean;
  sortOrder?: number;
}

const INITIAL_BRANDS: Brand[] = [
  { id: 'brand-lg', name: 'LG', arabicName: 'إل جي', isActive: true, sortOrder: 1 },
  { id: 'brand-samsung', name: 'Samsung', arabicName: 'سامسونج', isActive: true, sortOrder: 2 },
  { id: 'brand-sharp', name: 'Sharp', arabicName: 'شارب', isActive: true, sortOrder: 3 },
  { id: 'brand-bosch', name: 'Bosch', arabicName: 'بوش', isActive: true, sortOrder: 4 },
  { id: 'brand-tornado', name: 'Tornado', arabicName: 'تورنيدو', isActive: true, sortOrder: 5 },
  { id: 'brand-beko', name: 'Beko', arabicName: 'بيكو', isActive: true, sortOrder: 6 },
  { id: 'brand-kiriazi', name: 'Kiriazi', arabicName: 'كريازي', isActive: true, sortOrder: 7 },
  { id: 'brand-toshiba', name: 'Toshiba', arabicName: 'توشيبا', isActive: true, sortOrder: 8 },
  { id: 'brand-carrier', name: 'Carrier', arabicName: 'كاريير', isActive: true, sortOrder: 9 },
  { id: 'brand-zanussi', name: 'Zanussi', arabicName: 'زانوسي', isActive: true, sortOrder: 10 },
  { id: 'brand-ariston', name: 'Ariston', arabicName: 'أريستون', isActive: true, sortOrder: 11 },
  { id: 'brand-electrolux', name: 'Electrolux', arabicName: 'إلكترولوكس', isActive: true, sortOrder: 12 },
  { id: 'brand-fresh', name: 'Fresh', arabicName: 'فريش', isActive: true, sortOrder: 13 },
  { id: 'brand-unionaire', name: 'Unionaire', arabicName: 'يونير', isActive: true, sortOrder: 14 },
  { id: 'brand-hoover', name: 'Hoover', arabicName: 'هوفر', isActive: true, sortOrder: 15 },
  { id: 'brand-midea', name: 'Midea', arabicName: 'ميديا', isActive: true, sortOrder: 16 },
  { id: 'brand-whitewhale', name: 'White Whale', arabicName: 'وايت ويل', isActive: true, sortOrder: 17 },
  { id: 'brand-haier', name: 'Haier', arabicName: 'هاير', isActive: true, sortOrder: 18 },
];

export class BrandRepository extends BaseRepository<Brand> {
  constructor(storage: StorageAdapter = defaultStorageAdapter) {
    super('brands', storage);

    // Seed initial brands if repository is empty
    const existing = this.getAll();
    if (!existing || existing.length === 0) {
      this.saveAll(INITIAL_BRANDS);
    }
  }

  public getActiveBrands(): Brand[] {
    return this.query((b) => b.isActive !== false);
  }

  public delete(id: string): void {
    this.remove(id);
  }
}

export const defaultBrandRepository = new BrandRepository();
