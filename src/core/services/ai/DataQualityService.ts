/**
 * Data Quality Service (TASK-013 PART 9)
 * Evaluates every product's completeness, accuracy, and compliance score (0-100%).
 */

import { DataQualityScore } from '../../../types/aiKnowledgeEngine';
import { EnrichedProduct } from '../../../types/productStudio';
import { ExtractedProductData } from '../../../types/aiProductIntake';

export class DataQualityService {
  /**
   * Evaluates an EnrichedProduct or ExtractedProductData
   */
  public static evaluateProductQuality(product: Partial<EnrichedProduct> | ExtractedProductData): DataQualityScore {
    const passedChecks: string[] = [];
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    let score = 0;
    const isExtracted = 'title' in product && typeof product.title === 'object' && 'value' in (product.title as any);

    // Title Check (15 pts)
    const titleVal = isExtracted ? (product as ExtractedProductData).title.value : (product as EnrichedProduct).title;
    if (titleVal && titleVal.length > 5 && titleVal !== 'جهاز منزلي جديد') {
      score += 15;
      passedChecks.push('اسم الجهاز وافي ومفصل');
    } else {
      missingFields.push('اسم الجهاز قصير أو افتراضي');
      suggestions.push('أضف تسمية واضحة تتضمن الماركة، الموديل، والسعة');
    }

    // Brand Check (15 pts)
    const brandVal = isExtracted ? (product as ExtractedProductData).brand.value : (product as EnrichedProduct).brand;
    if (brandVal && brandVal !== 'غير محدد') {
      score += 15;
      passedChecks.push('الماركة محددة بدقة');
    } else {
      missingFields.push('الماركة غير محددة');
      suggestions.push('حدد اسم الماركة المصنعة للجهاز (LG, Sharp, Samsung...)');
    }

    // Model Number Check (15 pts)
    const modelVal = isExtracted ? (product as ExtractedProductData).model.value : (product as EnrichedProduct).model;
    if (modelVal && modelVal !== 'N/A' && modelVal !== 'غير محدد') {
      score += 15;
      passedChecks.push('رقم الموديل الفني مسجل');
    } else {
      missingFields.push('رقم الموديل الفني غائب');
      suggestions.push('أدخل رقم الموديل المطبوع على السيريال أو كرت الضمان');
    }

    // Financial Purchase Cost Check (15 pts)
    const purchaseCostVal = isExtracted
      ? (product as ExtractedProductData).purchaseCost.value
      : (product as EnrichedProduct).pricingBreakdown?.purchaseCost || (product as EnrichedProduct).purchaseHistory?.purchaseCost;
    if (purchaseCostVal && purchaseCostVal > 0) {
      score += 15;
      passedChecks.push('تكلفة الشراء موثقة بالسجل المالي');
    } else {
      missingFields.push('تكلفة الشراء المالية 0 أو مفقودة');
      suggestions.push('أدخل تكلفة الشراء المباشرة لحساب الأرباح بدقة');
    }

    // Selling Price Check (15 pts)
    const priceVal = isExtracted ? (product as ExtractedProductData).sellingPrice.value : (product as EnrichedProduct).price;
    if (priceVal && priceVal > 0) {
      score += 15;
      passedChecks.push('سعر البيع المعلن مسجل');
    } else {
      missingFields.push('سعر البيع المعروض غير محدد');
    }

    // Warranty Card Check (15 pts)
    const warrantyVal = isExtracted
      ? (product as ExtractedProductData).warrantyCardAvailable.value
      : (product as EnrichedProduct).warrantyCardAvailable || (product as EnrichedProduct).warranty?.available;
    if (warrantyVal) {
      score += 15;
      passedChecks.push('بطاقة الضمان الأصلي متوفرة ومرفقة');
    } else {
      missingFields.push('بطاقة الضمان غير متوفرة');
      suggestions.push('تأكد من إرفاق بطاقة الضمان لزيادة ثقة العميل وتسريع البيع');
    }

    // Technical Specs Check (10 pts)
    const specsVal = isExtracted ? (product as ExtractedProductData).specs : (product as EnrichedProduct).specs;
    if (specsVal && specsVal.length >= 2) {
      score += 10;
      passedChecks.push('المواصفات الفنية مكتملة');
    } else {
      missingFields.push('المواصفات الفنية تحتاج إثراء');
      suggestions.push('أضف السعة، الأبعاد، ونوع الكومبريسور أو الموتور');
    }

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
    if (score < 50) grade = 'D';
    else if (score < 70) grade = 'C';
    else if (score < 85) grade = 'B';
    else if (score < 95) grade = 'A';

    return {
      score,
      grade,
      passedChecks,
      missingFields,
      suggestions,
    };
  }
}
