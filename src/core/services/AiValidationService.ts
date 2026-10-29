/**
 * AI Validation Service (TASK-012 STEP 8)
 * Validates extracted fields, verifies entity existence in database repositories,
 * calculates financial totals, and builds final ExtractedProductData.
 */

import { ExtractedProductData, TechnicalSpecExtracted } from '../../types/aiProductIntake';
import { AiConfidenceEngine } from './AiConfidenceEngine';
import { Category } from '../../types';
import { SupplierRecord } from '../../types/adminFinance';

export interface ValidationContext {
  categories: Category[];
  brands: { id: string; name: string; arabicName?: string }[];
  suppliers: SupplierRecord[];
}

export class AiValidationService {
  public static processAndValidate(rawAiOutput: any, context: ValidationContext): ExtractedProductData {
    const scores = rawAiOutput?.confidenceScores || {};

    // 1. General Info Validation
    const titleVal = rawAiOutput?.title ? String(rawAiOutput.title).trim() : 'غير محدد';
    const title = AiConfidenceEngine.evaluateField(titleVal, scores.title ?? (titleVal !== 'غير محدد' ? 95 : 0), titleVal === 'غير محدد');

    const brandVal = (rawAiOutput?.brand || '').trim();
    const brandExists = context.brands.some(
      (b) => b.name.toLowerCase() === brandVal.toLowerCase() || (b.arabicName && b.arabicName.toLowerCase() === brandVal.toLowerCase())
    );
    const brand = AiConfidenceEngine.evaluateField(
      brandVal || 'غير محدد',
      scores.brand ?? (brandExists ? 95 : 65),
      !brandVal || brandVal === 'غير محدد'
    );

    let categoryIdVal = (rawAiOutput?.categoryId || '').trim();
    let categoryNameVal = (rawAiOutput?.categoryName || '').trim();

    // Check category match
    const matchedCategory = context.categories.find(
      (c) => c.id === categoryIdVal || c.name.toLowerCase().includes(categoryNameVal.toLowerCase()) || categoryNameVal.toLowerCase().includes(c.name.toLowerCase())
    );
    const categoryExists = !!matchedCategory;
    if (matchedCategory) {
      categoryIdVal = matchedCategory.id;
      categoryNameVal = matchedCategory.name;
    } else if (!categoryIdVal && !categoryNameVal) {
      categoryIdVal = 'غير محدد';
      categoryNameVal = 'غير محدد';
    }

    const categoryId = AiConfidenceEngine.evaluateField(
      categoryIdVal || 'غير محدد',
      scores.category ?? (categoryExists ? 95 : 60),
      !categoryExists && (!categoryIdVal || categoryIdVal === 'غير محدد')
    );
    const categoryName = AiConfidenceEngine.evaluateField(
      categoryNameVal || 'غير محدد',
      scores.category ?? (categoryExists ? 95 : 60),
      !categoryExists && (!categoryNameVal || categoryNameVal === 'غير محدد')
    );

    const modelVal = rawAiOutput?.model ? String(rawAiOutput.model).trim() : 'N/A';
    const model = AiConfidenceEngine.evaluateField(modelVal, scores.model ?? (modelVal !== 'N/A' ? 80 : 0), modelVal === 'N/A' || modelVal === 'غير محدد');
    
    const colorVal = rawAiOutput?.color ? String(rawAiOutput.color).trim() : 'غير محدد';
    const color = AiConfidenceEngine.evaluateField(
      colorVal,
      scores.color ?? (colorVal !== 'غير محدد' ? 85 : 0),
      colorVal === 'غير محدد' || !colorVal
    );
    
    const manufacturer = AiConfidenceEngine.evaluateField(rawAiOutput?.manufacturer ? String(rawAiOutput.manufacturer).trim() : (brandVal || 'غير محدد'), 80);
    const country = AiConfidenceEngine.evaluateField(rawAiOutput?.country ? String(rawAiOutput.country).trim() : 'غير محدد', scores.country ?? 75);
    const year = AiConfidenceEngine.evaluateField(rawAiOutput?.year ? String(rawAiOutput.year).trim() : 'غير محدد', scores.year ?? 70);

    // 2. Condition Validation (Do NOT assume warranty by default)
    const rawCond = rawAiOutput?.condition;
    let validCond: 'new' | 'used_warranty' | 'used_no_warranty' = 'used_no_warranty';
    if (rawCond === 'new' || rawCond === 'new_in_box') {
      validCond = 'new';
    } else if (rawCond === 'used_warranty' || rawCond === 'used_no_warranty') {
      validCond = rawCond;
    } else if (rawCond?.includes('جديد بالكرتونة') || rawCond?.includes('كرتونة')) {
      validCond = 'new';
    } else if (rawCond?.includes('جديد')) {
      validCond = 'new';
    } else if (rawCond?.includes('بضمان') || rawCond?.includes('مع ضمان')) {
      validCond = 'used_warranty';
    } else {
      validCond = 'used_no_warranty';
    }
    const condition = AiConfidenceEngine.evaluateField(validCond, scores.condition ?? 85);

    // 3. Technical Specs (Dynamic - Strictly only specs explicitly mentioned in text)
    const rawSpecs: any[] = Array.isArray(rawAiOutput?.specs) ? rawAiOutput.specs : [];
    const specs: TechnicalSpecExtracted[] = rawSpecs
      .filter((s) => s && (s.label || s.name) && (s.value || s.val))
      .map((s) => ({
        label: String(s.label || s.name).trim(),
        value: String(s.value || s.val).trim(),
        confidence: Number(s.confidence) || 90,
      }));

    // 4. Financial Extraction & Calculations (Do NOT invent 25000 or fake selling price)
    const purchaseCostVal = Number(rawAiOutput?.purchaseCost) || 0;
    const transportVal = Number(rawAiOutput?.transportationCost) || 0;
    const repairVal = Number(rawAiOutput?.maintenanceCost) || 0;
    const cleaningVal = Number(rawAiOutput?.cleaningCost) || 0;
    const accessoriesVal = Number(rawAiOutput?.accessoriesCost) || 0;
    const otherVal = Number(rawAiOutput?.otherCosts) || 0;

    const calculatedTotalCost = purchaseCostVal + transportVal + repairVal + cleaningVal + accessoriesVal + otherVal;
    const rawSellingPrice = Number(rawAiOutput?.sellingPrice) || 0;
    const finalSellingPrice = rawSellingPrice > 0 ? rawSellingPrice : 0;

    const purchaseCost = AiConfidenceEngine.evaluateField(
      purchaseCostVal,
      scores.purchaseCost ?? (purchaseCostVal > 0 ? 95 : 0),
      purchaseCostVal <= 0
    );
    const transportationCost = AiConfidenceEngine.evaluateField(transportVal, 90);
    const maintenanceCost = AiConfidenceEngine.evaluateField(repairVal, 90);
    const cleaningCost = AiConfidenceEngine.evaluateField(cleaningVal, 90);
    const accessoriesCost = AiConfidenceEngine.evaluateField(accessoriesVal, 90);
    const otherCosts = AiConfidenceEngine.evaluateField(otherVal, 90);
    const totalCost = AiConfidenceEngine.evaluateField(calculatedTotalCost, 95);
    const sellingPrice = AiConfidenceEngine.evaluateField(
      finalSellingPrice,
      scores.sellingPrice ?? (rawSellingPrice > 0 ? 95 : 0),
      rawSellingPrice <= 0
    );

    // 5. Supplier Detection & Matching
    const supplierVal = (rawAiOutput?.supplierName || '').trim();
    const matchedSupplier = context.suppliers.find(
      (s) => s.name.toLowerCase().includes(supplierVal.toLowerCase()) || supplierVal.toLowerCase().includes(s.name.toLowerCase())
    );
    const supplierExists = !!matchedSupplier;
    const supplierName = AiConfidenceEngine.evaluateField(
      supplierVal || 'غير محدد',
      scores.supplierName ?? (supplierExists ? 95 : 65),
      !supplierVal || supplierVal === 'غير محدد'
    );

    // 6. Warranty Detection (Strictly from text, no speculative assumptions)
    const hasWarranty = Boolean(rawAiOutput?.warrantyCardAvailable === true);
    const warrantyCardAvailable = AiConfidenceEngine.evaluateField(
      hasWarranty,
      scores.warranty ?? (hasWarranty ? 90 : 0),
      !hasWarranty
    );

    // 7. Description & Search Keywords (Strictly without hallucinated inspection or location claims)
    const generatedDesc = rawAiOutput?.generatedDescription?.trim() || (titleVal !== 'غير محدد' ? `جهاز ${titleVal}.` : 'غير محدد');
    const generatedDescription = AiConfidenceEngine.evaluateField(
      generatedDesc,
      rawAiOutput?.generatedDescription ? 90 : 0,
      !rawAiOutput?.generatedDescription || generatedDesc === 'غير محدد'
    );

    const keywords: string[] = Array.isArray(rawAiOutput?.searchKeywords) && rawAiOutput.searchKeywords.length > 0
      ? rawAiOutput.searchKeywords
      : [brandVal, categoryNameVal].filter((k) => k && k !== 'غير محدد');
    const searchKeywords = AiConfidenceEngine.evaluateField(keywords, keywords.length > 0 ? 95 : 0, keywords.length === 0);

    return {
      title,
      categoryId,
      categoryName,
      brand,
      model,
      color,
      manufacturer,
      country,
      year,
      condition,
      specs,
      purchaseCost,
      transportationCost,
      maintenanceCost,
      cleaningCost,
      accessoriesCost,
      otherCosts,
      totalCost,
      sellingPrice,
      supplierName,
      matchedSupplierId: matchedSupplier?.id,
      supplierExists,
      brandExists,
      categoryExists,
      warrantyCardAvailable,
      generatedDescription,
      searchKeywords,
      imageAssistData: {
        detectedBrand: brandVal,
        detectedCategory: categoryNameVal,
        detectedColor: color.value,
        detectedWarrantyCard: hasWarranty,
        detectedLogo: brandVal,
        detectedModelNumber: model.value !== 'N/A' ? model.value : undefined,
        confidence: 90,
      },
    };
  }
}
