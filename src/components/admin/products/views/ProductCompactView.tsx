import React from 'react';
import { EnrichedProduct } from '../../../../types/productStudio';
import { LIFECYCLE_STAGE_LABELS } from '../../../../utils/productStudioStorage';
import { Edit, Trash2, RotateCcw, CheckSquare, Square, ShieldCheck, Maximize2 } from 'lucide-react';

interface ProductCompactViewProps {
  products: EnrichedProduct[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenWorkspace: (product: EnrichedProduct) => void;
  onSoftDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
  categoryNameMap: Record<string, string>;
}

export const ProductCompactView: React.FC<ProductCompactViewProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onOpenWorkspace,
  onSoftDelete,
  onRestore,
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-xl overflow-hidden text-xs dir-rtl">
      {products.map((p) => {
        const isSelected = selectedIds.includes(p.id);
        const stageInfo = LIFECYCLE_STAGE_LABELS[p.lifecycleStage] || LIFECYCLE_STAGE_LABELS.published;
        const catName = categoryNameMap[p.categoryId] || p.categoryId;

        return (
          <div
            key={p.id}
            className={`p-3 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 ${
              isSelected ? 'bg-blue-500/5' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => onToggleSelect(p.id)}
                className="cursor-pointer text-slate-400 hover:text-white shrink-0"
              >
                {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
              </button>

              <img
                src={p.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=100&q=80'}
                alt={p.title}
                className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-blue-400 font-bold">{p.internalCode || p.id}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{catName}</span>
                  <span className="text-[10px] text-slate-500">• {p.brand}</span>
                </div>
                <h4
                  onClick={() => onOpenWorkspace(p)}
                  className="font-bold text-white hover:text-blue-400 cursor-pointer truncate text-xs"
                >
                  {p.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stageInfo.bg} ${stageInfo.text} ${stageInfo.border}`}>
                {stageInfo.label}
              </span>

              <span className="font-extrabold text-emerald-400 text-xs">
                {p.price.toLocaleString()} ج.م
              </span>

              <button
                onClick={() => onOpenWorkspace(p)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white font-bold transition-all cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>إدارة</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
