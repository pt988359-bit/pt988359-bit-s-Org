import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../../constants/placeholders';

export const RecentlySold: React.FC = () => {
  const { products } = useShowroom();

  // Get sold products or construct mock sold view
  const soldProducts = products.filter(p => p.status === 'sold');

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>ثقة عملاء PRO TECK في المعادي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            أجهزة تم بيعها مؤخراً بالمعرض
          </h2>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          يتم حجب السعر تلقائياً بعد إتمام عملية المعاينة والتسليم للعميل
        </div>
      </div>

      {/* Grid of Sold Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {soldProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 transition-all opacity-85 hover:opacity-100 flex flex-col justify-between"
          >
            {/* Sold Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم البيع بالمعرض</span>
              </span>

              <span className="text-[10px] font-bold text-slate-400">
                تسليم المعادي
              </span>
            </div>

            {/* Product Image */}
            <div className="relative w-full h-44 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4 grayscale group-hover:grayscale-0 transition-all">
              <img
                src={product.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER}
                alt={product.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                }}
                className="max-h-36 object-contain"
              />
              <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                <span className="px-3 py-1 bg-slate-900/80 text-white rounded-full text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>تم البيع</span>
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {product.brand}
              </span>

              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm line-clamp-2 min-h-[40px]">
                {product.title}
              </h3>

              {/* Price Hidden After Sale */}
              <div className="pt-2 mt-1 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>السعر محجوب بعد البيع</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  تم الاستلام
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
