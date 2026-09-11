import React from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { DollarSign, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';

interface NegotiationsTabProps {
  product: EnrichedProduct;
}

export const NegotiationsTab: React.FC<NegotiationsTabProps> = ({ product }) => {
  const minPrice = product.minNegotiationPrice || product.price * 0.9;

  return (
    <div className="space-y-6 dir-rtl text-xs">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">عروض الأسعار والتفاوض الذكي</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                سجل المفاوضات والعروض المقدمة من العملاء مع حارس الحواجب الأدنى للتسعير
              </p>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-amber-300 font-extrabold border border-slate-800">
            الحد الأدنى للتفاوض: {minPrice.toLocaleString()} ج.م
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-bold text-white block">العرض المقدم: {(product.price - 1000).toLocaleString()} ج.م</span>
            <span className="text-[11px] text-slate-400 block">عرض سعر مباشر مقدم عبر المنصة الرقمية</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all cursor-pointer flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>موافقة واعتماد العرض</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
              <span>رفض</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
