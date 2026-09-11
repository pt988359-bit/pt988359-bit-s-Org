/**
 * Pricing Intelligence Service (TASK-013 PART 8)
 * Analyzes costs, condition, category trends, and protection margins to calculate
 * recommended selling price, margin percentages, and risk levels.
 */

import { PricingAnalysisResult } from '../../../types/aiKnowledgeEngine';

export interface PricingInputData {
  purchaseCost: number;
  transportationCost: number;
  maintenanceCost: number;
  cleaningCost: number;
  accessoriesCost: number;
  otherCosts: number;
  condition: string;
  categoryId: string;
  brand: string;
  manualSellingPrice?: number;
}

export class PricingIntelligenceService {
  public static calculatePricingIntelligence(input: PricingInputData): PricingAnalysisResult {
    const totalCost =
      (input.purchaseCost || 0) +
      (input.transportationCost || 0) +
      (input.maintenanceCost || 0) +
      (input.cleaningCost || 0) +
      (input.accessoriesCost || 0) +
      (input.otherCosts || 0);

    // Multipliers based on condition
    let targetMarginPercent = 30; // Default 30% margin
    if (input.condition === 'new' || input.condition === 'new_in_box') {
      targetMarginPercent = 25; // Lower margin, high velocity
    } else if (input.condition === 'used_warranty') {
      targetMarginPercent = 35; // Premium for warrantied used
    } else if (input.condition === 'used_no_warranty') {
      targetMarginPercent = 40; // Higher risk buffer
    }

    const rationale: string[] = [];
    rationale.push(`إجمالي التكلفة الشاملة المحسوبة: ${totalCost.toLocaleString()} ج.م`);

    const recommendedProfit = Math.round(totalCost * (targetMarginPercent / 100));
    const recommendedSellingPrice = Math.max(1000, totalCost + recommendedProfit);
    const minAcceptablePrice = Math.round(totalCost * 1.15); // 15% floor protection rule

    rationale.push(`تم تطبيق هامش استثماري مستهدف بنسبة ${targetMarginPercent}% بناءً على حالة الجهاز (${input.condition})`);
    rationale.push(`الحد الأدنى المقبول لحماية المعادي: ${minAcceptablePrice.toLocaleString()} ج.م`);

    // Risk level assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalCost > 40000 && input.condition === 'used_no_warranty') {
      riskLevel = 'high';
      rationale.push('تنبيه المخاطر: تكلفة مرتفعة لجهاز مستعمل بدون ضمان ترفع مخاطرة الضمان');
    } else if (totalCost > 25000) {
      riskLevel = 'medium';
    }

    // Evaluate manual price if provided
    if (input.manualSellingPrice && input.manualSellingPrice > 0) {
      if (input.manualSellingPrice < minAcceptablePrice) {
        riskLevel = 'high';
        rationale.push('حظر سعر: السعر اليدوي الحالي أقل من الحد الأدنى المقبول (15% فوق التكلفة)!');
      }
    }

    return {
      recommendedSellingPrice,
      recommendedMarginPercent: targetMarginPercent,
      minAcceptablePrice,
      riskLevel,
      pricingConfidence: totalCost > 0 ? 95 : 60,
      rationale,
    };
  }
}
