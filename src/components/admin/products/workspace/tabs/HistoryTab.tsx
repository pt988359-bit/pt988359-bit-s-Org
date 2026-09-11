import React from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { History, User, Calendar, ShieldCheck, Clock } from 'lucide-react';

interface HistoryTabProps {
  product: EnrichedProduct;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ product }) => {
  const records = product.auditRecords || [];

  return (
    <div className="space-y-6 dir-rtl text-xs">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">سجل التدقيق التاريخي وتغييرات الملف (Audit Trail)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                تسجيل زمني دقيق لكل تعديل، مرحلة، أو تغيير مالي تم بواسطة المشرفين والإدارة
              </p>
            </div>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا توجد سجلات تعديل تاريخية سابقة لهذا الجهاز.
          </div>
        ) : (
          <div className="relative border-r-2 border-slate-800 mr-3 pr-6 space-y-4">
            {records.map((rec) => (
              <div key={rec.id} className="relative group">
                <div className="absolute -right-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{rec.action}</span>
                    <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <User className="w-3 h-3 text-blue-400" />
                    <span>تم بواسطة: {rec.adminName} ({rec.adminRole})</span>
                  </div>

                  {rec.previousValue && rec.newValue && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center gap-2">
                      <span className="text-rose-400 line-through">{rec.previousValue}</span>
                      <span>←</span>
                      <span className="text-emerald-400">{rec.newValue}</span>
                    </div>
                  )}

                  {rec.reason && (
                    <p className="text-[10px] text-slate-500 italic">السبب/الملاحظة: {rec.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
