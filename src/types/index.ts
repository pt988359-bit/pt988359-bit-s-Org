export type ProductCondition = 'new' | 'used_warranty' | 'used_no_warranty' | 'used' | 'refurbished';
export type ProductStatus = 
  | 'available' 
  | 'reserved' 
  | 'sold' 
  | 'maintenance' 
  | 'hidden';

export interface Brand {
  id: string;
  name: string;
  arabicName?: string;
  logoUrl?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
  key?: string;
  unit?: string;
}

// ==========================================
// SPECIFICATION TEMPLATE ENGINE TYPES
// ==========================================
export type SpecFieldType = 'text' | 'number' | 'select' | 'boolean' | 'multiselect';

export interface SpecTemplateField {
  key: string;
  labelArabic: string;
  labelEnglish: string;
  fieldType: SpecFieldType;
  options?: string[];
  unit?: string;
  required?: boolean;
  group?: string;
  defaultValue?: string | number | boolean;
}

export interface SpecTemplate {
  id: string;
  categoryId: string;
  categoryName: string;
  version: number;
  fields: SpecTemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilterDef {
  key: string;
  labelArabic: string;
  labelEnglish: string;
  type: 'range' | 'select' | 'boolean';
  options?: string[];
}

export interface CategoryAttributeDef {
  key: string;
  nameArabic: string;
  nameEnglish: string;
  dataType: string;
}

// ==========================================
// CATEGORY MODEL
// ==========================================
export interface Category {
  id: string;
  name: string;
  arabicName: string;
  englishName: string;
  slug: string;
  seoSlug: string;
  iconName: string;
  description: string;
  coverImage?: string;
  isActive: boolean;
  sortOrder: number;
  specTemplateId?: string;
  customSpecTemplate?: SpecTemplateField[];
  customFilters?: CategoryFilterDef[];
  customAttributes?: CategoryAttributeDef[];
  count?: number;
}

// ==========================================
// PRODUCT ENGINE SUB-MODELS
// ==========================================
export interface ProductFinancials {
  purchasePrice?: number;
  repairCost?: number;
  transportCost?: number;
  totalCost?: number;
  expectedProfit?: number;
  finalSellingPrice?: number;
}

export interface ProductWarranty {
  available: boolean;
  details?: string;
  images?: string[];
}

export interface ProductHealthScores {
  generalScore: number;     // 1 - 100
  technicalScore: number;   // 1 - 100
  appearanceScore: number;  // 1 - 100
  overallScore: number;     // Weighted average
}

export interface MediaItem {
  id: string;
  url: string;
  altText?: string;
  isThumbnail?: boolean;
  sortOrder?: number;
}

export interface VideoItem {
  id: string;
  url: string;
  videoThumbnailUrl?: string;
  title?: string;
}

export interface ProductMedia {
  images: MediaItem[];
  videos: VideoItem[];
  images360?: string[];
  thumbnailUrl: string;
}

export interface ProductAccessory {
  id: string;
  name: string;
  included: boolean;
  condition?: string;
  notes?: string;
}

export interface ProductInspectionItem {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  description: string;
  photoUrls?: string[];
}

export interface ProductInspectionReport {
  id: string;
  inspectionDate: string;
  inspectorName: string;
  overallResult: 'passed' | 'warning' | 'failed';
  overallNotes?: string;
  items: ProductInspectionItem[];
}

export type TimelineEventType = 
  | 'purchased'
  | 'cleaned'
  | 'repaired'
  | 'inspected'
  | 'photographed'
  | 'published'
  | 'reserved'
  | 'sold'
  | 'maintenance'
  | 'custom';

export interface ProductTimelineEvent {
  id: string;
  event: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  openGraphImage?: string;
}

export interface ProductAnalytics {
  views: number;
  uniqueVisitors: number;
  whatsappClicks: number;
  reservationCount: number;
  purchaseCount: number;
  negotiationRequests: number;
  favoriteCount: number;
  averageViewDurationSeconds: number;
  conversionRate: number;
}


export interface ProductAiSuggestions {
  suggestedDescription?: string;
  suggestedTags?: string[];
  suggestedCategory?: string;
  suggestedSpecs?: Record<string, string>;
  suggestedPrice?: number;
  suggestedSummary?: string;
  qualityReview?: {
    overallQualityRating: number;
    pros: string[];
    cons: string[];
    improvementTips: string[];
  };
  approvalStatus: 'pending' | 'approved' | 'rejected'; // Mandatory Admin Approval
}

export interface ProductPurchaseHistory {
  supplierId?: string;
  supplierName: string;
  purchaseDate: string;
  purchaseCost: number;
  transportationCost: number;
  maintenanceCost: number;
  cleaningCost: number;
  accessoriesCost: number;
  totalCost: number;
  adminNotes?: string;
}

export interface ProductSaleRecord {
  buyerName: string;
  buyerPhone: string;
  saleDate: string;
  salePrice: number;
  totalCost: number;
  profit: number;
  invoiceNumber: string;
  paymentMethod: 'cash' | 'instapay' | 'vodafone_cash' | 'card' | string;
  reservationReference?: string;
  adminNotes?: string;
}

// ==========================================
// COMPREHENSIVE PRODUCT MODEL
// ==========================================
export interface Product {
  // Identification
  id: string;
  qrCode: string;
  barcode: string;
  title: string;
  shortName?: string;
  brand: string;
  model?: string;
  categoryId: string;

  // Pricing & Negotiation
  price: number;
  originalPrice?: number;
  minNegotiationPrice?: number;
  isNegotiable: boolean;

  // Status & Condition
  condition: ProductCondition;
  conditionRating?: number; // 1-10 scale for used items (e.g. 9.5/10)
  status: ProductStatus;
  showroomLocation: string; // e.g. "المعادي - شارع 68 - صالة العرض الرئيسية"
  arrivalDate?: string;

