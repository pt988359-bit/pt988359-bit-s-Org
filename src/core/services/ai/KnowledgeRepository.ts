/**
 * Knowledge Repository (TASK-013 PART 1 & 14)
 * Loads dynamic showroom context: brands, categories, suppliers, rules, allowed statuses, and lifecycle stages.
 */

import { Category } from '../../../types';
import { SupplierRecord } from '../../../types/adminFinance';
import { MarketKnowledgeService } from './MarketKnowledgeService';
import { SpecificationKnowledgeService } from './SpecificationKnowledgeService';
import { BusinessRulesService } from './BusinessRulesService';

export interface KnowledgeSnapshot {
  categoriesCount: number;
  brandsCount: number;
  suppliersCount: number;
  activeBusinessRulesCount: number;
  specTemplatesCount: number;
  allowedProductStatuses: string[];
  allowedLifecycleStages: string[];
  profitFormula: string;
  reservationTimeoutHours: number;
}

export class KnowledgeRepository {
  public static getSnapshot(categories: Category[], suppliers: SupplierRecord[]): KnowledgeSnapshot {
    return {
      categoriesCount: categories.length,
      brandsCount: MarketKnowledgeService.getBrandAliasesList().length,
      suppliersCount: suppliers.length,
      activeBusinessRulesCount: BusinessRulesService.getActiveRules().length,
      specTemplatesCount: SpecificationKnowledgeService.getAllTemplates().length,
      allowedProductStatuses: ['available', 'reserved', 'sold', 'hidden', 'archived'],
      allowedLifecycleStages: ['draft', 'inspected', 'ready_for_sale', 'listed'],
      profitFormula: 'TotalCost = Purchase + Shipping + Maintenance + Cleaning + Accessories; Profit = SellingPrice - TotalCost',
      reservationTimeoutHours: 24,
    };
  }
}
