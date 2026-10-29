import {
  Product,
  ProductFinancials,
  ProductHealthScores,
  ProductMedia,
  ProductTimelineEvent,
  TimelineEventType,
  ProductInspectionReport,
  ProductInspectionItem,
  ProductSEO,
  ProductAnalytics,
  ProductAiSuggestions,
  ShowroomSettings,
} from '../types';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../constants/placeholders';

/**
 * FINANCIALS ENGINE
 * Calculates total cost and expected profit margins
 */
export function calculateProductFinancials(financials?: ProductFinancials, sellingPrice: number = 0): ProductFinancials {
  const purchasePrice = financials?.purchasePrice || 0;
  const repairCost = financials?.repairCost || 0;
  const transportCost = financials?.transportCost || 0;
  const totalCost = purchasePrice + repairCost + transportCost;
  const finalSellingPrice = financials?.finalSellingPrice || sellingPrice;
  const expectedProfit = finalSellingPrice - totalCost;

  return {
    purchasePrice,
    repairCost,
    transportCost,
    totalCost,
    expectedProfit,
    finalSellingPrice,
  };
}

/**
 * HEALTH SCORES ENGINE
 * Computes weighted overall condition score for products (especially used/refurbished)
 */
export function calculateHealthScores(scores?: Partial<ProductHealthScores>): ProductHealthScores {
  const generalScore = scores?.generalScore ?? 95;
  const technicalScore = scores?.technicalScore ?? 95;
  const appearanceScore = scores?.appearanceScore ?? 90;

  // Weighted average: 50% Technical, 30% Appearance, 20% General
  const overallScore = Math.round((technicalScore * 0.50) + (appearanceScore * 0.30) + (generalScore * 0.20));

  return {
    generalScore,
    technicalScore,
    appearanceScore,
    overallScore,
  };
}

/**
 * IDENTIFIERS ENGINE (QR Code & Barcode Generator)
 */
export function generateBarcode(productId: string, categoryId: string): string {
  const cleanId = productId.replace(/\D/g, '').padStart(4, '0');
  const cleanCat = categoryId.replace(/\D/g, '').padStart(3, '0');
  return `2026${cleanCat}${cleanId}`;
}

export function generateQrCodeUrl(productId: string, appBaseUrl: string = 'https://proteck-maadi.com'): string {
  return `${appBaseUrl}/product/${productId}?qr_ref=showroom_maadi_68`;
}

/**
 * MEDIA SYSTEM ENGINE
 */
export function buildProductMedia(images: string[], videos: string[] = [], images360: string[] = []): ProductMedia {
  const mediaImages = images.map((url, idx) => ({
    id: `img-${idx + 1}`,
    url,
    altText: `صورة جهاز PRO TECK - المعادي #${idx + 1}`,
    isThumbnail: idx === 0,
    sortOrder: idx + 1,
  }));

  const mediaVideos = videos.map((url, idx) => ({
    id: `vid-${idx + 1}`,
    url,
    title: `فيديو فحص وترتيب الجهاز #${idx + 1}`,
  }));

  return {
    images: mediaImages,
    videos: mediaVideos,
    images360,
    thumbnailUrl: images[0] || DEFAULT_PRODUCT_PLACEHOLDER,
  };
}

/**
 * PRODUCT TIMELINE ARCHITECTURE
 */
import { IdGenerator } from '../core/services/IdGenerator';

export function createTimelineEvent(
  event: TimelineEventType,
  title: string,
  description?: string,
  actor: string = 'فريق المعاينة والصيانة - معرض PRO TECK'
): ProductTimelineEvent {
  return {
    id: IdGenerator.generateUniqueId('tl'),
    event,
    title,
    description,
    timestamp: new Date().toISOString(),
    actor,
  };
}

