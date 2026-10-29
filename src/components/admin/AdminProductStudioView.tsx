import React, { useState } from 'react';
import {
  EnrichedProduct,
  ProductStudioViewMode,
  FilterProductOptions,
  BulkActionType,
} from '../../types/productStudio';
import { useShowroom } from '../../context/ShowroomContext';
import { saveEnrichedProductToFirestore, deleteEnrichedProductFromFirestore, normalizeLifecycleState } from '../../utils/productStudioStorage';
import { ProductListHeader } from './products/ProductListHeader';
import { ProductFiltersBar } from './products/ProductFiltersBar';
import { ProductTableView } from './products/views/ProductTableView';
import { ProductGridView } from './products/views/ProductGridView';
import { ProductCompactView } from './products/views/ProductCompactView';
import { ProductWorkspaceModal } from './products/ProductWorkspaceModal';
import { AddProductModal } from './products/AddProductModal';
import { ProductEntryChoiceModal } from './products/ProductEntryChoiceModal';
import { AiProductIntakeModal } from './products/AiProductIntakeModal';
import { BulkActionsModal } from './products/BulkActionsModal';
import { BrandManagementModal } from './products/BrandManagementModal';
import { CSVExporter } from '../../utils/csvExporter';
import { Sparkles, Package, AlertCircle } from 'lucide-react';

