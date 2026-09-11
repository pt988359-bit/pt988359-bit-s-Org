import React from 'react';
import { FilterProductOptions } from '../../../types/productStudio';
import { Category } from '../../../types';
import { Search, X, RotateCcw, Filter, CheckCircle2, DollarSign, Tag, ShieldCheck, HelpCircle } from 'lucide-react';

interface ProductFiltersBarProps {
  filters: FilterProductOptions;
  onFilterChange: (updated: Partial<FilterProductOptions>) => void;
  onResetFilters: () => void;
  categories: Category[];
  brands: string[];
}

export const ProductFiltersBar: React.FC<ProductFiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  brands,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs dir-rtl">
      {/* Top Search & Preset Toggles Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="البحث بـ كود الجهاز (PT-WM-..)، الاسم، الماركة، الرقم المرجعي..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Presets */}
        <div className="md:col-span-7 flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
          <button
            onClick={() =>
              onFilterChange({
                publishedOnly: !filters.publishedOnly,
                archivedOnly: false,
                readyForSaleOnly: false,
              })
            }
            className={`px-3 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              filters.publishedOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            منشور بالموقع والمعرض
          </button>

          <button
            onClick={() =>
              onFilterChange({
                readyForSaleOnly: !filters.readyForSaleOnly,
                publishedOnly: false,
                archivedOnly: false,
              })
            }
            className={`px-3 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              filters.readyForSaleOnly
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            جاهز للبيع والمعاينة
          </button>

          <button
            onClick={() =>
              onFilterChange({
                archivedOnly: !filters.archivedOnly,
                publishedOnly: false,
                readyForSaleOnly: false,
              })
            }
            className={`px-3 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              filters.archivedOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            الأجهزة المؤرشفة (السلة)
          </button>

          <button
            onClick={onResetFilters}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="إعادة ضبط الفلاتر"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفية</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-slate-800/80 pt-4">
        {/* Category */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">القسم</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">كافة الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">الماركة</label>
          <select
            value={filters.brand}
            onChange={(e) => onFilterChange({ brand: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">كافة الماركات</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">حالة الجهاز</label>
          <select
            value={filters.condition}
            onChange={(e) => onFilterChange({ condition: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">كافة الحالات</option>
            <option value="used">مستعمل فرز أول / زيرو</option>
            <option value="new">جديد بالكرتونة والضمان</option>
            <option value="refurbished">مجدد ومفحوص بالمعمل</option>
          </select>
        </div>

        {/* Lifecycle Stage */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">مرحلة دورة الحياة</label>
          <select
            value={filters.lifecycleStage}
            onChange={(e) => onFilterChange({ lifecycleStage: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">كافة المراحل</option>
            <option value="draft">مسودة</option>
            <option value="purchased">تم الشراء</option>
            <option value="pending_inspection">قيد الفحص</option>
            <option value="cleaning">التنظيف والتعقيم</option>
            <option value="maintenance">الصيانة والتجهيز</option>
            <option value="photography">التصوير الفوتوغرافي</option>
            <option value="pending_review">المراجعة والاعتماد</option>
            <option value="published">منشور بالمعرض والموقع</option>
            <option value="reserved">محجوز بعربون</option>
            <option value="sold">تم البيع والتسليم</option>
            <option value="archived">مؤرشف بالسلة</option>
          </select>
        </div>

        {/* Warranty */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">مدة الضمان</label>
          <select
            value={filters.warranty}
            onChange={(e) => onFilterChange({ warranty: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">كافة الضمانات</option>
            <option value="10years">ضمان المعرض 10 سنوات</option>
            <option value="1year">ضمان سنة أو أكثر</option>
            <option value="2years">ضمان سنتين أو أكثر</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">الترتيب حسب</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="newest">الأحدث إضافة</option>
            <option value="oldest">الأقدم إضافة</option>
            <option value="highest_price">الأعلى سعراً</option>
            <option value="lowest_price">الأقل سعراً</option>
            <option value="most_viewed">الأكثر مشاهدة</option>
            <option value="recently_updated">الأحدث تحديثاً</option>
            <option value="alphabetical">أبجدياً (أ-ي)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
