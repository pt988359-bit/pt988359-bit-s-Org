import React from 'react';
import { Customer } from '../../../../types/customerHub';
import { Eye, Clock, ExternalLink } from 'lucide-react';

interface VisitedProductsTabProps {
  customer: Customer;
}

export const VisitedProductsTab: React.FC<VisitedProductsTabProps> = ({ customer }) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>سجل استعراض ومعاينة الأجهزة ({customer.visitedProducts.length})</span>
        </h3>
        <p className="text-slate-400 text-[11px] mt-0.5">
          الأجهزة التي تصفحها العميل أو أبدى اهتماماً بها في المعرض والموقع
        </p>
      </div>

      {customer.visitedProducts.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا يوجد سجل تصفح مسجل لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customer.visitedProducts.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 shadow-md"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-16 h-16 object-cover rounded-xl border border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-xs text-white truncate">{p.title}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  الماركة: {p.brand} | السعر:{' '}
                  <span className="text-emerald-400 font-extrabold">
                    {p.price.toLocaleString('ar-EG')} ج.م
                  </span>
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {new Date(p.visitedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
