import React from 'react';
import { EnrichedProduct } from '../../../../types/productStudio';
import { LIFECYCLE_STAGE_LABELS } from '../../../../utils/productStudioStorage';
import {
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  Maximize2,
  DollarSign,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface ProductGridViewProps {
  products: EnrichedProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenWorkspace: (product: EnrichedProduct) => void;
  onSoftDelete: (id: string, name: string) => void;
  categoryNameMap: Record<string, string>;
}

export const ProductGridView: React.FC<ProductGridViewProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onOpenWorkspace,
  onSoftDelete,
  categoryNameMap,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-bold dir-rtl">
        لا توجد أجهزة مطابقة لمعايير البحث والفلترة حالياً.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 dir-rtl">
      {products.map((p) => {
        const isSelected = selectedIds.includes(p.id);
        const stageInfo = LIFECYCLE_STAGE_LABELS[p.lifecycleStage] || LIFECYCLE_STAGE_LABELS.published;
        const catName = categoryNameMap[p.categoryId] || p.categoryId;

        return (
          <div
            key={p.id}
            className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl hover:border-blue-500/50 transition-all flex flex-col relative group ${
              isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800'
            }`}
          >
            {/* Top Selection & Badge Row */}
            <div className="absolute top-3 right-3 left-3 z-10 flex items-center justify-between pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(p.id);
                }}
                className="p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700 pointer-events-auto cursor-pointer"
              >
                {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
              </button>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border backdrop-blur-md shadow-lg ${stageInfo.bg} ${stageInfo.text} ${stageInfo.border}`}
              >
                {stageInfo.label}
              </span>
            </div>

            {/* Thumbnail Box */}
            <div
              onClick={() => onOpenWorkspace(p)}
              className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer"
            >
              <img
                src={p.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                <span className="px-3 py-1.5 rounded-xl bg-blue-600/90 text-xs flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-4 h-4" /> فتح الاستوديو
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span className="font-bold text-blue-400">{p.internalCode || p.id}</span>
                  <span>{catName}</span>
                </div>

                <h3
                  onClick={() => onOpenWorkspace(p)}
                  className="font-extrabold text-sm text-white hover:text-blue-400 cursor-pointer line-clamp-2 transition-colors"
                >
                  {p.title}
                </h3>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {p.description}
                </p>
              </div>

              {/* Price & Cost Row */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">سعر العرض</span>
                  <span className="font-extrabold text-emerald-400">{p.price.toLocaleString()} ج.م</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block">التكلفة الشاملة</span>
                  <span className="font-mono text-slate-400">
                    {p.pricingBreakdown?.totalCost ? `${p.pricingBreakdown.totalCost.toLocaleString()} ج.م` : 'غير محدد'}
                  </span>
                </div>
              </div>

              {/* Footer Specs & Action Button */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {p.warranty ? 'ضمان' : 'بدون'}
                  </span>
                  <span>•</span>
                  <span>{p.brand}</span>
                </div>

                <button
                  onClick={() => onOpenWorkspace(p)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>إدارة</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
