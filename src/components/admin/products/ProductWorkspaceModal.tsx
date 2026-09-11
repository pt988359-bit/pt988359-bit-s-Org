import React, { useState } from 'react';
import { EnrichedProduct, StudioTabKey } from '../../../types/productStudio';
import { Category } from '../../../types';
import { LIFECYCLE_STAGE_LABELS } from '../../../utils/productStudioStorage';
import { OverviewTab } from './workspace/tabs/OverviewTab';
import { MediaStudioTab } from './workspace/tabs/MediaStudioTab';
import { SpecificationsTab } from './workspace/tabs/SpecificationsTab';
import { PricingStudioTab } from './workspace/tabs/PricingStudioTab';
import { WarrantyStudioTab } from './workspace/tabs/WarrantyStudioTab';
import { AccessoriesStudioTab } from './workspace/tabs/AccessoriesStudioTab';
import { InspectionStudioTab } from './workspace/tabs/InspectionStudioTab';
import { ReservationsTab } from './workspace/tabs/ReservationsTab';
import { PurchaseRequestsTab } from './workspace/tabs/PurchaseRequestsTab';
import { NegotiationsTab } from './workspace/tabs/NegotiationsTab';
import { HistoryTab } from './workspace/tabs/HistoryTab';
import { AiAssistantTab } from './workspace/tabs/AiAssistantTab';
import { SettingsTab } from './workspace/tabs/SettingsTab';
import {
  X,
  Layers,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  ShieldCheck,
  PackageCheck,
  Stethoscope,
  Clock,
  ShoppingBag,
  History,
  Sparkles,
  Settings,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

interface ProductWorkspaceModalProps {
  product: EnrichedProduct;
  onClose: () => void;
  onSaveProduct: (updatedProduct: EnrichedProduct) => void;
  onSoftDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
  categories: Category[];
}

export const ProductWorkspaceModal: React.FC<ProductWorkspaceModalProps> = ({
  product,
  onClose,
  onSaveProduct,
  onSoftDelete,
  onRestore,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTabKey>('overview');
  const [currentProduct, setCurrentProduct] = useState<EnrichedProduct>(product);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryNameMap: Record<string, string> = {};
  categories.forEach((c) => {
    categoryNameMap[c.id] = c.name;
  });

  const handlePartialUpdate = (updated: Partial<EnrichedProduct>) => {
    const newProductState = {
      ...currentProduct,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    setCurrentProduct(newProductState);
    onSaveProduct(newProductState);

    setToastMessage('تم حفظ التغييرات بنجاح');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stageInfo = LIFECYCLE_STAGE_LABELS[currentProduct.lifecycleStage] || LIFECYCLE_STAGE_LABELS.published;

  const tabList: { key: StudioTabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: <Layers className="w-4 h-4" /> },
    { key: 'media', label: 'استوديو الوسائط', icon: <ImageIcon className="w-4 h-4" />, badge: currentProduct.images.length },
    { key: 'specifications', label: 'المواصفات الديناميكية', icon: <Sliders className="w-4 h-4" /> },
    { key: 'pricing', label: 'التسعير والتكلفة', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'warranty', label: 'الضمان المعتمد', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'accessories', label: 'الملحقات والقطع', icon: <PackageCheck className="w-4 h-4" /> },
    { key: 'inspection', label: 'تقرير الفحص بالمعمل', icon: <Stethoscope className="w-4 h-4" /> },
    { key: 'reservations', label: 'الحجوزات الرقمية', icon: <Clock className="w-4 h-4" />, badge: currentProduct.reservationsCount },
    { key: 'purchase_requests', label: 'طلبات المعاينة', icon: <ShoppingBag className="w-4 h-4" />, badge: currentProduct.purchaseRequestsCount },
    { key: 'negotiations', label: 'العروض والتفاوض', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'history', label: 'سجل التعديلات', icon: <History className="w-4 h-4" />, badge: currentProduct.auditRecords?.length },
    { key: 'ai_assistant', label: 'مساعد AI الذكي', icon: <Sparkles className="w-4 h-4 text-indigo-400" /> },
    { key: 'settings', label: 'إعدادات الكود والحذف', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 dir-rtl text-xs overflow-hidden animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Toast Floating Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-extrabold shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentProduct.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=200&q=80'}
              alt={currentProduct.title}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-800 shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-mono text-[11px] sm:text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {currentProduct.internalCode || currentProduct.id}
                </span>

                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                  {categoryNameMap[currentProduct.categoryId] || currentProduct.categoryId} • {currentProduct.brand}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border ${stageInfo.bg} ${stageInfo.text} ${stageInfo.border}`}>
                  {stageInfo.label}
                </span>
              </div>

              <h2 className="font-extrabold text-xs sm:text-base text-white truncate mt-1">
                {currentProduct.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
            <span className="font-extrabold text-emerald-400 text-xs sm:text-sm bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              {currentProduct.price.toLocaleString()} ج.م
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="إغلاق استوديو ملف الجهاز"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Tab Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-2 sm:px-3 py-2 overflow-x-auto custom-scrollbar flex items-center gap-1.5 shrink-0">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap text-xs min-h-[40px] shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-extrabold ${
                      isActive ? 'bg-white text-blue-900' : 'bg-slate-800 text-blue-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'overview' && (
            <OverviewTab
              product={currentProduct}
              onUpdateProduct={handlePartialUpdate}
              categoryNameMap={categoryNameMap}
              onNavigateToTab={(k) => setActiveTab(k)}
            />
          )}

          {activeTab === 'media' && (
            <MediaStudioTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'specifications' && (
            <SpecificationsTab
              product={currentProduct}
              onUpdateProduct={handlePartialUpdate}
              categoryNameMap={categoryNameMap}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingStudioTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'warranty' && (
            <WarrantyStudioTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'accessories' && (
            <AccessoriesStudioTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'inspection' && (
            <InspectionStudioTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'reservations' && <ReservationsTab product={currentProduct} />}

          {activeTab === 'purchase_requests' && <PurchaseRequestsTab product={currentProduct} />}

          {activeTab === 'negotiations' && <NegotiationsTab product={currentProduct} />}

          {activeTab === 'history' && <HistoryTab product={currentProduct} />}

          {activeTab === 'ai_assistant' && (
            <AiAssistantTab product={currentProduct} onUpdateProduct={handlePartialUpdate} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              product={currentProduct}
              onUpdateProduct={handlePartialUpdate}
              onSoftDelete={onSoftDelete}
              onRestore={onRestore}
            />
          )}
        </div>
      </div>
    </div>
  );
};
