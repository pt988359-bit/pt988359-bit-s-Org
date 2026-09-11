import React from 'react';
import { PlusCircle } from 'lucide-react';

interface PortalSellHistoryViewProps {
  sellRequests: any[];
}

export const PortalSellHistoryView: React.FC<PortalSellHistoryViewProps> = ({
  sellRequests = [],
}) => {
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>أجهزتي المباعة المعروضة لـ PRO TECK</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          متابعة الطلبات المرفوعة لبيع أجهزتك المستعملة لإدارة المعرض وتقييم السعر وحالة الفحص الفني.
        </p>
      </div>

      <div className="space-y-4">
        {sellRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لم تقم بتقديم طلبات بيع أجهزة سابقة.
          </div>
        ) : (
          sellRequests.map((sr) => (
            <div
              key={sr.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {sr.requestNumber || sr.id}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {sr.applianceType} - {sr.brand} {sr.model}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-slate-400 text-[10px] block">السعر المطلوب:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {sr.askingPrice?.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p>الحالة المرفقة: {sr.condition || 'مستعمل بحالة جيدة'}</p>
                {sr.notes && <p className="mt-1">ملاحظاتك: {sr.notes}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
