/**
 * Enterprise AI Knowledge Engine & Business Intelligence Core Types (TASK-013)
 */

export interface MarketBrandAlias {
  canonicalName: string;
  aliases: string[];
  arabicName?: string;
  countryOfOrigin?: string;
}

export interface CategorySpecTemplate {
  categoryId: string;
  categoryName: string;
  requiredSpecs: string[];
  recommendedSpecs: string[];
}

export interface BusinessRuleDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'inventory' | 'reservation' | 'finance' | 'warranty' | 'customer';
  enforced: boolean;
}

export interface AiMemoryRecord {
  id: string;
  timestamp: string;
  field: string;
  originalAiValue: any;
  userCorrectedValue: any;
  wasAccepted: boolean;
  contextTag?: string;
}

export interface LearningMetric {
  field: string;
  totalSuggestions: number;
  acceptedCount: number;
  rejectedCount: number;
  accuracyRate: number; // 0 - 100
}

export interface PricingAnalysisResult {
  recommendedSellingPrice: number;
  recommendedMarginPercent: number;
  minAcceptablePrice: number;
  riskLevel: 'low' | 'medium' | 'high';
  pricingConfidence: number;
  rationale: string[];
}

export interface DataQualityScore {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  passedChecks: string[];
  missingFields: string[];
  suggestions: string[];
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: {
    field: string;
    sourceA: { name: string; value: string };
    sourceB: { name: string; value: string };
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
}

export interface DuplicateDetectionMatch {
  productId: string;
  title: string;
  brand: string;
  model: string;
  similarityScore: number; // 0 - 100
  matchReason: string;
}

export interface ClarificationQuestion {
  id: string;
  field: string;
  questionArabic: string;
  options: string[];
  recommendation?: string;
}

export interface MultimodalProcessorStub {
  type: 'image' | 'pdf_invoice' | 'warranty_ocr' | 'voice_note' | 'serial_barcode';
  isAvailable: boolean;
  supportedFormats: string[];
  version: string;
}

export interface AiEngineStats {
  totalExtractions: number;
  overallAccuracy: number;
  learnedCorrectionsCount: number;
  memorySizeKb: number;
  activeBusinessRulesCount: number;
  supportedBrandsCount: number;
  lastKnowledgeSync: string;
}
