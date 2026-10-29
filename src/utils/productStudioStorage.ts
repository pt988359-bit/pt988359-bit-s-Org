import {
  EnrichedProduct,
  SpecCategoryTemplate,
  ProductLifecycleStage,
} from '../types/productStudio';
import { ProductStatus } from '../types/index';
import { firestoreStorageAdapter } from '../core/storage/FirestoreStorageAdapter';
import { defaultProductRepository } from '../core/repositories/ProductRepository';
import { LoggerService } from '../core/services/LoggerService';
import { AdminSessionService } from '../core/services/AdminSessionService';
import { setDocData, updateDocData, deleteDocData } from '../firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../core/config/FirestoreConfig';

export interface NormalizedLifecycleState {
  status: ProductStatus;
  availabilityStatus: ProductStatus;
  lifecycleStage: ProductLifecycleStage;
}

/**
 * Centralized helper for synchronizing product state transitions.
 * Guaranteed invariant triplet:
 * - AVAILABLE: status = 'available', availabilityStatus = 'available', lifecycleStage = 'published'
 * - RESERVED:  status = 'reserved',  availabilityStatus = 'reserved',  lifecycleStage = 'published'
 * - SOLD:      status = 'sold',      availabilityStatus = 'sold',      lifecycleStage = 'sold'
 * - ARCHIVED:  status = 'archived',  availabilityStatus = 'archived',  lifecycleStage = 'archived'
 * - DRAFT:     status = 'draft',     availabilityStatus = 'unavailable', lifecycleStage = 'draft'
 */
export function normalizeLifecycleState(
  input: string | { status?: string; availabilityStatus?: string; lifecycleStage?: string; isArchived?: boolean; isPublished?: boolean; [key: string]: any }
): NormalizedLifecycleState {
  if (!input) {
    return {
      status: 'available',
      availabilityStatus: 'available',
      lifecycleStage: 'published',
    };
  }

  let rawState = '';

  if (typeof input === 'string') {
    rawState = input.trim().toLowerCase();
  } else if (typeof input === 'object') {
    if (input.isArchived === true) {
      rawState = 'archived';
    } else if (input.status) {
      rawState = String(input.status).trim().toLowerCase();
    } else if (input.availabilityStatus) {
      rawState = String(input.availabilityStatus).trim().toLowerCase();
    } else if (input.lifecycleStage) {
      rawState = String(input.lifecycleStage).trim().toLowerCase();
    } else if (input.isPublished !== undefined) {
      rawState = input.isPublished ? 'available' : 'draft';
    } else if (input.isArchived === false) {
      rawState = 'available';
    }
  }

  switch (rawState) {
    case 'available':
    case 'published':
    case 'active':
    case 'ready':
    case 'in_stock':
      return {
        status: 'available',
        availabilityStatus: 'available',
        lifecycleStage: 'published',
      };

    case 'reserved':
      return {
        status: 'reserved',
        availabilityStatus: 'reserved',
        lifecycleStage: 'published',
      };

    case 'sold':
      return {
        status: 'sold',
        availabilityStatus: 'sold',
        lifecycleStage: 'sold',
      };

    case 'archived':
      return {
        status: 'hidden',
        availabilityStatus: 'hidden',
        lifecycleStage: 'archived',
      };

    case 'draft':
    case 'hidden':
    case 'unavailable':
      return {
        status: 'hidden',
        availabilityStatus: 'hidden',
        lifecycleStage: 'draft',
      };

    default:
      // Default non-archived, non-draft products to available & published
      return {
        status: 'available',
        availabilityStatus: 'available',
        lifecycleStage: 'published',
      };
  }
}