export function getDefaultProductTimeline(product: Partial<Product>): ProductTimelineEvent[] {
  const isUsed = product.condition === 'used' || product.condition === 'refurbished';
  
  const events: ProductTimelineEvent[] = [
    {
      id: 'tl-1',
      event: 'purchased',
      title: isUsed ? 'شراء الجهاز وفحصه الأولي من المالك السابق' : 'استلام الجهاز من الوكيل المعتمد (فرز أول)',
      description: 'تم تسجيل الجهاز وسلسلة الأرقام التسلسلية بالمعرض',
      timestamp: product.arrivalDate || product.createdAt || '2026-07-20T10:00:00Z',
      actor: 'إدارة المشتريات - PRO TECK',
    },
  ];

  if (isUsed) {
    events.push({
      id: 'tl-2',
      event: 'repaired',
      title: 'صيانة وقائية واختبار الضغط والكهرباء',
      description: 'تم اختبار الموتور وتغيير القطع الاستهلاكية بأخرى أصلية 100%',
      timestamp: '2026-07-21T12:00:00Z',
      actor: 'مهندس الصيانة المعتمد',
    });
    events.push({
      id: 'tl-3',
      event: 'cleaned',
      title: 'تعقيم وتنظيف بخار وشطف عالي الفاعلية',
      description: 'تنظيف كامل وشامل بمواد تعقيم إيطالية قبل العرض',
      timestamp: '2026-07-22T09:00:00Z',
      actor: 'فريق تجهيز المعروضات',
    });
  }

  events.push({
    id: 'tl-4',
    event: 'inspected',
    title: 'الفحص الفني النهائي واعتماد شهادة الجودة',
    description: 'اصدار التقرير الفني الشامل وتحديد درجة تقييم الجهاز',
    timestamp: '2026-07-23T14:00:00Z',
    actor: 'كبير مهندسي الفحص الجودة',
  });

  events.push({
    id: 'tl-5',
    event: 'published',
    title: 'عرض الجهاز بجناح معرض المعادي والموقع الإلكتروني',
    description: 'جاهز للمعاينة الفورية والحجز أو الشراء مباشر',
    timestamp: product.createdAt || '2026-07-24T10:00:00Z',
    actor: 'إدارة المعرض - المعادي',
  });

  if (product.status === 'reserved') {
    events.push({
      id: 'tl-6',
      event: 'reserved',
      title: 'تم حجز الجهاز بالمعرض',
      description: 'الجهاز مخصص للعميل وفي انتظار استكمال الإجراءات أو التسليم',
      timestamp: new Date().toISOString(),
      actor: 'قسم المبيعات',
    });
  } else if (product.status === 'sold') {

    events.push({
      id: 'tl-7',
      event: 'sold',
      title: 'تم بيع الجهاز وتسليمه للعميل بنجاح',
      description: 'تم البيع وتفعيل فترة الضمان المعتمدة',
      timestamp: new Date().toISOString(),
      actor: 'قسم الشحن والتسليمات',
    });
  }

  return events;
}

/**
 * INSPECTION REPORT ARCHITECTURE
 */
export function generateDefaultInspectionReport(product: Partial<Product>): ProductInspectionReport {
  const isNew = product.condition === 'new';

  const items: ProductInspectionItem[] = [
    {
      id: 'insp-1',
      title: isNew ? 'حالة الكرتونة والتغليف الأصلي' : 'سلامة الموتور والكمبروسر الفني',
      status: 'passed',
      description: isNew ? 'الكرتونة فابريقة بالتغليف الحراري الأصلي من الوكيل' : 'الموتور أصلية فابريقة بدون أي تعديل أو لحامات، درجة الحرارة والضغط مثالية',
    },
    {
      id: 'insp-2',
      title: isNew ? 'مطابقة السيريال نمبر وضمان الوكيل' : 'دائرة الكهرباء واللوحة الإلكترونية Digital Board',
      status: 'passed',
      description: isNew ? 'الأرقام التسلسلية مطابقة 100% لشهادة الضمان' : 'استجابة سريعة للوحة المفاتيح ولا يوجد أي سخونة غير طبيعية',
    },
    {
      id: 'insp-3',
      title: 'حالة الصاج الخارجي والدهان (Appearance)',
      status: 'passed',
      description: 'خالي من الصدأ والخدوش العميقة، تم دهان الوقاية الإيطالي في الأماكن الحساسة',
    },
    {
      id: 'insp-4',
      title: 'النظافة الداخلية والتعقيم بالبخار',
      status: 'passed',
      description: 'معقم 100% بالبخار ومواد خالية من الكيماويات الضارة بالأغذية أو الملابس',
    },
    {
      id: 'insp-5',
      title: 'اكتمال الملحقات والإكسسوارات الداخلية',
      status: product.conditionRating && product.conditionRating < 9.0 ? 'warning' : 'passed',
      description: 'جميع الرفوف والصواني والأجزاء الأصلية موجودة وسليمة 100%',
    }
  ];

  return {
    id: `ir-${product.id || 'new'}`,
    inspectionDate: '2026-07-23',
    inspectorName: 'م. أحمد الشريف - خبير فحص الأجهزة الفنية المعادي',
    overallResult: 'passed',
    overallNotes: 'تم اجتياز كافة اختبارات السلامة والأداء الفني بنجاح. الجهاز جاهز للتشغيل الفوري مع ضمان المعرض.',
    items,
  };
}

/**
 * SEO & SCHEMA.ORG JSON-LD GENERATOR
 */
