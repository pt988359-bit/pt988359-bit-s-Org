import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { firestoreHealthManager } from '../firebase/FirestoreHealthManager';
import { FIRESTORE_COLLECTIONS } from '../core/config/FirestoreConfig';
import { supabase } from '../supabase/client';
import { mapPostgresRowToItem } from '../core/storage/SupabaseStorageAdapter';
import {
  Product,
  Category,
  ShowroomSettings,
  Reservation,
  Order,
  Invoice,
  TradeRequest,
  SellRequest,
  AnalyticsSummary,
  AiConfig,
  ProductCondition,
  ProductStatus,
  SpecTemplate,
  TimelineEventType,
  Brand,
} from '../types';
import { EnrichedProduct } from '../types/productStudio';
import {
  getStoredEnrichedProducts,
  saveEnrichedProducts,
  saveEnrichedProductToFirestore,
  updateProductFields,
  deleteEnrichedProductFromFirestore,
  normalizeLifecycleState,
} from '../utils/productStudioStorage';
import { getReservations as getOrderStorageReservations, saveReservations as saveOrderStorageReservations } from '../utils/orderManagementStorage';
import { defaultBrandRepository } from '../core/repositories/BrandRepository';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_RESERVATIONS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_TRADE_REQUESTS,
  INITIAL_SELL_REQUESTS,
  INITIAL_ANALYTICS,
  INITIAL_AI_CONFIG,
} from '../data/mockData';
import { getSpecTemplateForCategory } from '../engine/specTemplates';
import { defaultSequenceService } from '../core/services/SequenceService';
import { IdGenerator } from '../core/services/IdGenerator';
import { ReservationExpirationService } from '../core/services/ReservationExpirationService';
import {
  searchProducts,
  ProductSearchFilters,
  getRelatedProducts,
  getSimilarProducts,
  getRecommendedProducts,
} from '../engine/searchEngine';
import {
  applyApprovedAiSuggestion,
  rejectAiSuggestion as rejectAiSuggestionFn,
  createTimelineEvent,
  generateBarcode,
  generateQrCodeUrl,
  calculateHealthScores,
  calculateProductFinancials,
  generateDefaultInspectionReport,
  getDefaultProductTimeline,
  buildProductMedia,
} from '../engine/productEngine';

export type RoutePath =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'categories'
  | 'sell'
  | 'reservation'
  | 'contact'
  | 'about'
  | 'faq'
  | 'verify-invoice'
  | 'my-activity'
  | 'admin'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-categories'
  | 'admin-reservations'
  | 'admin-orders'
  | 'admin-payments'
  | 'admin-invoices'
  | 'admin-customers'
  | 'admin-finance'
  | 'admin-analytics'
  | 'admin-ai'
  | 'admin-settings'
  | 'admin-system'
  | 'admin-operations';

interface ShowroomContextType {
  // Navigation
  currentRoute: RoutePath;
  navigateTo: (route: RoutePath, params?: { productId?: string; categoryId?: string; filterCondition?: ProductCondition }) => void;
  selectedProductId: string | null;
  selectedCategoryId: string | null;

  // Filter States
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  conditionFilter: 'all' | ProductCondition;
  setConditionFilter: (cond: 'all' | ProductCondition) => void;
  statusFilter: 'all' | ProductStatus;
  setStatusFilter: (status: 'all' | ProductStatus) => void;

