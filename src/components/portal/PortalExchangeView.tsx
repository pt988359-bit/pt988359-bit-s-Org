import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PortalExchangeViewProps {
  exchangeRequests: any[];
}

export const PortalExchangeView: React.FC<PortalExchangeViewProps> = ({
  exchangeRequests = [],
}) => {
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>طلبات الاستبدال المسجلة</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          متابعة طلبات استبدال أجهزتك القديمة بالأجهزة المعروضة داخل منتجات المعرض.
        </p>
      </div>

      <div className="space-y-4">
        {exchangeRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لم تقم بتقديم طلبات استبدال أجهزة سابقة.
          </div>
        ) : (
          exchangeRequests.map((ex) => (
            <div
              key={ex.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {ex.requestNumber || ex.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  قيد التقييم الفني
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">الجهاز المراد استبداله:</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {ex.currentApplianceType} - {ex.currentBrand}
                  </span>
                </div>
                {ex.desiredProductTitle && (
                  <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-blue-500 block text-[10px]">الجهاز المستهدف بالمعرض:</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {ex.desiredProductTitle}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
