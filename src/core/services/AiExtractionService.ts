/**
 * AI Extraction Service (TASK-012 STEP 8 & 9)
 * Orchestrates product extraction, server communication, audit logging,
 * and cancellation support via AbortController.
 */

import { ExtractedProductData, AiIntakeAuditRecord } from '../../types/aiProductIntake';
import { AiPromptBuilder, SystemContextOptions } from './AiPromptBuilder';
import { SmartPromptBuilderService } from './ai/SmartPromptBuilderService';
import { AiValidationService, ValidationContext } from './AiValidationService';
import { EnrichedProduct } from '../../types/productStudio';
import { normalizeLifecycleState } from '../../utils/productStudioStorage';
import { IdGenerator } from './IdGenerator';
import { defaultSequenceService } from './SequenceService';
import { AdminSessionService } from './AdminSessionService';
import { LoggerService } from './LoggerService';

import { ProductCondition } from '../../types';

export class AiExtractionService {
  /**
   * Performs asynchronous extraction of product data using AI with cancellation support.
   */
  public static async extractProductFromText(
    rawText: string,
    context: SystemContextOptions & ValidationContext,
    signal?: AbortSignal
  ): Promise<ExtractedProductData> {
    if (!rawText.trim()) {
      throw new Error('النص المُدخل فارغ. يرجى لصق بيانات أو مواصفات الجهاز أولاً.');
    }

    const systemInstruction = SmartPromptBuilderService.buildSystemInstruction({
      taskType: 'product_intake',
      userRole: 'admin',
      categories: context.categories,
      suppliers: context.suppliers,
    });
    const userPrompt = AiPromptBuilder.buildExtractionUserPrompt(rawText);

    let adminToken = AdminSessionService.getToken();

    // If no token in storage/memory, attempt quick session recovery check
    if (!adminToken) {
      try {
        const checkRes = await fetch('/api/admin/access/check', {
          method: 'GET',
          credentials: 'include',
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData?.authenticated && checkData?.token) {
            AdminSessionService.setToken(checkData.token);
            adminToken = checkData.token;
          }
        }
      } catch {
        // Silently ignore network check failure
      }
    }

    try {
      const response = await fetch('/api/ai/extract-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          rawText,
          systemInstruction,
          prompt: userPrompt,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const serverMsg = errorData?.error || errorData?.message || response.statusText || `رمز الحالة ${response.status}`;
        throw new Error(serverMsg);
      }

      const jsonResult = await response.json();
      const rawExtractedData = jsonResult?.extracted || jsonResult;

      return AiValidationService.processAndValidate(rawExtractedData, context);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('تم إلغاء عملية التحليل بواسطة المستخدم.');
      }
      LoggerService.warn('AiExtractionService', `AI Extraction request notice: ${err?.message || err}`);
      throw new Error(
        err?.message || 'تعذر استخراج بيانات الجهاز بواسطة الذكاء الاصطناعي. يرجى إعادة المحاولة أو إدخال بيانات الجهاز يدوياً.'
      );
    }
  }

  /**
   * Converts approved ExtractedProductData into a full EnrichedProduct domain object
   */
  public static async buildProductFromExtractedData(
    extracted: ExtractedProductData,
    adminName = 'PRO TECK Admin'
  ): Promise<{ product: EnrichedProduct; auditRecord: AiIntakeAuditRecord }> {
    const newId = IdGenerator.generateUniqueId('prod');
    const internalCode = await defaultSequenceService.generateNextReference('product');

    const totalCost = extracted.totalCost.value || (
      extracted.purchaseCost.value +
      extracted.transportationCost.value +
      extracted.maintenanceCost.value +
      extracted.cleaningCost.value +
      extracted.accessoriesCost.value +
      extracted.otherCosts.value
    );

    const sellingPrice = extracted.sellingPrice.value || 0;
    const expectedProfit = sellingPrice - totalCost;
    const profitMarginPercent = totalCost > 0 ? Math.round((expectedProfit / totalCost) * 100) : 0;

    const product: EnrichedProduct = {
      id: newId,
      internalCode,
      qrCode: `QR-${internalCode}`,
      barcode: `622${Date.now().toString().slice(-9)}`,
      title: extracted.title.value,
      shortName: extracted.title.value.split(' ')[0],
      categoryId: extracted.categoryId.value,
      brand: extracted.brand.value,
      model: extracted.model.value || 'N/A',
      price: sellingPrice,
      description: extracted.generatedDescription.value,
      publicDescription: extracted.generatedDescription.value,
      condition:
        (extracted.condition.value as any) === 'new_in_box' || extracted.condition.value === 'new'
          ? 'new'
          : (extracted.condition.value as ProductCondition) || 'used_no_warranty',
      images: [],
      videos: [],
      ...normalizeLifecycleState('available'),
      isNegotiable: true,
      warrantyAvailable: extracted.warrantyCardAvailable.value,
      warrantyCardAvailable: extracted.warrantyCardAvailable.value,
      reservationsCount: 0,
      purchaseRequestsCount: 0,
      negotiationsCount: 0,
      isArchived: false,
      mediaAlbums: [],
      extendedAccessories: [],
      showroomLocation: 'فرع المعادي شارع 68',
      arrivalDate: new Date().toLocaleDateString('ar-EG'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specs: extracted.specs.map((s) => ({ label: s.label, value: s.value })),
      warranty: {
        available: extracted.warrantyCardAvailable.value,
        details: extracted.warrantyCardAvailable.value ? 'بطاقة الضمان متوفرة ومعتمدة' : 'بدون ضمان مصنع',
      },
      pricingBreakdown: {
        purchaseCost: extracted.purchaseCost.value,
        transportationCost: extracted.transportationCost.value,
        repairCost: extracted.maintenanceCost.value,
        cleaningCost: extracted.cleaningCost.value,
        accessoriesCost: extracted.accessoriesCost.value,
        otherCosts: extracted.otherCosts.value,
        totalCost,
        minAcceptablePrice: Math.round(sellingPrice * 0.85),
        recommendedPrice: sellingPrice,
        displayedPrice: sellingPrice,
        isNegotiable: true,
        expectedProfit,
        profitMarginPercent,
      },
      purchaseHistory: {
        supplierName: extracted.supplierName.value || 'غير محدد',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: extracted.purchaseCost.value,
        transportationCost: extracted.transportationCost.value,
        maintenanceCost: extracted.maintenanceCost.value,
        cleaningCost: extracted.cleaningCost.value,
        accessoriesCost: extracted.accessoriesCost.value,
        totalCost,
        adminNotes: 'تم الاستخراج والإضافة عبر محرك الذكاء الاصطناعي الذكي (AI Intake Engine)',
      },
      inspectionChecklist: [],
      healthScores: {
        generalScore: 98,
        technicalScore: 100,
        appearanceScore: 95,
        overallScore: 98,
      },
      auditRecords: [
        {
          id: `audit-${Date.now()}`,
          date: new Date().toLocaleString('ar-EG'),
          adminName,
          adminRole: 'Super Admin',
          action: 'إنشاء ملف جهاز عبر الذكاء الاصطناعي (AI Intake Engine)',
          newValue: extracted.title.value,
          reason: 'إدخال ذكي واستخراج تلقائي لبيانات النص',
        },
      ],
    };

    const auditRecord: AiIntakeAuditRecord = {
      id: `ai-audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      pastedText: extracted.generatedDescription.value,
      extractedData: extracted,
      userEdits: {},
      createdProductId: newId,
      createdProductTitle: extracted.title.value,
      adminName,
    };

    return { product, auditRecord };
  }
}
