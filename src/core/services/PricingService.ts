/**
 * Enterprise Architecture - Pricing & Negotiation Business Service
 * Phase 14.5 Refactoring
 */

import { MAGIC_NUMBERS } from '../config/magicNumbers';

export class PricingService {
  /**
   * Calculates minimum red-line acceptable selling price based on cost sheet and target profit
   */
  public static calculateMinimumAcceptablePrice(totalCost: number, targetMarginPercent: number = MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT): number {
    if (totalCost <= 0) return 0;
    const minMultiplier = 1 + Math.max(targetMarginPercent, MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT) / 100;
    return Math.ceil(totalCost * minMultiplier / 100) * 100; // Round to nearest 100 EGP
  }

  /**
   * Calculates profit margin percentage from price and cost
   */
  public static calculateProfitMargin(sellingPrice: number, totalCost: number): number {
    if (sellingPrice <= 0) return 0;
    const profit = sellingPrice - totalCost;
    return (profit / sellingPrice) * 100;
  }

  /**
   * Evaluates proposed customer discount against safety boundaries
   */
  public static evaluateNegotiationOffer(
    originalPrice: number,
    offeredPrice: number,
    totalCost: number,
    minAcceptablePrice: number
  ): {
    isApproved: boolean;
    requiresAdminApproval: boolean;
    marginPercent: number;
    discountAmount: number;
    discountPercent: number;
    message: string;
  } {
    const discountAmount = Math.max(0, originalPrice - offeredPrice);
    const discountPercent = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
    const marginPercent = this.calculateProfitMargin(offeredPrice, totalCost);

    if (offeredPrice < minAcceptablePrice) {
      return {
        isApproved: false,
        requiresAdminApproval: true,
        marginPercent,
        discountAmount,
        discountPercent,
        message: 'العرض أقل من الحد الأدنى المقبول للتكلفة ويتطلب موافقة الإدارة العليا',
      };
    }

    if (discountPercent > MAGIC_NUMBERS.MAX_NEGOTIATION_DISCOUNT_PERCENT) {
      return {
        isApproved: false,
        requiresAdminApproval: true,
        marginPercent,
        discountAmount,
        discountPercent,
        message: `الخصم يمثل ${discountPercent.toFixed(1)}% ويتجاوز الحد الأقصى للمبيعات (${MAGIC_NUMBERS.MAX_NEGOTIATION_DISCOUNT_PERCENT}%)`,
      };
    }

    return {
      isApproved: true,
      requiresAdminApproval: false,
      marginPercent,
      discountAmount,
      discountPercent,
      message: 'العرض آمن ومطابق لسياسة التسعير المعتمدة',
    };
  }
}
