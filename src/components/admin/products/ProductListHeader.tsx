import React from 'react';
import { ProductViewMode } from '../../../types/productStudio';
import {
  Package,
  Plus,
  LayoutGrid,
  List,
  Menu,
  SlidersHorizontal,
  Download,
  Trash2,
  CheckSquare,
  Sparkles,
  Layers,
  Archive,
} from 'lucide-react';

interface ProductListHeaderProps {
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  viewMode: ProductViewMode;
  onViewModeChange: (mode: ProductViewMode) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onOpenExportModal: () => void;
  onOpenBrandModal?: () => void;
}

export const ProductListHeader: React.FC<ProductListHeaderProps> = ({
  totalCount,
  filteredCount,
  selectedCount,
  viewMode,
  onViewModeChange,
  onToggleFilters,
  showFilters,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenExportModal,
  onOpenBrandModal,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl dir-rtl">
      {/* Title & Stats */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5 shrink-0">
          <Package className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-extrabold text-white">إدارة واستوديو المنتجات الشامل</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {filteredCount} من {totalCount} جهاز
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            الملف الرقمي لكل جهاز: التكلفة، الفحص، الميديا، الضمان، وحوكمة مرحلة البيع
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bulk Action Trigger (shown if items selected) */}
        {selectedCount > 0 && (
          <button
            onClick={onOpenBulkModal}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer animate-pulse min-h-[40px]"
          >
            <CheckSquare className="w-4 h-4" />
            <span>عمليات جماعية ({selectedCount})</span>
          </button>
        )}

        {/* View Mode Switcher */}
        <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1">
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="عرض جدول البيانات التفصيلي"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">جدول</span>
          </button>

          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="عرض شبكة بطاقات الأجهزة"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">بطاقات</span>
          </button>

          <button
            onClick={() => onViewModeChange('compact')}
            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              viewMode === 'compact'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="عرض القائمة المدمجة المكثفة"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">مدمج</span>
          </button>
        </div>

        {/* Filters Toggle Button */}
        <button
          onClick={onToggleFilters}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 min-h-[40px] ${
            showFilters
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>الفلاتر المتقدمة</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 min-h-[40px]"
          title="تصدير البيانات إلى Excel/CSV/PDF"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">تصدير</span>
        </button>

        {/* Brand Management Button */}
        {onOpenBrandModal && (
          <button
            onClick={onOpenBrandModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 min-h-[40px]"
            title="إدارة العلامات التجارية والماركات"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">إدارة الماركات</span>
          </button>
        )}

        {/* Add Product Button */}
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة جهاز جديد</span>
        </button>
      </div>
    </div>
  );
};
