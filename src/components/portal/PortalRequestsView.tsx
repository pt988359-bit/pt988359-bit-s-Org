import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

interface PortalRequestsViewProps {
  requests: any[];
  negotiations: any[];
  inquiries: any[];
}

export const PortalRequestsView: React.FC<PortalRequestsViewProps> = ({
  requests = [],
  negotiations = [],
  inquiries = [],
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'negotiations' | 'inquiries'>('purchases');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>طلباتي والاستفسارات المسجلة</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل كامل لكافة طلبات الشراء، المفاوضات على الأسعار، والاستفسارات المرفوعة لإدارة المعرض.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            طلبات الشراء ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('negotiations')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'negotiations'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المفاوضات ({negotiations.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الاستفسارات ({inquiries.length})
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              لم تقم بتقديم أي طلبات شراء بعد.
            </div>
          ) : (
            requests.map((req) => {
              const isExpanded = expandedId === req.id;
              return (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={req.productImage}
                        alt={req.productTitle}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {req.referenceNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {req.priority === 'high' ? 'أولوية مرتفعة' : 'عادي'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 truncate">
                          {req.productTitle}
                        </h3>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {req.productPrice.toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {req.status === 'new' ? 'جديد قيد المراجعة' : req.status}
                      </span>
                      <button
                        onClick={() => toggleExpand(req.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Timeline & Admin Notes */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      {req.notes && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">ملاحظات الطلب:</span>
                          {req.notes}
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">سجل التطورات والجدول الزمني:</h4>
                        <div className="space-y-2">
                          {req.timeline?.map((event: any) => (
                            <div
                              key={event.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{event.title}</span>
                                <p className="text-[11px] text-slate-400 mt-0.5">{event.description}</p>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(event.timestamp).toLocaleDateString('ar-EG')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'negotiations' && (
        <div className="space-y-4">
          {negotiations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              لا توجد مفاوضات أسعار جارية حالياً.
            </div>
          ) : (
            negotiations.map((neg) => (
              <div
                key={neg.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {neg.referenceNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {neg.productTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div>
                      <span className="text-slate-400 block text-[10px]">السعر الأصلي:</span>
                      <span className="line-through text-slate-500">{neg.originalPrice.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">السعر المقترح:</span>
                      <span className="text-emerald-600 font-black">{neg.suggestedPrice.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">عرض العميل:</span>
                  {neg.customerNotes}
                  {neg.adminNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium">
                      رد مسؤل المعرض: {neg.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              لا توجد استفسارات مسجلة.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inq.referenceNumber}</span>
                  <span className="text-slate-400">{new Date(inq.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{inq.productTitle}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  سؤالك: "{inq.inquiryMessage}"
                </p>
                {inq.adminResponse && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    رد المعرض: {inq.adminResponse}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