export function generateProductSEO(product: Product, _showroomSettings?: ShowroomSettings): ProductSEO {
  const brand = product.brand || 'PRO TECK';
  const condText = product.condition === 'new' ? 'جديد بالضمان' : `مستعمل بحالة الزيرو (${product.conditionRating || 9.5}/10)`;
  
  const seoTitle = `${product.title} - ${brand} | معرض PRO TECK المعادي`;
  const seoDesc = `اشتري ${product.title} بسعر ${product.price.toLocaleString('ar-EG')} ج.م. ${condText}. معاينة فورية بمعرض المعادي شارع 68، ضمان معتمد وتوصيل للقاهرة والجيزة.`;
  const keywords = [
    product.title,
    product.brand,
    product.model || '',
    'أجهزة منزلية المعادي',
    'أجهزة مستعملة المعادي',
    'معرض PRO TECK',
    'أجهزة كهربائية بالضمان',
    product.condition === 'new' ? 'أجهزة فرز أول' : 'أجهزة زيرو مستعملة',
  ].filter(Boolean);

  return {
    title: seoTitle,
    description: seoDesc,
    keywords,
    canonicalUrl: `https://proteck-maadi.com/product/${product.id}`,
    openGraphImage: product.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER,
  };
}

export function generateProductJsonLd(product: Product, showroomSettings?: ShowroomSettings) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.title,
    'image': product.images,
    'description': product.description,
    'sku': product.barcode || product.id,
    'gtin13': product.barcode,
    'brand': {
      '@type': 'Brand',
      'name': product.brand,
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://proteck-maadi.com/product/${product.id}`,
      'priceCurrency': 'EGP',
      'price': product.price,
      'priceValidUntil': '2027-12-31',
      'itemCondition': product.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      'availability': product.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': showroomSettings?.name || BUSINESS_CONFIG.name,
        'address': showroomSettings?.address?.fullAddress || BUSINESS_CONFIG.address.fullAddress,
      },
    },
  };
}

/**
 * ANALYTICS ENGINE
 */
export function initializeProductAnalytics(existing?: Partial<ProductAnalytics>): ProductAnalytics {
  return {
    uniqueVisitors: existing?.uniqueVisitors ?? 0,
    whatsappClicks: existing?.whatsappClicks ?? 0,
    reservationCount: existing?.reservationCount ?? 0,
    purchaseCount: existing?.purchaseCount ?? 0,
    negotiationRequests: existing?.negotiationRequests ?? 0,
    favoriteCount: existing?.favoriteCount ?? 0,
    averageViewDurationSeconds: existing?.averageViewDurationSeconds ?? 0,
    conversionRate: existing?.conversionRate ?? 0,
  };

}

/**
 * AI PREPARATION & GOVERNANCE ENGINE
 * Enforces Administrator Approval Rule!
 */
export function buildAiSuggestionModel(product: Partial<Product>): ProductAiSuggestions {
  return {
    suggestedDescription: `جهاز ${product.title} من ماركة ${product.brand} العالمية. يتميز بالاعتمادية العالية مع ضمان المعرض الفعلي بمعادي القاهرة.`,
    suggestedTags: ['الأكثر مبيعاً', 'حالة فابريقة', 'خصم المعاينة'],
    suggestedCategory: product.categoryId,
    suggestedPrice: product.price ? Math.round(product.price * 0.98) : undefined,
    suggestedSummary: 'جهاز من الدرجة الأولى خاضع لفحص الجودة الشامل، مثالي للعائلات يبحث عن الجودة مع السعر النافس.',
    qualityReview: {
      overallQualityRating: product.conditionRating || 9.5,
      pros: ['محرك أصلي 100%', 'استهلاك طاقة موفر جداً', 'خالي من الخدوش في الواجهة'],
      cons: product.condition === 'used' ? ['كرتونة بديلة وليست كرتونة الفابريقة'] : [],
      improvementTips: ['إضافة فيديو 360 درجة لتعزيز نسبة الحجز العالي'],
    },
    approvalStatus: 'pending', // IMPORTANT: Mandatory Pending state
  };
}

/**
 * Approve AI Suggestion (Admin Action)
 * Safely transfers pending AI suggestions to the live Product fields
 */
export function applyApprovedAiSuggestion(product: Product): Product {
  if (!product.aiSuggestions || product.aiSuggestions.approvalStatus !== 'pending') {
    return product;
  }

  const suggestions = product.aiSuggestions;

  return {
    ...product,
    aiGeneratedDescription: suggestions.suggestedDescription,
    publicDescription: suggestions.suggestedDescription || product.description,
    tags: Array.from(new Set([...(product.tags || []), ...(suggestions.suggestedTags || [])])),
    aiSuggestions: {
      ...suggestions,
      approvalStatus: 'approved',
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reject AI Suggestion (Admin Action)
 */
export function rejectAiSuggestion(product: Product): Product {
  if (!product.aiSuggestions) return product;

  return {
    ...product,
    aiSuggestions: {
      ...product.aiSuggestions,
      approvalStatus: 'rejected',
    },
    updatedAt: new Date().toISOString(),
  };
}