export const AdminProductStudioView: React.FC = () => {
  const { products: rawProducts, categories } = useShowroom();
  const products = rawProducts as EnrichedProduct[];

  const [viewMode, setViewMode] = useState<ProductStudioViewMode>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [workspaceProduct, setWorkspaceProduct] = useState<EnrichedProduct | null>(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiIntakeModalOpen, setIsAiIntakeModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionType | null>(null);

  // Filter States
  const [filters, setFilters] = useState<FilterProductOptions>({
    searchQuery: '',
    category: 'all',
    brand: 'all',
    condition: 'all',
    lifecycleStage: 'all',
    warranty: 'all',
    minPrice: '',
    maxPrice: '',
    publishedOnly: false,
    readyForSaleOnly: false,
    archivedOnly: false,
    sortBy: 'newest',
  });

  // Map category names
  const categoryNameMap: Record<string, string> = {};
  categories.forEach((c) => {
    categoryNameMap[c.id] = c.name;
  });

  // Unique Brands
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    // Archived filter
    if (filters.archivedOnly) {
      if (!p.isArchived && p.lifecycleStage !== 'archived') return false;
    } else {
      if (p.isArchived && filters.lifecycleStage !== 'archived') return false;
    }

    // Published only
    if (filters.publishedOnly && p.lifecycleStage !== 'published') return false;

    // Ready for sale
    if (
      filters.readyForSaleOnly &&
      !['published', 'pending_review', 'photography'].includes(p.lifecycleStage)
    ) {
      return false;
    }

    // Category
    if (filters.category !== 'all' && p.categoryId !== filters.category) return false;

    // Brand
    if (filters.brand !== 'all' && p.brand !== filters.brand) return false;

    // Condition
    if (filters.condition !== 'all' && p.condition !== filters.condition) return false;

    // Lifecycle Stage
    if (filters.lifecycleStage !== 'all' && p.lifecycleStage !== filters.lifecycleStage)
      return false;

    // Warranty
    if (filters.warranty !== 'all') {
      if (filters.warranty === 'yes' && !p.warranty) return false;
      if (filters.warranty === 'no' && p.warranty) return false;
    }

    // Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = (p.internalCode || p.id).toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = (p.model || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchBrand && !matchModel) return false;
    }

    return true;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'highest_price') {
      return b.price - a.price;
    }
    if (filters.sortBy === 'lowest_price') {
      return a.price - b.price;
    }
    if (filters.sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title, 'ar');
    }
    return 0;
  });

  // Select Handlers
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === sortedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProducts.map((p) => p.id));
    }
  };

  // Delete Handler (Direct Permanent Delete)
  const handleSoftDelete = async (id: string, name: string) => {
    console.log('[DELETE DEBUG] 1. Received id:', id, 'name:', name);
    const target = products.find((p) => p.id === id);
    console.log('[DELETE DEBUG] 2. Target lookup:', target ? 'FOUND' : 'NOT FOUND', target);
    if (!target) return;

    console.log('[DELETE DEBUG] 3. Prompting window.confirm for device:', name);
    const confirmed = window.confirm(`هل أنت متأكد من حذف الجهاز '${name}' نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`);
    console.log('[DELETE DEBUG] 4. window.confirm result:', confirmed);

    if (confirmed) {
      console.log('[DELETE DEBUG] 5. Calling deleteEnrichedProductFromFirestore for id:', id, 'images:', target.images);
      try {
        await deleteEnrichedProductFromFirestore(id, target.images);
        console.log('[DELETE DEBUG] 6. deleteEnrichedProductFromFirestore completed successfully for id:', id);
      } catch (error) {
        console.error('[DELETE DEBUG] 6. deleteEnrichedProductFromFirestore threw error for id:', id, error);
      }
    }
  };

  // Restore Handler
  const handleRestore = (id: string, name: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      const normState = normalizeLifecycleState('available');
      const updated: EnrichedProduct = {
        ...target,
        ...normState,
        isArchived: false,
        auditRecords: [
          {
            id: `audit-${Date.now()}`,
            date: new Date().toLocaleString('ar-EG'),
            adminName: 'PRO TECK Admin',
            adminRole: 'Super Admin',
            action: 'استعادة الجهاز من السلة إلى الأجهزة النشطة',
            reason: 'إلغاء الأرشفة من لوحة التحكم',
          },
          ...(target.auditRecords || []),
        ],
      };
      saveEnrichedProductToFirestore(updated);
    }
  };

  // Save Product from Workspace Modal
  const handleSaveWorkspaceProduct = (updatedProd: EnrichedProduct) => {
    saveEnrichedProductToFirestore(updatedProd);
  };

  // Add Product Handler
  const handleAddProduct = (newProd: EnrichedProduct) => {
    saveEnrichedProductToFirestore(newProd);
    setIsAddModalOpen(false);
    setIsAiIntakeModalOpen(false);
    setIsChoiceModalOpen(false);
    setWorkspaceProduct(newProd); // Open workspace for newly created appliance
  };

  // Bulk Execution Handler
  const handleExecuteBulkAction = (action: BulkActionType, payload?: any) => {
    products.forEach((p) => {
      if (!selectedIds.includes(p.id)) return;

      let updated: EnrichedProduct = { ...p };

      if (action === 'archive') {
        const normState = normalizeLifecycleState('archived');
        updated = { ...updated, ...normState, isArchived: true };
      } else if (action === 'change_stage' && payload?.stage) {
        const normState = normalizeLifecycleState(payload.stage);
        updated = { ...updated, ...normState };
      } else if (action === 'change_category' && payload?.category) {
        updated = { ...updated, categoryId: payload.category };
      } else if (action === 'change_warranty' && payload?.warranty !== undefined) {
        updated = { ...updated, warranty: payload.warranty };
      } else if (action === 'toggle_negotiable') {
        updated = { ...updated, isNegotiable: !updated.isNegotiable };
      } else if (action === 'apply_discount' && payload?.discountPercent) {
        const factor = 1 - payload.discountPercent / 100;
        updated = { ...updated, price: Math.round(updated.price * factor) };
      } else {
        return;
      }

      saveEnrichedProductToFirestore(updated);
    });

    setSelectedIds([]);
    setBulkAction(null);
  };

  // Export Data Handler (PART 9: Comprehensive CSV Export)
  const handleExportData = (format: 'json' | 'csv') => {
    const dataToExport = selectedIds.length > 0 ? products.filter((p) => selectedIds.includes(p.id)) : products;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proteck-products-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } else {
      CSVExporter.exportProducts(dataToExport);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 dir-rtl font-sans text-xs min-h-screen bg-slate-950 text-slate-100">
      {/* Header Bar */}
      <ProductListHeader
        totalProductsCount={products.length}
        filteredCount={sortedProducts.length}
        selectedCount={selectedIds.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setIsChoiceModalOpen(true)}
        onOpenBrandModal={() => setIsBrandModalOpen(true)}
        onOpenBulkModal={(act) => setBulkAction(act)}
        onExportData={handleExportData}
      />

      {/* Filters Bar */}
      <ProductFiltersBar
        filters={filters}
        onFilterChange={(updated) => setFilters({ ...filters, ...updated })}
        onResetFilters={() =>
          setFilters({
            searchQuery: '',
            category: 'all',
            brand: 'all',
            condition: 'all',
            lifecycleStage: 'all',
            warranty: 'all',
            minPrice: '',
            maxPrice: '',
            publishedOnly: false,
            readyForSaleOnly: false,
            archivedOnly: false,
            sortBy: 'newest',
          })
        }
        categories={categories}
        brands={uniqueBrands}
      />

      {/* Main Product Views */}
      {viewMode === 'table' && (
        <ProductTableView
          products={sortedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenWorkspace={(p) => setWorkspaceProduct(p)}
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          categoryNameMap={categoryNameMap}
        />
      )}

      {viewMode === 'grid' && (
        <ProductGridView
          products={sortedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onOpenWorkspace={(p) => setWorkspaceProduct(p)}
          onSoftDelete={handleSoftDelete}
          categoryNameMap={categoryNameMap}
        />
      )}

      {viewMode === 'compact' && (
        <ProductCompactView
          products={sortedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onOpenWorkspace={(p) => setWorkspaceProduct(p)}
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          categoryNameMap={categoryNameMap}
        />
      )}

      {/* Workspace Detail Modal */}
      {workspaceProduct && (
        <ProductWorkspaceModal
          product={workspaceProduct}
          onClose={() => setWorkspaceProduct(null)}
          onSaveProduct={handleSaveWorkspaceProduct}
          onSoftDelete={handleSoftDelete}
          onRestore={handleRestore}
          categories={categories}
        />
      )}

      {/* Product Creation Mode Choice Modal */}
      {isChoiceModalOpen && (
        <ProductEntryChoiceModal
          onClose={() => setIsChoiceModalOpen(false)}
          onSelectManual={() => {
            setIsChoiceModalOpen(false);
            setIsAddModalOpen(true);
          }}
          onSelectAiIntake={() => {
            setIsChoiceModalOpen(false);
            setIsAiIntakeModalOpen(true);
          }}
        />
      )}

      {/* Add New Product Modal (Manual Entry) */}
      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAddProduct}
          categories={categories}
          brands={uniqueBrands}
        />
      )}

      {/* AI Product Intake Modal */}
      {isAiIntakeModalOpen && (
        <AiProductIntakeModal
          onClose={() => setIsAiIntakeModalOpen(false)}
          onAddProduct={handleAddProduct}
          categories={categories}
        />
      )}

      {/* Brand Management Modal */}
      <BrandManagementModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Bulk Operations Modal */}
      {bulkAction && (
        <BulkActionsModal
          action={bulkAction}
          selectedCount={selectedIds.length}
          onClose={() => setBulkAction(null)}
          onExecute={handleExecuteBulkAction}
          categories={categories}
        />
      )}
    </div>
  );
};