  // Data Store
  settings: ShowroomSettings;
  updateSettings: (newSettings: Partial<ShowroomSettings>) => void;

  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Dynamic Brand Management (PART 1)
  brands: Brand[];
  activeBrands: Brand[];
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (id: string, updated: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  toggleBrand: (id: string) => void;

  products: EnrichedProduct[];
  filteredProducts: EnrichedProduct[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'> | EnrichedProduct) => void;
  updateProduct: (id: string, updated: Partial<Product | EnrichedProduct>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => EnrichedProduct | undefined;
  updateProductFields: (productId: string, updates: Partial<EnrichedProduct>) => void;
  updateProductStatus: (id: string, status: ProductStatus) => void;
  reserveProduct: (productId: string, reservedBy?: string, reservedUntil?: string) => void;
  cancelReservation: (reservationIdOrProductId: string) => void;
  confirmSale: (productId: string) => void;
  togglePublish: (productId: string, isPublished: boolean) => void;

  reservations: Reservation[];
  createReservation: (data: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'status'>) => Reservation;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;

  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;

  tradeRequests: TradeRequest[];
  submitTradeRequest: (req: Omit<TradeRequest, 'id' | 'createdAt' | 'status'> & Partial<TradeRequest>) => TradeRequest;
  updateTradeRequestStatus: (id: string, status: TradeRequest['status']) => void;

  sellRequests: SellRequest[];
  submitSellRequest: (req: Omit<SellRequest, 'id' | 'createdAt' | 'status'> & Partial<SellRequest>) => SellRequest;
  updateSellRequestStatus: (id: string, status: SellRequest['status']) => void;

  analytics: AnalyticsSummary;
  aiConfig: AiConfig;
  updateAiConfig: (config: Partial<AiConfig>) => void;

  // Phase 3 Engine Helpers
  getCategorySpecTemplate: (categoryId: string) => SpecTemplate;
  searchProductsWithEngine: (filters: ProductSearchFilters) => Product[];
  approveProductAiSuggestion: (productId: string) => void;
  rejectProductAiSuggestion: (productId: string) => void;
  addProductTimelineEvent: (
    productId: string,
    eventType: TimelineEventType,
    title: string,
    description?: string,
    actor?: string
  ) => void;
  getRelatedProductsForProduct: (productId: string, limit?: number) => Product[];
  getSimilarProductsForProduct: (productId: string, priceTolerance?: number, limit?: number) => Product[];

  // Reservation Cart
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Theme (read-only system prefers-color-scheme)
  isDarkMode: boolean;
}

const getInitialRoute = (): RoutePath => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  const url = path.includes('/admin') ? path : hash.includes('admin') ? hash : '';
  if (url) {
    if (url.includes('/admin/login') || url.includes('admin/login')) return 'admin-login';
    if (url.includes('/admin/products') || url.includes('admin/products') || url.includes('product-studio')) return 'admin-products';
    if (url.includes('/admin/categories') || url.includes('admin/categories')) return 'admin-categories';
    if (url.includes('/admin/reservations') || url.includes('admin/reservations')) return 'admin-reservations';
    if (url.includes('/admin/orders') || url.includes('admin/orders')) return 'admin-orders';
    if (url.includes('/admin/payments') || url.includes('admin/payments')) return 'admin-payments';
    if (url.includes('/admin/invoices') || url.includes('admin/invoices')) return 'admin-invoices';
    if (url.includes('/admin/customers') || url.includes('admin/customers')) return 'admin-customers';
    if (url.includes('/admin/finance') || url.includes('admin/finance')) return 'admin-finance';
    if (url.includes('/admin/analytics') || url.includes('admin/analytics')) return 'admin-analytics';
    if (url.includes('/admin/ai') || url.includes('admin/ai')) return 'admin-ai';
    if (url.includes('/admin/settings') || url.includes('admin/settings')) return 'admin-settings';
    if (url.includes('/admin/system') || url.includes('admin/system')) return 'admin-system';
    if (url.includes('/admin/operations') || url.includes('admin/operations')) return 'admin-operations';
    return 'admin-dashboard';
  }

  if (path.includes('/portal') || hash.includes('portal')) {
    return 'my-activity';
  }

  if (path.includes('/sell') || hash.includes('sell')) return 'sell';
  if (path.includes('/products') || hash.includes('products')) return 'products';
  if (path.includes('/categories') || hash.includes('categories')) return 'categories';
  if (path.includes('/reservation') || hash.includes('reservation')) return 'reservation';
  if (path.includes('/contact') || hash.includes('contact')) return 'contact';
  if (path.includes('/about') || hash.includes('about')) return 'about';
  if (path.includes('/faq') || hash.includes('faq')) return 'faq';
  if (path.includes('/verify-invoice') || hash.includes('verify-invoice')) return 'verify-invoice';
  if (path.includes('/my-activity') || hash.includes('my-activity')) return 'my-activity';

  return 'home';
};

const getUrlPathForRoute = (route: RoutePath): string => {
  if (route.startsWith('admin')) {
    switch (route) {
      case 'admin':
      case 'admin-dashboard':
        return '/admin/dashboard';
      case 'admin-login':
        return '/admin/login';
      case 'admin-products':
        return '/admin/products';
      case 'admin-categories':
        return '/admin/categories';
      case 'admin-reservations':
        return '/admin/reservations';
      case 'admin-orders':
        return '/admin/orders';
      case 'admin-payments':
        return '/admin/payments';
      case 'admin-invoices':
        return '/admin/invoices';
      case 'admin-customers':
        return '/admin/customers';
      case 'admin-finance':
        return '/admin/finance';
      case 'admin-analytics':
        return '/admin/analytics';
      case 'admin-ai':
        return '/admin/ai';
      case 'admin-settings':
        return '/admin/settings';
      case 'admin-system':
        return '/admin/system';
      case 'admin-operations':
        return '/admin/operations';
      default:
        return '/admin/dashboard';
    }
  }
  return route === 'home' ? '/' : `/${route}`;
};

const ShowroomContext = createContext<ShowroomContextType | undefined>(undefined);

export const ShowroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<RoutePath>(getInitialRoute);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | ProductCondition>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');

  // Domain Collections
  const [settings, setSettings] = useState<ShowroomSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(() => defaultBrandRepository.getAll());
  const [products, setProducts] = useState<EnrichedProduct[]>(() => getStoredEnrichedProducts());
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>(INITIAL_TRADE_REQUESTS);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>(INITIAL_SELL_REQUESTS);
  const [analytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);
  const [aiConfig, setAiConfig] = useState<AiConfig>(INITIAL_AI_CONFIG);

  // Reservation Cart
  const [cart, setCart] = useState<Product[]>([]);

  // Dark Mode (Derived strictly from system prefers-color-scheme)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (matches: boolean) => {
      setIsDarkMode(matches);
      if (matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Start reservation expiration scheduler (TASK-002: Automatic Expiration)
  useEffect(() => {
    ReservationExpirationService.startScheduler(10000);
    return () => {
      ReservationExpirationService.stopScheduler();
    };
  }, []);

  // Listen for popstate URL changes
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentRoute(route);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation Helper
  const navigateTo = (
    route: RoutePath,
    params?: { productId?: string; categoryId?: string; filterCondition?: ProductCondition }
  ) => {
    setCurrentRoute(route);
    if (params?.productId) setSelectedProductId(params.productId);

    if (params?.categoryId !== undefined) {
      setSelectedCategoryId(params.categoryId === 'all' ? null : params.categoryId);
    } else if (route === 'products' || route === 'home') {
      setSelectedCategoryId(null);
    }

    if (params?.filterCondition) {
      setConditionFilter(params.filterCondition);
    } else if (route === 'products' || route === 'home') {
      setConditionFilter('all');
    }

    const targetPath = getUrlPathForRoute(route);
    if (window.location.pathname !== targetPath && window.history?.pushState) {
      window.history.pushState({}, '', targetPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Products Computed (PART 2 & PART 12 & TASK-037: Visibility and Search Rules)
  const isAdminView = currentRoute.startsWith('admin');
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Soft deleted or explicitly archived products are hidden from public
      if (item.isArchived || item.lifecycleStage === 'archived') {
        if (!isAdminView) return false;
      }

      // 2. Public visibility rule -> hide explicit draft, hidden, sold, or reserved from default catalog list
      if (!isAdminView) {
        if (item.status === 'hidden' || item.status === 'draft' || item.lifecycleStage === 'draft') {
          return false;
        }
        if (item.status === 'sold' || item.status === 'reserved') {
          return false;
        }
      }

      // PART 12: Search logic (Public = Name, Brand, Category. Admin = Everything)
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const cat = categories.find((c) => c.id === item.categoryId);
        const categoryName = (cat?.nameAr || cat?.nameEn || cat?.name || '').toLowerCase();

        if (!isAdminView) {
          // Public search: Product Name, Brand, Category Name only
          matchesSearch =
            item.title.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            categoryName.includes(q);
        } else {
          // Admin search: Everything (Name, Brand, Category, Description, Code, Serial Number, Notes)
          matchesSearch =
            item.title.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            categoryName.includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.internalCode || '').toLowerCase().includes(q) ||
            (item.serialNumber || '').toLowerCase().includes(q) ||
            (item.id || '').toLowerCase().includes(q);
        }
      }

      const matchesCategory =
        !selectedCategoryId || selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;

      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;

      const matchesStatus = isAdminView
        ? statusFilter === 'all' || item.status === statusFilter
        : (item.status === 'available' || item.availabilityStatus === 'available' || !item.status) &&
          (item.lifecycleStage === 'published' || item.lifecycleStage === undefined || item.isPublished === true);

      return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
    });
  }, [products, isAdminView, searchQuery, categories, selectedCategoryId, conditionFilter, statusFilter]);

  // Authoritative Fetch & Real-time Supabase Products Listener (Migration Phase - Visitor Product Catalog)
  useEffect(() => {
    let isMounted = true;

    setIsLoadingProducts(true);

    async function loadProductsFromSupabase() {
      try {
        console.log('[ShowroomContext] [DATA SOURCE: SUPABASE] Fetching products from Supabase table "products"...');
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const loadedProducts = data.map((row) => {
            const item = mapPostgresRowToItem<any>('products', row);
            const normState = normalizeLifecycleState(item);
            let safeImages: string[] = [];
            if (Array.isArray(item.images)) {
              safeImages = item.images;
            } else if (typeof item.images === 'string') {
              try {
                const parsed = JSON.parse(item.images);
                safeImages = Array.isArray(parsed) ? parsed : [item.images];
              } catch {
                safeImages = item.images ? [item.images] : [];
              }
            }
            return {
              ...item,
              images: safeImages,
              status: normState.status,
              availabilityStatus: normState.availabilityStatus,
              lifecycleStage: normState.lifecycleStage,
            } as EnrichedProduct;
          });

          if (isMounted) {
            console.log(`[ShowroomContext] [DATA SOURCE: SUPABASE] Successfully loaded and normalized ${loadedProducts.length} products from Supabase.`);
            setProducts(loadedProducts);
            saveEnrichedProducts(loadedProducts);
            setIsLoadingProducts(false);
          }
          return;
        }

        // If Supabase returned an empty array, fallback to localStorage
        console.warn('[ShowroomContext] Supabase table "products" returned 0 items. Checking localStorage fallback...');
        const cached = getStoredEnrichedProducts();
        if (cached && cached.length > 0) {
          if (isMounted) {
            console.log(`[ShowroomContext] [DATA SOURCE: LOCALSTORAGE FALLBACK] Loaded ${cached.length} products from localStorage.`);
            setProducts(cached);
            setIsLoadingProducts(false);
          }
        } else {
          if (isMounted) {
            console.log('[ShowroomContext] [DATA SOURCE: SUPABASE] 0 products found in Supabase and no localStorage fallback.');
            setProducts([]);
            setIsLoadingProducts(false);
          }
        }
      } catch (err: any) {
        console.warn('[ShowroomContext] Error fetching products from Supabase, activating localStorage fallback:', err?.message || err);
        const cached = getStoredEnrichedProducts();
        if (isMounted) {
          if (cached && cached.length > 0) {
            console.log(`[ShowroomContext] [DATA SOURCE: LOCALSTORAGE FALLBACK] Loaded ${cached.length} products from localStorage following Supabase fetch error.`);
            setProducts(cached);
          } else {
            console.warn('[ShowroomContext] No fallback products found in localStorage.');
          }
          setIsLoadingProducts(false);
        }
      }
    }

    loadProductsFromSupabase();

    // Supabase Real-time listener for public:products
    let channel: any = null;
    try {
      channel = supabase
        .channel('public:products:showroom')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('[ShowroomContext] [DATA SOURCE: SUPABASE REALTIME] Realtime change detected in products table:', payload.eventType);
            loadProductsFromSupabase();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[ShowroomContext] Subscribed to Supabase realtime channel for products.');
          }
        });
    } catch (realtimeErr) {
      console.warn('[ShowroomContext] Could not attach Supabase realtime channel:', realtimeErr);
    }

    // Maximum Loading Timeout Guard (Guarantee UI never hangs on loading skeletons)
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoadingProducts(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  // Production-Safe Observability (TASK-059 STEP 13)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PROTECK_DIAGNOSTICS__ = {
        appVersion: '1.0.0-TASK-059',
        firebaseProject: 'quadratic-infusion-gzp2g',
        databaseId: 'ai-studio-proteck-f11aa4ca-9bc5-40c4-a06f-9a11f191c8e8',
        getHealthState: () => firestoreHealthManager.getState(),
        getProductsState: () => ({
          productsCount: products.length,
          filteredProductsCount: filteredProducts.length,
          isLoadingProducts,
        }),
      };
    }
  }, [products, filteredProducts, isLoadingProducts]);

  // Real-time Firestore Settings Listener (TASK-022 Requirement 6)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.SHOWROOM_SETTINGS, 'showroom_settings');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          firestoreHealthManager.recordSuccess();
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<ShowroomSettings>;
            setSettings((prev) => ({
              ...prev,
              ...data,
              address: { ...prev.address, ...(data.address || {}) },
              workingHours: { ...prev.workingHours, ...(data.workingHours || {}) },
              socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) },
              businessPolicies: { ...prev.businessPolicies, ...(data.businessPolicies || {}) },
            }));
          }
        },
        (err) => {
          firestoreHealthManager.recordError(err, 'ShowroomContext:settings');
          if (err.message?.includes('NOT_FOUND') || (err as any).code === 'not-found') {
            console.warn('Firestore settings document not found, retaining local default settings.');
          } else {
            console.warn('Firestore settings realtime listener:', err);
          }
        }
      );
    } catch (e) {
      firestoreHealthManager.recordError(e, 'ShowroomContext:settings:init');
      console.warn('Could not initialize Firestore settings listener:', e);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch {}
      }
    };
  }, []);

  // Actions
  const updateSettings = (newSettings: Partial<ShowroomSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...newSettings,
        address: { ...prev.address, ...(newSettings.address || {}) },
        workingHours: { ...prev.workingHours, ...(newSettings.workingHours || {}) },
        socialLinks: { ...prev.socialLinks, ...(newSettings.socialLinks || {}) },
        businessPolicies: { ...prev.businessPolicies, ...(newSettings.businessPolicies || {}) },
      };
      if (!firestoreHealthManager.isFallbackToLocal()) {
        try {
          const docRef = doc(db, FIRESTORE_COLLECTIONS.SHOWROOM_SETTINGS, 'showroom_settings');
          setDoc(docRef, updated, { merge: true })
            .then(() => firestoreHealthManager.recordSuccess())
            .catch((err) => {
              firestoreHealthManager.recordError(err, 'ShowroomContext:updateSettings');
              console.error('Failed to sync settings to Firestore:', err);
            });
        } catch (err) {
          firestoreHealthManager.recordError(err, 'ShowroomContext:updateSettings:sync');
          console.error('Firestore setDoc error:', err);
        }
      }
      return updated;
    });
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
      count: 0,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Brand Management Actions (PART 1)
  const activeBrands = useMemo(() => brands.filter((b) => b.isActive !== false), [brands]);

  const addBrand = (brandData: Omit<Brand, 'id'>) => {
    const newBrand: Brand = {
      ...brandData,
      id: 'brand-' + Date.now(),
      isActive: brandData.isActive !== false,
      sortOrder: brands.length + 1,
    };
    defaultBrandRepository.save(newBrand);
    setBrands((prev) => [...prev, newBrand]);
  };

  const updateBrand = (id: string, updated: Partial<Brand>) => {
    defaultBrandRepository.update(id, updated);
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBrand = (id: string) => {
    defaultBrandRepository.delete(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBrand = (id: string) => {
    const target = brands.find((b) => b.id === id);
    if (!target) return;
    updateBrand(id, { isActive: !target.isActive });
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'> | EnrichedProduct) => {
    const prodId = (prodData as any).id || ('prod-' + Date.now());
    const qrCode = prodData.qrCode || generateQrCodeUrl(prodId);
    const barcode = prodData.barcode || generateBarcode(prodId, prodData.categoryId);
    const healthScores = prodData.healthScores || calculateHealthScores();
    const financials = prodData.financials || calculateProductFinancials(undefined, prodData.price);
    const inspectionReport = prodData.inspectionReport || generateDefaultInspectionReport(prodData);
    const timeline = prodData.timeline || getDefaultProductTimeline(prodData);
    const media = prodData.media || buildProductMedia(prodData.images || []);
    const normState = normalizeLifecycleState(prodData as any);

    const newProd: EnrichedProduct = {
      ...prodData,
      id: prodId,
      ...normState,
      internalCode: (prodData as any).internalCode || `PT-PR-${Date.now().toString().slice(-4)}`,
      pricingBreakdown: (prodData as any).pricingBreakdown || {
        purchaseCost: 0,
        transportationCost: 0,
        repairCost: 0,
        cleaningCost: 0,
        accessoriesCost: 0,
        otherCosts: 0,
        totalCost: prodData.price ? Math.round(prodData.price * 0.7) : 0,
        minAcceptablePrice: prodData.minNegotiationPrice || prodData.price || 0,
        recommendedPrice: prodData.price || 0,
        displayedPrice: prodData.price || 0,
        isNegotiable: prodData.isNegotiable || false,
        expectedProfit: prodData.price ? Math.round(prodData.price * 0.3) : 0,
        profitMarginPercent: 30,
      },
      mediaAlbums: (prodData as any).mediaAlbums || [],
      inspectionChecklist: (prodData as any).inspectionChecklist || [],
      extendedAccessories: (prodData as any).extendedAccessories || [],
      auditRecords: (prodData as any).auditRecords || [
        {
          id: `audit-${Date.now()}`,
          date: new Date().toLocaleString('ar-EG'),
          adminName: 'النظام',
          adminRole: 'System',
          action: 'إنشاء الجهاز بالمنتجات',
        },
      ],
      viewsCount: (prodData as any).viewsCount || 0,
      reservationsCount: (prodData as any).reservationsCount || 0,
      purchaseRequestsCount: (prodData as any).purchaseRequestsCount || 0,
      negotiationsCount: (prodData as any).negotiationsCount || 0,
      isArchived: (prodData as any).isArchived || false,
      qrCode,
      barcode,
      healthScores,
      financials,
      inspectionReport,
      timeline,
      media,
      createdAt: (prodData as any).createdAt || new Date().toISOString(),
    };

    saveEnrichedProductToFirestore(newProd);
  };

  const updateProduct = (id: string, updated: Partial<Product | EnrichedProduct>) => {
    updateProductFields(id, updated as Partial<EnrichedProduct>);
  };

  // Deleting a product from Admin removes document directly from Firestore
  const deleteProduct = (id: string) => {
    deleteEnrichedProductFromFirestore(id);
  };

  const reserveProduct = (productId: string, reservedBy?: string, reservedUntil?: string) => {
    const normState = normalizeLifecycleState('reserved');
    updateProductFields(productId, {
      ...normState,
      isReserved: true,
      reservedBy: reservedBy || 'عميل',
      reservedUntil: reservedUntil || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const cancelReservation = (reservationIdOrProductId: string) => {
    const res = reservations.find((r) => r.id === reservationIdOrProductId || r.productId === reservationIdOrProductId);
    const normState = normalizeLifecycleState('available');
    if (res) {
      updateReservationStatus(res.id, 'cancelled');
      updateProductFields(res.productId, {
        ...normState,
        isReserved: false,
        reservedBy: null as any,
        reservedUntil: null as any,
        updatedAt: new Date().toISOString(),
      });
    } else {
      updateProductFields(reservationIdOrProductId, {
        ...normState,
        isReserved: false,
        reservedBy: null as any,
        reservedUntil: null as any,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const confirmSale = (productId: string) => {
    const normState = normalizeLifecycleState('sold');
    updateProductFields(productId, {
      ...normState,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateProductStatus = (id: string, status: ProductStatus) => {
    const normState = normalizeLifecycleState(status);
    const updates: Partial<EnrichedProduct> = {
      ...normState,
      updatedAt: new Date().toISOString(),
    };
    if (normState.status === 'available') {
      updates.isReserved = false;
      updates.reservedBy = null as any;
      updates.reservedUntil = null as any;
    } else if (normState.status === 'reserved') {
      updates.isReserved = true;
    }
    updateProductFields(id, updates);
  };

  const togglePublish = (productId: string, isPublished: boolean) => {
    const normState = normalizeLifecycleState(isPublished ? 'available' : 'draft');
    updateProductFields(productId, {
      ...normState,
      isPublished,
      updatedAt: new Date().toISOString(),
    });
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Phase 3 Engine Implementation
  const getCategorySpecTemplate = (categoryId: string): SpecTemplate => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      return getSpecTemplateForCategory(category);
    }
    return getSpecTemplateForCategory({
      id: categoryId,
      name: 'عام',
      arabicName: 'عام',
      englishName: 'General',
      slug: 'general',
      seoSlug: 'general',
      iconName: 'Package',
      description: 'قسم عام',
      isActive: true,
      sortOrder: 99,
    });
  };

  const searchProductsWithEngine = (filters: ProductSearchFilters): Product[] => {
    return searchProducts(products, filters);
  };

  const approveProductAiSuggestion = (productId: string) => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const updatedProd = applyApprovedAiSuggestion(existing) as EnrichedProduct;
      updateProductFields(productId, updatedProd);
    }
  };

  const rejectProductAiSuggestion = (productId: string) => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const updatedProd = rejectAiSuggestionFn(existing) as EnrichedProduct;
      updateProductFields(productId, updatedProd);
    }
  };

  const addProductTimelineEvent = (
    productId: string,
    eventType: TimelineEventType,
    title: string,
    description?: string,
    actor?: string
  ) => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      const newEvent = createTimelineEvent(eventType, title, description, actor);
      const updatedTimeline = [...(existing.timeline || []), newEvent];
      updateProductFields(productId, {
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const getRelatedProductsForProduct = (productId: string, limit = 4): Product[] => {
    const current = getProductById(productId);
    if (!current) return [];
    return getRelatedProducts(current, products, limit);
  };

  const getSimilarProductsForProduct = (productId: string, priceTolerance = 0.25, limit = 4): Product[] => {
    const current = getProductById(productId);
    if (!current) return [];
    return getSimilarProducts(current, products, priceTolerance, limit);
  };

  const createReservation = (
    data: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'status'>
  ) => {
    const phone = (data as any).phone || data.customerPhone || '';
    const whatsapp = (data as any).whatsapp || data.customerPhone || phone;
    const email = (data as any).email || data.customerEmail || '';

    const newRes: Reservation = {
      ...data,
      id: IdGenerator.generateUniqueId('res'),
      reservationNumber: defaultSequenceService.generateNextReference('reservation'),
      customerPhone: data.customerPhone || phone,
      phone,
      whatsapp,
      email,
      notes: data.notes || '',
      source: 'website',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setReservations((prev) => [newRes, ...prev]);

    // Save directly to Firestore
    try {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.RESERVATIONS, newRes.id);
      setDoc(docRef, newRes, { merge: true }).catch((err) =>
        console.error('Firestore save reservation error:', err)
      );
    } catch (err) {
      console.error('Firestore doc reference error:', err);
    }

    // Sync to Order Management Storage for Admin Dashboard
    try {
      const currentStorage = getOrderStorageReservations();
      saveOrderStorageReservations([
        {
          id: newRes.id,
          reservationNumber: newRes.reservationNumber,
          customerName: newRes.customerName,
          customerPhone: newRes.customerPhone || phone,
          productTitle: newRes.productTitle,
          productPrice: newRes.productPrice,
          productImage: newRes.productImage || '',
          reservationType: 'online_hold',
          durationHours: 24,
          createdAt: newRes.createdAt,
          expiresAt: newRes.expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          remainingBalance: newRes.productPrice,
          status: 'pending',
          assignedAdmin: 'النظام الآلي',
          autoReleaseEnabled: true,
          timeline: [
            {
              id: `t-${Date.now()}`,
              timestamp: newRes.createdAt,
              eventType: 'reservation_started',
              title: 'تثبيت الحجز أونلاين',
              description: 'تم تثبيت حجز الجهاز وحجبه 24 ساعة.',
              actor: newRes.customerName,
            },
          ],
        },
        ...currentStorage,
      ]);
    } catch (err) {
      console.error('saveOrderStorageReservations error:', err);
    }

    // Mark product as reserved
    updateProduct(data.productId, { status: 'reserved' });

    return newRes;
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: IdGenerator.generateUniqueId('ord'),
      orderNumber: defaultSequenceService.generateNextReference('order'),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInv: Invoice = {
      ...invData,
      id: IdGenerator.generateUniqueId('inv'),
      invoiceNumber: defaultSequenceService.generateNextReference('invoice'),
    };
    setInvoices((prev) => [newInv, ...prev]);
    return newInv;
  };

  const submitTradeRequest = (req: Omit<TradeRequest, 'id' | 'createdAt' | 'status'> & Partial<TradeRequest>): TradeRequest => {
    const seq = String(tradeRequests.length + 1).padStart(4, '0');
    const newReq: TradeRequest = {
      ...req,
      id: 'trd-' + Date.now(),
      requestNumber: req.requestNumber || `EXCH-${new Date().getFullYear()}-${seq}`,
      status: req.status || 'new',
      createdAt: new Date().toISOString(),
    };
    setTradeRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const updateTradeRequestStatus = (id: string, status: TradeRequest['status']) => {
    setTradeRequests((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const submitSellRequest = (req: Omit<SellRequest, 'id' | 'createdAt' | 'status'> & Partial<SellRequest>): SellRequest => {
    const seq = String(sellRequests.length + 1).padStart(4, '0');
    const newReq: SellRequest = {
      ...req,
      id: 'sel-' + Date.now(),
      requestNumber: req.requestNumber || `SELL-${new Date().getFullYear()}-${seq}`,
      status: req.status || 'new',
      createdAt: new Date().toISOString(),
    };
    setSellRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const updateSellRequestStatus = (id: string, status: SellRequest['status']) => {
    setSellRequests((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const updateAiConfig = (config: Partial<AiConfig>) => {
    setAiConfig((prev) => ({ ...prev, ...config }));
  };

  // Cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const contextValue = useMemo(
    () => ({
      currentRoute,
      navigateTo,
      selectedProductId,
      selectedCategoryId,

      searchQuery,
      setSearchQuery,
      conditionFilter,
      setConditionFilter,
      statusFilter,
      setStatusFilter,

      settings,
      updateSettings,

      categories,
      addCategory,
      updateCategory,
      deleteCategory,

      brands,
      activeBrands,
      addBrand,
      updateBrand,
      deleteBrand,
      toggleBrand,

      products,
      filteredProducts,
      isLoadingProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      updateProductFields,
      updateProductStatus,
      reserveProduct,
      cancelReservation,
      confirmSale,
      togglePublish,

      reservations,
      createReservation,
      updateReservationStatus,

      orders,
      createOrder,
      updateOrderStatus,

      invoices,
      createInvoice,

      tradeRequests,
      submitTradeRequest,
      updateTradeRequestStatus,

      sellRequests,
      submitSellRequest,
      updateSellRequestStatus,

      analytics,
      aiConfig,
      updateAiConfig,

      getCategorySpecTemplate,
      searchProductsWithEngine,
      approveProductAiSuggestion,
      rejectProductAiSuggestion,
      addProductTimelineEvent,
      getRelatedProductsForProduct,
      getSimilarProductsForProduct,

      cart,
      addToCart,
      removeFromCart,
      clearCart,

      isDarkMode,
    }),
    [
      currentRoute,
      selectedProductId,
      selectedCategoryId,
      searchQuery,
      conditionFilter,
      statusFilter,
      settings,
      categories,
      brands,
      activeBrands,
      products,
      filteredProducts,
      isLoadingProducts,
      reservations,
      orders,
      invoices,
      tradeRequests,
      sellRequests,
      analytics,
      aiConfig,
      cart,
      isDarkMode,
    ]
  );

  return (
    <ShowroomContext.Provider value={contextValue}>
      {children}
    </ShowroomContext.Provider>
  );
};

export const useShowroom = () => {
  const context = useContext(ShowroomContext);
  if (!context) throw new Error('useShowroom must be used within ShowroomProvider');
  return context;
};
