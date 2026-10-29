import React from 'react';
import { Calendar } from 'lucide-react';

interface PortalTimelineViewProps {
  timelineEvents: any[];
}

export const PortalTimelineView: React.FC<PortalTimelineViewProps> = ({
  timelineEvents = [],
}) => {
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>الجدول الزمني الموحد لجميع التعاملات</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تسلسل زمني دقيق يعرض كافة أحداث طلبات الشراء، المعاينات، وإصدار المستندات بقاعدة البيانات.
        </p>
      </div>

      <div className="relative border-r-2 border-slate-200 dark:border-slate-800 mr-4 pr-6 space-y-8">
        {timelineEvents.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لا توجد أحداث زمنيـة مسجلة بعد.
          </div>
        ) : (
          timelineEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Dot icon */}
              <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-slate-100 dark:ring-slate-900 group-hover:scale-125 transition-transform" />

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{evt.title}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex items-center gap-2 pt-2 text-[10px]">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {evt.referenceNumber}
                  </span>
                  {evt.statusBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {evt.statusBadge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
