import { Product, SpecTemplateField } from './index';

export type ProductLifecycleStage =
  | 'draft'               // مسودة
  | 'purchased'           // تم الشراء
  | 'pending_inspection'  // قيد الفحص
  | 'cleaning'            // التنظيف والتعقيم
  | 'maintenance'         // الصيانة والتجهيز
  | 'photography'         // التصوير والعرض
  | 'pending_review'      // المراجعة الفنية
  | 'published'           // منشور بالمحل والموقع
  | 'reserved'            // محجوز (24 ساعة)
  | 'sold'                // تم البيع
  | 'archived';           // مؤرشف

export type ProductViewMode = 'grid' | 'list' | 'compact';
export type ProductStudioViewMode = ProductViewMode;

export type BulkActionType =
  | 'archive'
  | 'change_stage'
  | 'change_category'
  | 'change_warranty'
  | 'apply_discount'
  | 'toggle_negotiable';

export type ProductStudioTab =
  | 'overview'
  | 'media'
  | 'specifications'
  | 'pricing'
  | 'warranty'
  | 'accessories'
  | 'inspection'
  | 'reservations'
  | 'purchase_requests'
  | 'negotiations'
  | 'history'
  | 'ai_assistant'
  | 'settings';

export type StudioTabKey = ProductStudioTab;

export interface ProductWarranty {
  available: boolean;
  details?: string;
  images?: string[];
}

export interface ProductMediaAlbum {
  id: string;
  type: 'before_cleaning' | 'after_cleaning' | 'before_repair' | 'after_repair' | 'general';
  title: string;
  images: { id: string; url: string; caption?: string; uploadedAt: string }[];
}

export interface InspectionCheckitem {
  id: string;
  title: string;
  category: 'electrical' | 'mechanical' | 'cleaning' | 'sanitization' | 'visual' | 'safety';
  status: 'passed' | 'warning' | 'failed' | 'not_tested';
  score: number; // 0 - 100
  notes?: string;
  inspectorName?: string;
  testedAt?: string;
}

export interface ProductPricingBreakdown {
  purchaseCost: number;       // تكلفة الشراء
  transportationCost: number; // النقل والشحن
  repairCost: number;         // الصيانة وقطع الغيار
  cleaningCost: number;       // مواد التنظيف والتعقيم
  accessoriesCost: number;   // الملحقات المضافة
  otherCosts: number;        // مصاريف نثرية
  totalCost: number;          // إجمالي التكلفة الحقيقية
  minAcceptablePrice: number; // الحد الأدنى للبيع
  recommendedPrice: number;   // السعر المقترح
  displayedPrice: number;     // سعر العرض المعلن
  isNegotiable: boolean;     // قابل للتفاوض
  expectedProfit: number;     // الربح المتوقع
  profitMarginPercent: number;// نسبة الربح %
  internalNotes?: string;
}

export interface ExtendedProductAccessory {
  id: string;
  name: string;
  category: 'cable' | 'remote' | 'hose' | 'shelf' | 'manual' | 'filter' | 'other';
  status: 'included' | 'missing' | 'optional_addon' | 'damaged';
  estimatedValue?: number;
  notes?: string;
}

export interface ProductAuditRecord {
  id: string;
  date: string;
  adminName: string;
  adminRole: string;
  action: string;
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface ProductAiAssistantTools {
  improvedTitle?: string;
  improvedDescription?: string;
  suggestedSpecs?: Record<string, string>;
  suggestedTags?: string[];
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  facebookPostText?: string;
  whatsAppAdText?: string;
  seoDescriptionText?: string;
  arabicDescriptionText?: string;
  englishDescriptionText?: string;
  maintenanceSummaryText?: string;
  showroomNotesText?: string;
  customerFriendlyExplanation?: string;
  missingFieldsWarning?: string[];
  lastGeneratedAt?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface SpecCategoryTemplate {
  id: string;
  categoryId: string;
  categoryName: string;
  fields: SpecTemplateField[];
}

export interface FilterProductOptions {
  category: string;
  brand: string;
  condition: string;
  status: string;
  lifecycleStage: string;
  warranty: string;
  negotiable: string;
  priceMin: string;
  priceMax: string;
  publishedOnly: boolean;
  archivedOnly: boolean;
  readyForSaleOnly: boolean;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'highest_price' | 'lowest_price' | 'most_viewed' | 'recently_updated' | 'alphabetical';
}

export interface EnrichedProduct extends Product {
  internalCode: string; // e.g. PT-WM-2026-0001
  lifecycleStage: ProductLifecycleStage;
  pricingBreakdown: ProductPricingBreakdown;
  mediaAlbums: ProductMediaAlbum[];
  inspectionChecklist: InspectionCheckitem[];
  extendedAccessories: ExtendedProductAccessory[];
  auditRecords: ProductAuditRecord[];
  aiAssistantTools?: ProductAiAssistantTools;
  viewsCount: number;
  reservationsCount: number;
  purchaseRequestsCount: number;
  negotiationsCount: number;
  isArchived: boolean;
  lastUpdatedBy?: string;
}
