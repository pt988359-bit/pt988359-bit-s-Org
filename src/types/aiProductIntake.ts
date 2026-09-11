/**
 * Types for Enterprise AI Product Intake & Smart Data Extraction Engine (TASK-012)
 */

export type ConfidenceStatus = 'green' | 'yellow' | 'red';

export interface FieldExtractionResult<T> {
  value: T;
  confidence: number; // 0 to 100
  status: ConfidenceStatus;
  note?: string;
}

export interface TechnicalSpecExtracted {
  label: string;
  value: string;
  confidence: number;
}

export interface ExtractedProductData {
  // General
  title: FieldExtractionResult<string>;
  categoryId: FieldExtractionResult<string>;
  categoryName: FieldExtractionResult<string>;
  brand: FieldExtractionResult<string>;
  model: FieldExtractionResult<string>;
  color: FieldExtractionResult<string>;
  manufacturer: FieldExtractionResult<string>;
  country: FieldExtractionResult<string>;
  year: FieldExtractionResult<string>;

  // Condition
  condition: FieldExtractionResult<'new' | 'new_in_box' | 'used_warranty' | 'used_no_warranty'>;

  // Technical Specifications (Dynamic)
  specs: TechnicalSpecExtracted[];

  // Financial Extraction
  purchaseCost: FieldExtractionResult<number>;
  transportationCost: FieldExtractionResult<number>;
  maintenanceCost: FieldExtractionResult<number>;
  cleaningCost: FieldExtractionResult<number>;
  accessoriesCost: FieldExtractionResult<number>;
  otherCosts: FieldExtractionResult<number>;
  totalCost: FieldExtractionResult<number>;
  sellingPrice: FieldExtractionResult<number>;

  // Entity Detection & Matching
  supplierName: FieldExtractionResult<string>;
  matchedSupplierId?: string;
  supplierExists: boolean;
  brandExists: boolean;
  categoryExists: boolean;

  // Warranty Detection
  warrantyCardAvailable: FieldExtractionResult<boolean>;

  // Generated Content & Search
  generatedDescription: FieldExtractionResult<string>;
  searchKeywords: FieldExtractionResult<string[]>;

  // Image Assist Foundation (Part 5)
  imageAssistData?: {
    detectedBrand?: string;
    detectedCategory?: string;
    detectedColor?: string;
    detectedDamage?: string[];
    detectedWarrantyCard?: boolean;
    detectedAccessories?: string[];
    detectedLogo?: string;
    detectedModelNumber?: string;
    confidence: number;
  };
}

export interface AiIntakeAuditRecord {
  id: string;
  timestamp: string;
  pastedText: string;
  extractedData: ExtractedProductData;
  userEdits: Record<string, any>;
  createdProductId?: string;
  createdProductTitle?: string;
  adminName: string;
}
