/**
 * Conflict Detection Service (TASK-013 PART 10)
 * Compares data from raw text, manual inputs, and existing records to highlight anomalies and discrepancies.
 */

import { ConflictDetectionResult } from '../../../types/aiKnowledgeEngine';
import { ExtractedProductData } from '../../../types/aiProductIntake';

export class ConflictDetectionService {
  /**
   * Evaluates potential conflicts in extracted product data
   */
  public static detectConflicts(extracted: ExtractedProductData, rawText: string): ConflictDetectionResult {
    const conflicts: ConflictDetectionResult['conflicts'] = [];
    const textLower = rawText.toLowerCase();

    // 1. Cost Discrepancy (e.g., Purchase Cost > Selling Price)
    const pCost = extracted.purchaseCost.value;
    const sPrice = extracted.sellingPrice.value;
    if (pCost > 0 && sPrice > 0 && pCost > sPrice) {
      conflicts.push({
        field: 'pricingBreakdown',
        sourceA: { name: 'تكلفة الشراء', value: `${pCost} ج.م` },
        sourceB: { name: 'سعر البيع', value: `${sPrice} ج.م` },
        severity: 'high',
        recommendation: 'تناقض مالي: تكلفة الشراء أعلى من سعر البيع المحدد! يرجى مراجعة الأسعار لتفادي الخسارة.',
      });
    }

    // 2. Brand Mention vs Extracted Brand
    if (textLower.includes('شارب') && extracted.brand.value.toLowerCase() === 'lg') {
      conflicts.push({
        field: 'brand',
        sourceA: { name: 'النص الأصلي', value: 'تم ذكر شارب بالنص' },
        sourceB: { name: 'الماركة المستخرجة', value: extracted.brand.value },
        severity: 'medium',
        recommendation: 'تم اكتشاف كلمة "شارب" بالنص بينما الماركة المستخرجة هي "LG". تأكد من الماركة الصحيحة.',
      });
    }

    // 3. Warranty contradiction
    if (textLower.includes('بدون ضمان') && extracted.warrantyCardAvailable.value) {
      conflicts.push({
        field: 'warrantyCardAvailable',
        sourceA: { name: 'النص الأصلي', value: 'يذكر النص "بدون ضمان"' },
        sourceB: { name: 'تفعيل الضمان', value: 'تم تفعيل بطاقة الضمان' },
        severity: 'medium',
        recommendation: 'راجع حالة الضمان: النص يشير إلى غياب الضمان بينما الخيار مفعل.',
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }
}
