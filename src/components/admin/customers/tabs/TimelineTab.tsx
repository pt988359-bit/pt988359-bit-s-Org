import React from 'react';
import { Customer } from '../../../../types/customerHub';
import { Clock, User, FileText, ShoppingBag, DollarSign, Percent, RefreshCw, Repeat, ShieldCheck } from 'lucide-react';

interface TimelineTabProps {
  customer: Customer;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ customer }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'customer_created':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'negotiation_started':
        return <Percent className="w-4 h-4 text-purple-400" />;
      case 'purchase_approved':
        return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'invoice_generated':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'warranty_issued':
        return <ShieldCheck className="w-4 h-4 text-yellow-400" />;
      case 'device_sold_to_proteck':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case 'exchange_requested':
        return <Repeat className="w-4 h-4 text-cyan-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>الجدول الزمني الموحد لأنشطة العميل (Unified Activity Timeline)</span>
        </h3>
        <p className="text-slate-400 text-[11px] mt-0.5">
          سجل الزمني الشامل لكافة التعاملات والطلبات والفواتير الصادرة باسم العميل
        </p>
      </div>

      {customer.timeline.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد أحداث زمني مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="relative border-r-2 border-slate-800 mr-3 pr-6 space-y-6">
          {customer.timeline.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Event Icon Marker */}
              <div className="absolute -right-[33px] top-0 p-1.5 rounded-full bg-slate-950 border border-slate-800 shadow-md">
                {getEventIcon(evt.eventType)}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">{evt.title}</span>
                  <span className="text-slate-400 text-[10px] dir-ltr">
                    {new Date(evt.timestamp).toLocaleString('ar-EG')}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{evt.description}</p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span>المسؤول/الطرف: <strong className="text-blue-400">{evt.actor}</strong></span>
                  {evt.referenceNumber && (
                    <>
                      <span>•</span>
                      <span>المرجع: <strong className="text-amber-400 font-mono">{evt.referenceNumber}</strong></span>
                    </>
                  )}
                  {evt.productTitle && (
                    <>
                      <span>•</span>
                      <span>الجهاز: <strong className="text-slate-200">{evt.productTitle}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