  // Financials & History
  financials?: ProductFinancials;
  purchaseHistory?: ProductPurchaseHistory;
  saleRecord?: ProductSaleRecord;
  archiveReason?: 'sold' | 'damaged' | 'returned' | 'cancelled' | 'other';
  archivedAt?: string;
  isArchived?: boolean;

  // Warranty
  warrantyCardAvailable?: boolean;
  warrantyAvailable?: boolean;
  warrantyDetails?: string;
  warrantyImages?: string[];
  warrantyImageUrl?: string;
  warranty?: ProductWarranty;

  // Health Scores
  healthScores?: ProductHealthScores;

  // Descriptions & Story
  description: string;
  publicDescription?: string;
  productStory?: string;
  internalNotes?: string;
  aiGeneratedDescription?: string;

  // Specifications
  specs: ProductSpec[];

  // Media
  images: string[];
  videos?: string[];
  media?: ProductMedia;

  // Accessories
  accessories?: ProductAccessory[];

  // Dynamic Tags
  tags?: string[];
  isFeatured?: boolean;

  // Inspection & Lifecycle
  inspectionReport?: ProductInspectionReport;
  timeline?: ProductTimelineEvent[];

  // SEO & Search
  seo?: ProductSEO;

  // Analytics
  analytics?: ProductAnalytics;
  viewsCount?: number;

  // Reservation & Visibility
  isReserved?: boolean;
  reservedBy?: string;
  reservedUntil?: string;
  isPublished?: boolean;
  availabilityStatus?: ProductStatus;

  // AI Suggestions
  aiSuggestions?: ProductAiSuggestions;

  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  totalOrders?: number;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  customerName: string;
  customerPhone: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  customerEmail?: string;
  source?: string;
  status: 'Reserved' | 'Expired' | 'Cancelled' | 'Completed' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  expiresAt?: string;
  durationHours?: number;
  preferredVisitTime?: string;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  condition: ProductCondition;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'vodafone_cash' | 'card';
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: string;
}


export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  issueDate: string;
  dueDate: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  referenceType: 'reservation' | 'order' | 'invoice';
  referenceId: string;
  amount: number;
  method: 'instapay' | 'vodafone_cash' | 'cash' | 'card';
  status: 'completed' | 'pending' | 'rejected';
  proofImage?: string;
  date: string;
}

export type RequestStatus = 'new' | 'under_review' | 'contacted' | 'accepted' | 'rejected' | 'completed';

export interface TradeRequest {
  id: string;
  requestNumber?: string;
  customerName: string;
  customerPhone: string;
  whatsappPhone?: string;
  area?: string;
  notes?: string;
  currentApplianceType: string;
  currentBrand: string;
  currentModel?: string;
  currentCondition?: string;
  workingStatus?: string;
  currentConditionNotes?: string;
  photoUrls: string[];
  videoUrl?: string;
  desiredProductId?: string;
  desiredProductTitle?: string;
  desiredProductPrice?: number;
  desiredProductImage?: string;
  estimatedTradeValue?: number;
  isNegotiable?: boolean;
  status: RequestStatus | 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ExchangeRequest extends TradeRequest {}

export interface SellRequest {
  id: string;
  requestNumber?: string;
  customerName: string;
  customerPhone: string;
  whatsappPhone?: string;
  customerEmail?: string;
  area?: string;
  address?: string;
  preferredContactTime?: string;
  applianceType: string;
  brand: string;
  model?: string;
  deviceName?: string;
  year?: string;
  condition?: string;
  workingStatus?: string;
  previousRepairs?: string;
  description?: string;
  capacitySize?: string;
  specifications?: string;
  accessoriesIncluded?: string;
  missingParts?: string;
  problemsOrDefects?: string;
  askingPrice: number;
  isNegotiable?: boolean;
  notes?: string;
  photoUrls: string[];
  videoUrl?: string;
  location?: string;
  status: RequestStatus | 'pending' | 'inspection_scheduled' | 'purchased' | 'rejected';
  createdAt: string;
}

export interface ShowroomSettings {
  name: string;
  brandTagline: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  whatsappPhone: string;
  secondaryWhatsappPhone?: string;
  address: {
    governorate: string;
    area: string;
    street: string;
    landmarks: string;
    fullAddress: string;
    googleMapsUrl: string;
    googleMapsEmbedUrl?: string;
    googleMapsFullUrl?: string;
    directionsUrl?: string;
    placeId?: string;
    staticMapUrl?: string;
    latitude?: number;
    longitude?: number;
  };
  workingHours: {
    start: string;
    end: string;
    text: string;
  };
  instapay: {
    accountHandle: string;
    qrCodeUrl?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  logoUrl?: string;
  faviconUrl?: string;
  businessPolicies?: {
    warrantyPolicy: string;
    reservationPolicy: string;
    returnPolicy: string;
    inspectionPolicy: string;
  };
  deliveryCities: string[];
  enableAiAssistant: boolean;
  currencySymbol: string;
}

export * from './auth';

export interface AnalyticsSummary {
  totalProducts: number;
  availableProducts: number;
  reservedProducts: number;
  totalReservations: number;
  totalSales: number;
  totalRevenue: number;
  tradeRequestsCount: number;
  sellRequestsCount: number;
  topCategories: { categoryName: string; count: number }[];
}

export interface AiConfig {
  apiKeySet: boolean;
  model: string;
  systemPrompt: string;
  autoSuggestSimilar: boolean;
  enableWhatsAppBot: boolean;
}

// UI & System State Interfaces
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface Review {
  id?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
  location?: string;
}
