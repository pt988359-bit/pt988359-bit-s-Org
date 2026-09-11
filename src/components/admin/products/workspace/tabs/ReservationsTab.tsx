import React from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { Clock, ShieldCheck, User, Phone, DollarSign, ExternalLink } from 'lucide-react';

interface ReservationsTabProps {
  product: EnrichedProduct;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({ product }) => {
  return (
    <div className="space-y-6 dir-rtl text-xs">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">سجل الحجوزات الرقمية المرتبطة بـ ({product.internalCode || product.id})</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                متابعة العربون المسدد من العملاء لمنع تضارب المبيعات وتأكيد أسبقية المعاينة
              </p>
            </div>
          </div>
        </div>

        {product.reservationsCount === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا توجد حجوزات رقمية مسجلة على هذا الجهاز حالياً. الجهاز متاح للشراء الفوري.
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-400 font-extrabold">RES-2026-901</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  مؤكد بعربون انستا باي
                </span>
              </div>
              <span className="font-bold text-white text-xs block">حجز عميل مؤكد بالمعرض</span>
              <span className="text-[11px] text-slate-400 block">العربون المسدد: 1,000 ج.م • متبقي: {(product.price - 1000).toLocaleString()} ج.م</span>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">تاريخ الحجز:</span>
              <span className="font-mono text-slate-300">2026-07-25 14:00</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
