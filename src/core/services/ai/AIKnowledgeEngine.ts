/**
 * AI Knowledge Engine Façade (TASK-013 PART 14)
 * Single entry point for all AI intelligence, business rules, prompt building, data quality,
 * pricing intelligence, conflict detection, duplicate detection, question generation, and memory.
 */

import { MarketKnowledgeService } from './MarketKnowledgeService';
import { SpecificationKnowledgeService } from './SpecificationKnowledgeService';
import { BusinessRulesService } from './BusinessRulesService';
import { PricingIntelligenceService, PricingInputData } from './PricingIntelligenceService';
import { DataQualityService } from './DataQualityService';
import { ConflictDetectionService } from './ConflictDetectionService';
import { DuplicateDetectionService } from './DuplicateDetectionService';
import { QuestionGenerationService } from './QuestionGenerationService';
import { AiLearningEngineService } from './AiLearningEngineService';
import { SmartPromptBuilderService, PromptContext } from './SmartPromptBuilderService';
import { KnowledgeRepository, KnowledgeSnapshot } from './KnowledgeRepository';
import { MultimodalArchitectureService } from './MultimodalArchitectureService';
import { Category } from '../../../types';
import { SupplierRecord } from '../../../types/adminFinance';
import { EnrichedProduct } from '../../../types/productStudio';
import { ExtractedProductData } from '../../../types/aiProductIntake';

export class AIKnowledgeEngine {
  // 1. Knowledge Base
  public static getKnowledgeSnapshot(categories: Category[], suppliers: SupplierRecord[]): KnowledgeSnapshot {
    return KnowledgeRepository.getSnapshot(categories, suppliers);
  }

  // 2. Business Rules
  public static getActiveBusinessRules() {
    return BusinessRulesService.getActiveRules();
  }

  // 3. Prompt Builder
  public static buildPrompt(context: PromptContext): string {
    return SmartPromptBuilderService.buildSystemInstruction(context);
  }

  // 4. Pricing Intelligence
  public static evaluatePricing(input: PricingInputData) {
    return PricingIntelligenceService.calculatePricingIntelligence(input);
  }

  // 5. Data Quality Engine
  public static evaluateDataQuality(product: Partial<EnrichedProduct> | ExtractedProductData) {
    return DataQualityService.evaluateProductQuality(product);
  }

  // 6. Conflict Detection
  public static detectConflicts(extracted: ExtractedProductData, rawText: string) {
    return ConflictDetectionService.detectConflicts(extracted, rawText);
  }

  // 7. Duplicate Detection
  public static detectDuplicates(
    candidate: { title: string; brand: string; model?: string; barcode?: string },
    existingProducts: EnrichedProduct[]
  ) {
    return DuplicateDetectionService.findPotentialDuplicates(candidate, existingProducts);
  }

  // 8. Question Generation Engine
  public static generateClarificationQuestions(extracted: ExtractedProductData) {
    return QuestionGenerationService.generateClarificationQuestions(extracted);
  }

  // 9. Learning & Memory
  public static recordCorrection(
    field: string,
    originalAiValue: any,
    userCorrectedValue: any,
    wasAccepted: boolean,
    contextTag?: string
  ) {
    AiLearningEngineService.recordCorrection(field, originalAiValue, userCorrectedValue, wasAccepted, contextTag);
  }

  public static getEngineStats() {
    return AiLearningEngineService.getEngineStats();
  }

  public static getMemoryRecords() {
    return AiLearningEngineService.getMemoryRecords();
  }

  public static clearMemory() {
    AiLearningEngineService.clearMemory();
  }

  // 10. Market Normalization
  public static normalizeBrand(brand: string) {
    return MarketKnowledgeService.normalizeBrand(brand);
  }

  public static normalizeCategory(cat: string) {
    return MarketKnowledgeService.normalizeCategory(cat);
  }

  // 11. Spec Templates
  public static getCategorySpecTemplate(catId: string) {
    return SpecificationKnowledgeService.getTemplateForCategory(catId);
  }

  // 12. Multimodal Registry
  public static getMultimodalProcessors() {
    return MultimodalArchitectureService.getRegisteredProcessors();
  }
}