export const INITIAL_SPEC_TEMPLATES: SpecCategoryTemplate[] = [
  {
    id: 'tmpl-ref',
    categoryId: 'cat-refrigerators',
    categoryName: 'الثلاجات والديب فريزر',
    fields: [
      { key: 'capacity', labelArabic: 'السعة باللتر / القدم', labelEnglish: 'Capacity', fieldType: 'text', required: true, unit: 'قدم' },
      { key: 'cooling_tech', labelArabic: 'تكنولوجيا التبريد', labelEnglish: 'Cooling Technology', fieldType: 'select', options: ['نوفروست بخار', 'ديفروست ثلج', 'انفرتر موفر للكهرباء', 'Dual Fan Cooling'], required: true },
      { key: 'doors_count', labelArabic: 'عدد الأبواب', labelEnglish: 'Doors Count', fieldType: 'select', options: ['2 باب', '3 باب', '4 باب دولابي', 'باب واحد'], required: true },
      { key: 'energy_rating', labelArabic: 'كفاءة الطاقة', labelEnglish: 'Energy Rating', fieldType: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B'] },
      { key: 'refrigerant', labelArabic: 'غاز التبريد', labelEnglish: 'Refrigerant', fieldType: 'text', defaultValue: 'R600a' },
      { key: 'dimensions', labelArabic: 'الأبعاد (عرض×عمق×ارتفاع)', labelEnglish: 'Dimensions', fieldType: 'text', unit: 'سم' },
      { key: 'color', labelArabic: 'اللون والتشطيب', labelEnglish: 'Color', fieldType: 'text', defaultValue: 'إينوكس اسود / فضي' },
      { key: 'inverter', labelArabic: 'موتور انفرتر ذكي', labelEnglish: 'Inverter Engine', fieldType: 'boolean', defaultValue: true },
    ],
  },
  {
    id: 'tmpl-wm',
    categoryId: 'cat-washers',
    categoryName: 'الغسالات والنشافات',
    fields: [
      { key: 'wash_capacity', labelArabic: 'سعة الغسيل', labelEnglish: 'Wash Capacity', fieldType: 'text', required: true, unit: 'كجم' },
      { key: 'rpm', labelArabic: 'سرعة الدوران (لفة/دقيقة)', labelEnglish: 'Spin Speed', fieldType: 'select', options: ['1400 RPM', '1200 RPM', '1000 RPM', '800 RPM'], required: true },
      { key: 'loading_type', labelArabic: 'نوع التحميل', labelEnglish: 'Loading Type', fieldType: 'select', options: ['تحميل أمامي اتوماتيك', 'تحميل علوي فوق اتوماتيك', 'هاف اتوماتيك'], required: true },
      { key: 'steam_wash', labelArabic: 'برنامج الغسيل بالبخار', labelEnglish: 'Steam Care', fieldType: 'boolean', defaultValue: true },
      { key: 'dryer', labelArabic: 'مجفف حراري مدمج', labelEnglish: 'Built-in Dryer', fieldType: 'boolean', defaultValue: false },
      { key: 'motor_type', labelArabic: 'نوع الموتور', labelEnglish: 'Motor Type', fieldType: 'select', options: ['Direct Drive الدفع المباشر', 'Inverter Belt Motor', 'Universal Motor'] },
    ],
  },
  {
    id: 'tmpl-micro',
    categoryId: 'cat-microwaves',
    categoryName: 'الميكروويف والأفران',
    fields: [
      { key: 'capacity_liters', labelArabic: 'السعة باللتر', labelEnglish: 'Capacity Liters', fieldType: 'text', required: true, unit: 'لتر' },
      { key: 'wattage', labelArabic: 'قدرة التسخين (وات)', labelEnglish: 'Power Wattage', fieldType: 'text', unit: 'وات' },
      { key: 'grill', labelArabic: 'شواية مدمجة', labelEnglish: 'Built-in Grill', fieldType: 'boolean', defaultValue: true },
      { key: 'convection', labelArabic: 'فرن هواء مروحة Convection', labelEnglish: 'Convection', fieldType: 'boolean', defaultValue: false },
      { key: 'control_type', labelArabic: 'شاشة ولوحة التحكم', labelEnglish: 'Control Type', fieldType: 'select', options: ['ديجيتال باللمس', 'بكر ميكانيكي', 'هجين بكر ولمس'] },
    ],
  },
  {
    id: 'tmpl-airfryer',
    categoryId: 'cat-fryers',
    categoryName: 'القلايات الهوائية بدون زيت',
    fields: [
      { key: 'fryer_capacity', labelArabic: 'سعة السلة', labelEnglish: 'Basket Capacity', fieldType: 'text', required: true, unit: 'لتر / كجم' },
      { key: 'power_watt', labelArabic: 'القدرة الكهربائية', labelEnglish: 'Power', fieldType: 'text', unit: 'وات' },
      { key: 'baskets_count', labelArabic: 'عدد السلات', labelEnglish: 'Baskets', fieldType: 'select', options: ['سلة واحدة كبيرة', 'سلتين مزدوجة DualZone'] },
      { key: 'window', labelArabic: 'نافذة رؤية شفافة', labelEnglish: 'Clear Window', fieldType: 'boolean', defaultValue: true },
    ],
  },
  {
    id: 'tmpl-tv',
    categoryId: 'cat-tvs',
    categoryName: 'الشاشات والتلفزيونات',
    fields: [
      { key: 'screen_size', labelArabic: 'حجم الشاشة', labelEnglish: 'Screen Size', fieldType: 'text', required: true, unit: 'بوصة' },
      { key: 'display_tech', labelArabic: 'تكنولوجيا العرض', labelEnglish: 'Display Tech', fieldType: 'select', options: ['OLED 4K', 'QLED 4K', '4K UHD LED', 'FHD LED'], required: true },
      { key: 'smart_os', labelArabic: 'نظام التشغيل الذكي', labelEnglish: 'Smart OS', fieldType: 'select', options: ['Google TV / Android', 'webOS (LG)', 'Tizen (Samsung)', 'Vidaa OS'] },
      { key: 'refresh_rate', labelArabic: 'معدل التحديث', labelEnglish: 'Refresh Rate', fieldType: 'select', options: ['120Hz Gaming', '60Hz Standard'] },
    ],
  },
];

export const INITIAL_ENRICHED_PRODUCTS: EnrichedProduct[] = [];

export const LIFECYCLE_STAGE_LABELS: Record<ProductLifecycleStage, { label: string; bg: string; text: string; border: string }> = {
  draft: { label: 'مسودة جاري التجهيز', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  purchased: { label: 'تم الشراء حديثاً', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  pending_inspection: { label: 'قيد الفحص الفني', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  cleaning: { label: 'التنظيف والتعقيم', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  maintenance: { label: 'الصيانة والتجهيز', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  photography: { label: 'التصوير الفوتوغرافي', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  pending_review: { label: 'المراجعة والاعتماد', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  published: { label: 'منشور بالمعرض والموقع', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  reserved: { label: 'محجوز (24 ساعة)', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  sold: { label: 'تم البيع والتسليم', bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
  archived: { label: 'مؤرشف بالسلة', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

const STORAGE_KEY = 'proteck_enriched_products';

export function getStoredEnrichedProducts(): EnrichedProduct[] {
  try {
    const repoItems = defaultProductRepository.getAll() as EnrichedProduct[];
    if (repoItems && repoItems.length > 0) {
      return repoItems.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
      }));
    }
    const parsed = firestoreStorageAdapter.getItem<EnrichedProduct[]>(STORAGE_KEY);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed.map((p) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
    }));
  } catch (err) {
    LoggerService.error('productStudioStorage', 'Error reading enriched products from storage', err);
    return [];
  }
}

export function saveEnrichedProducts(products: EnrichedProduct[]): void {
  try {
    if (!products) {
      return;
    }

    if (products.length === 0) {
      try {
        firestoreStorageAdapter.setItem(STORAGE_KEY, []);
      } catch (storageErr) {
        LoggerService.warn('productStudioStorage', 'StorageAdapter setItem warning', storageErr);
      }
      return;
    }

    // Create a lightweight copy of products without Base64 images to prevent QuotaExceededError in local cache
    const lightweightProducts: EnrichedProduct[] = products.map((product) => {
      let cleanedImages: string[] = [];
      const rawImages: unknown = product.images;
      if (Array.isArray(rawImages)) {
        cleanedImages = rawImages.filter(
          (img: unknown): img is string => typeof img === 'string' && !img.startsWith('data:image')
        );
      } else if (typeof rawImages === 'string') {
        cleanedImages = rawImages.startsWith('data:image') ? [] : [rawImages];
      }

      return {
        ...product,
        images: cleanedImages,
      };
    });

    try {
      firestoreStorageAdapter.setItem(STORAGE_KEY, lightweightProducts);
    } catch (storageErr) {
      LoggerService.warn('productStudioStorage', 'StorageAdapter setItem warning', storageErr);
    }
  } catch (err) {
    LoggerService.error('productStudioStorage', 'Error saving enriched products to storage', err);
  }
}

export async function saveEnrichedProductToFirestore(product: EnrichedProduct): Promise<void> {
  const norm = normalizeLifecycleState(product);
  const normalizedProduct: EnrichedProduct = {
    ...product,
    status: norm.status as any,
    availabilityStatus: norm.availabilityStatus,
    lifecycleStage: norm.lifecycleStage as any,
  };

  // 1. Non-blocking Firestore persistence (fire-and-forget without await)
  try {
    setDocData(FIRESTORE_COLLECTIONS.PRODUCTS, normalizedProduct).catch((err) => {
      LoggerService.warn('productStudioStorage', `Non-blocking Firestore sync error for product ${product.id}`, err);
    });
  } catch (firebaseErr) {
    LoggerService.warn('productStudioStorage', `Non-blocking Firebase dispatch error for product ${product.id}`, firebaseErr);
  }

  // 2. Awaited Supabase Products Table Synchronization (Live Primary Source of Truth)
  try {
    const adminToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('proteck_admin_token') : null;
    const res = await fetch('/api/admin/products/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(normalizedProduct),
    });
    const data = await res.json();
    if (data && data.status === 'success') {
      console.log(`[ShowroomContext/ProductStudio] [SUPABASE SYNC SUCCESS] Product ${product.id} ("${normalizedProduct.title || (normalizedProduct as any).name || ''}") synchronized to Supabase table products.`);
    } else {
      console.warn(`[ShowroomContext/ProductStudio] [SUPABASE SYNC WARNING] Failed to sync product ${product.id} to Supabase:`, data?.error || data);
    }
  } catch (syncErr: any) {
    console.warn(`[ShowroomContext/ProductStudio] [SUPABASE SYNC ERROR] Network error syncing product ${product.id} to Supabase:`, syncErr?.message || syncErr);
  }
}

export async function updateProductFields(
  productId: string,
  updates: Partial<EnrichedProduct>,
  currentProduct?: EnrichedProduct
): Promise<void> {
  let normalizedUpdates = { ...updates };
  if (
    updates.status !== undefined ||
    updates.availabilityStatus !== undefined ||
    updates.lifecycleStage !== undefined ||
    updates.isArchived !== undefined
  ) {
    const norm = normalizeLifecycleState(updates);
    normalizedUpdates = {
      ...normalizedUpdates,
      status: norm.status as any,
      availabilityStatus: norm.availabilityStatus,
      lifecycleStage: norm.lifecycleStage as any,
    };
  }

  // 1. Non-blocking Firestore update (fire-and-forget without await)
  try {
    updateDocData(FIRESTORE_COLLECTIONS.PRODUCTS, productId, normalizedUpdates as any).catch((err) => {
      LoggerService.warn('productStudioStorage', `Non-blocking Firestore update error for product ${productId}`, err);
    });
  } catch (firebaseErr) {
    LoggerService.warn('productStudioStorage', `Non-blocking Firebase dispatch error for product ${productId}`, firebaseErr);
  }

  // 2. Resolve complete product object (Current Product + Partial Updates)
  let baseProduct: Partial<EnrichedProduct> | undefined = currentProduct;
  const storedList = getStoredEnrichedProducts();
  const storedProduct = storedList.find((p) => p.id === productId);

  if (!baseProduct) {
    baseProduct = storedProduct;
  }

  // Combine to create the full product payload expected by Supabase /api/admin/products/sync
  const fullProduct: EnrichedProduct = {
    ...(baseProduct || {}),
    ...normalizedUpdates,
    id: productId,
    updatedAt: normalizedUpdates.updatedAt || new Date().toISOString(),
  } as EnrichedProduct;

  if ('soldAt' in updates && updates.soldAt === undefined) {
    delete fullProduct.soldAt;
  }

  // Also update local storage cache with the merged product so subsequent operations have fresh data
  if (storedList.length > 0) {
    const updatedList = storedProduct
      ? storedList.map((p) => (p.id === productId ? fullProduct : p))
      : [...storedList, fullProduct];
    saveEnrichedProducts(updatedList);
  }

  // 3. Awaited Supabase Products Table Synchronization
  try {
    const adminToken = AdminSessionService.getToken();
    const res = await fetch('/api/admin/products/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(fullProduct),
    });
    const data = await res.json();
    if (data && data.status === 'success') {
      console.log(`[ShowroomContext/ProductStudio] [SUPABASE SYNC SUCCESS] Product ${productId} ("${fullProduct.title || (fullProduct as any).name || ''}") updated and synchronized to Supabase table products.`);
    } else {
      console.warn(`[ShowroomContext/ProductStudio] [SUPABASE SYNC WARNING] Failed to sync product update ${productId} to Supabase:`, data?.error || data);
    }
  } catch (syncErr: any) {
    console.warn(`[ShowroomContext/ProductStudio] [SUPABASE SYNC ERROR] Network error syncing product update ${productId} to Supabase:`, syncErr?.message || syncErr);
  }
}

import { deleteAllProductImagesFromStorage } from '../firebase/storage';

export async function deleteEnrichedProductFromFirestore(id: string, imageUrls?: string[]): Promise<void> {
  // 1. Non-blocking Firebase deletion (fire-and-forget without await)
  try {
    if (imageUrls && imageUrls.length > 0) {
      const validStorageUrls = imageUrls.filter(
        (url) =>
          typeof url === 'string' &&
          !url.startsWith('data:') &&
          (url.includes('firebasestorage.googleapis.com') || url.startsWith('https://'))
      );
      if (validStorageUrls.length > 0) {
        deleteAllProductImagesFromStorage(validStorageUrls).catch((storageErr) => {
          LoggerService.warn('productStudioStorage', `Non-blocking storage image deletion error for ${id}`, storageErr);
        });
      }
    }
    deleteDocData(FIRESTORE_COLLECTIONS.PRODUCTS, id).catch((err) => {
      LoggerService.warn('productStudioStorage', `Non-blocking Firestore document deletion error for ${id}`, err);
    });
  } catch (firebaseErr) {
    LoggerService.warn('productStudioStorage', `Non-blocking Firebase dispatch error for ${id}`, firebaseErr);
  }

  // 2. Awaited Supabase Products Table Deletion Synchronization (Live Primary Source of Truth)
  try {
    const adminToken = AdminSessionService.getToken();
    const res = await fetch(`/api/admin/products/sync/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      },
      credentials: 'include',
    });
    const data = await res.json();
    if (data && data.status === 'success') {
      console.log(`[ShowroomContext/ProductStudio] [SUPABASE DELETE SYNC SUCCESS] Product ${id} deleted from Supabase table products.`);
    } else {
      console.warn(`[ShowroomContext/ProductStudio] [SUPABASE DELETE SYNC WARNING] Failed to delete product ${id} from Supabase:`, data?.error || data);
    }
  } catch (syncErr: any) {
    console.warn(`[ShowroomContext/ProductStudio] [SUPABASE DELETE SYNC ERROR] Network error deleting product ${id} from Supabase:`, syncErr?.message || syncErr);
  }

  // 3. Local Storage Cache Cleanup (Ensure local copy is removed permanently)
  try {
    const currentList = getStoredEnrichedProducts();
    const updatedList = currentList.filter((p) => p.id !== id);
    saveEnrichedProducts(updatedList);
    try {
      defaultProductRepository.remove(id).catch(() => {});
    } catch {
      // Non-blocking
    }
  } catch (localErr) {
    LoggerService.warn('productStudioStorage', `Error removing product ${id} from local cache`, localErr);
  }
}

