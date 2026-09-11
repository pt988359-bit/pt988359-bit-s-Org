/**
 * Enterprise Architecture - Finance & Pricing Validator
 * Phase 14.5 Refactoring
 */

import { ValidationError, BusinessRuleError } from '../errors/DomainErrors';
import { MAGIC_NUMBERS } from '../config/magicNumbers';

export class FinanceValidator {
  public static validateExpense(amount: number, category: string, description: string): void {
    if (isNaN(amount) || amount <= 0) {
      throw new ValidationError('مبلغ المصروف يجب أن يكون رقماً موجباً أكبر من صفر', { amount });
    }
    if (!category || category.trim().length === 0) {
      throw new ValidationError('يرجى اختيار تصنيف المصروف', { category });
    }
    if (!description || description.trim().length < 5) {
      throw new ValidationError('بيان المصروف يجب أن لا يقل عن 5 حروف', { description });
    }
  }

  public static validateProposedPrice(proposedPrice: number, minAcceptablePrice: number): void {
    if (isNaN(proposedPrice) || proposedPrice <= 0) {
      throw new ValidationError('السعر المقترح غير صحيح', { proposedPrice });
    }
    if (proposedPrice < minAcceptablePrice) {
      throw new BusinessRuleError(
        `السعر المقترح (${proposedPrice.toLocaleString('ar-EG')} ج.م) أقل من الحد الأدنى المقبول (${minAcceptablePrice.toLocaleString('ar-EG')} ج.م)`,
        { proposedPrice, minAcceptablePrice }
      );
    }
  }

  public static checkMarginThreshold(profitMarginPercent: number): { isSafe: boolean; warning?: string } {
    if (profitMarginPercent < MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT) {
      return {
        isSafe: false,
        warning: `هامش الربح (${profitMarginPercent.toFixed(1)}%) أقل من الحد المستهدف (${MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT}%)`,
      };
    }
    return { isSafe: true };
  }
}
