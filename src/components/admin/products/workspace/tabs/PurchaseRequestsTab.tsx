import React from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { ShoppingBag, MessageSquare } from 'lucide-react';
import { useShowroom } from '../../../../../context/ShowroomContext';
import { normalizeEgyptianPhone } from '../../../../../utils/phoneUtils';

interface PurchaseRequestsTabProps {
  product: EnrichedProduct;
}

export const PurchaseRequestsTab: React.FC<PurchaseRequestsTabProps> = ({ product: _product }) => {
  const { settings } = useShowroom();
  const whatsappUrl = `https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`;

  return (
    <div className="space-y-6 dir-rtl text-xs">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">طلبات الشراء الفوري والاستفسارات</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                سجل طلبات العملاء الراغبين في المعاينة بمقر المعادي أو الشراء أونلاين
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white text-xs block">طلب استفسار جديد</span>
              <span className="text-[11px] text-slate-400 block">طلب معاينة وتأكيد مواعيد بالمعرض</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 font-bold hover:bg-emerald-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>مراسلة واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
