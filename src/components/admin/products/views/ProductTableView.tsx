import React from 'react';
import { EnrichedProduct } from '../../../../types/productStudio';
import { LIFECYCLE_STAGE_LABELS } from '../../../../utils/productStudioStorage';
import {
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Maximize2,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';

interface ProductTableViewProps {
  products: EnrichedProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenWorkspace: (product: EnrichedProduct) => void;
  onSoftDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
  categoryNameMap: Record<string, string>;
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenWorkspace,
  onSoftDelete,
  onRestore,
  categoryNameMap,
}) => {
  const allSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-xs dir-rtl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold text-[11px] whitespace-nowrap">
              <th className="p-3.5 w-10 text-center">
                <button onClick={onToggleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-3.5">كود الجهاز (ID)</th>
              <th className="p-3.5">الصورة والمعاينة</th>
              <th className="p-3.5 min-w-[200px]">اسم الجهاز والموديل</th>
              <th className="p-3.5">القسم والماركة</th>
              <th className="p-3.5">الحالة والفرز</th>
              <th className="p-3.5">مرحلة دورة الحياة</th>
              <th className="p-3.5">سعر العرض (معلن)</th>
              <th className="p-3.5">تكلفة الشراء (داخلي)</th>
              <th className="p-3.5 text-center">تفاوض</th>
              <th className="p-3.5">الضمان</th>
              <th className="p-3.5 text-center">الطلبات</th>
              <th className="p-3.5 whitespace-nowrap">تاريخ الإضافة</th>
              <th className="p-3.5 whitespace-nowrap">آخر تحديث</th>
              <th className="p-3.5 text-left sticky left-0 bg-slate-950/90 backdrop-blur-sm z-10">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد أجهزة مطابقة لمعايير البحث والفلترة حالياً.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const stageInfo = LIFECYCLE_STAGE_LABELS[p.lifecycleStage] || LIFECYCLE_STAGE_LABELS.published;
                const catName = categoryNameMap[p.categoryId] || p.categoryId;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-500/5' : ''
                    } ${p.isArchived ? 'opacity-60 bg-rose-950/10' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <button onClick={() => onToggleSelect(p.id)} className="cursor-pointer text-slate-400 hover:text-white">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Product ID Code */}
                    <td className="p-3.5 font-mono text-[11px] font-extrabold text-blue-400 whitespace-nowrap">
                      {p.internalCode || p.id}
                    </td>

                    {/* Thumbnail */}
                    <td className="p-3.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0 group">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`${
                            p.images?.[0] ? 'hidden ' : ''
                          }w-full h-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[9px] text-center p-0.5 leading-tight select-none`}
                        >
                          لا توجد صورة
                        </div>
                        <button
                          onClick={() => onOpenWorkspace(p)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Title & Model */}
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span
                          onClick={() => onOpenWorkspace(p)}
                          className="font-extrabold text-slate-100 hover:text-blue-400 cursor-pointer line-clamp-1 text-xs"
                        >
                          {p.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          موديل: {p.model || 'N/A'} {p.shortName ? `(${p.shortName})` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-[11px]">{catName}</span>
                        <span className="text-[10px] text-slate-400">{p.brand}</span>
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {p.condition === 'new'
                          ? 'جديد بالكرتونة'
                          : p.condition === 'used_warranty' || p.condition === 'refurbished'
                          ? `مستعمل بضمان (${p.conditionRating || 9.5}/10)`
                          : `مستعمل بدون ضمان (${p.conditionRating || 9.5}/10)`}
                      </span>
                    </td>

                    {/* Lifecycle Stage */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1.5 w-fit ${stageInfo.bg} ${stageInfo.text} ${stageInfo.border}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {stageInfo.label}
                      </span>
                    </td>

                    {/* Showroom Display Price */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-emerald-400 text-xs">
                          {p.price.toLocaleString()} ج.م
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            {p.originalPrice.toLocaleString()} ج.م
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Internal Purchase Cost */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {p.pricingBreakdown?.purchaseCost
                          ? `${p.pricingBreakdown.purchaseCost.toLocaleString()} ج.م`
                          : 'غير محدد'}
                      </span>
                    </td>

                    {/* Negotiable */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {p.isNegotiable ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          نعم
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-bold text-[10px]">
                          ثابت
                        </span>
                      )}
                    </td>

                    {/* Warranty */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        {p.warranty ? 'ضمان معتمد' : 'بدون ضمان'}
                      </span>
                    </td>

                    {/* Purchase Requests count */}
                    <td className="p-3.5 text-center font-mono font-bold text-blue-400">
                      {p.purchaseRequestsCount || 0}
                    </td>

                    {/* Created Date */}
                    <td className="p-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    {/* Last Updated */}
                    <td className="p-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('ar-EG') : '-'}
                    </td>

                    {/* Actions Column */}
                    <td className="p-3.5 text-left sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenWorkspace(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="فتح استوديو ملف الجهاز الشامل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>الاستوديو</span>
                        </button>

                        {p.isArchived ? (
                          <button
                            onClick={() => onRestore(p.id, p.title)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                            title="استعادة من السلة"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSoftDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                            title="نقل إلى السلة (أرشفة آمنة)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
