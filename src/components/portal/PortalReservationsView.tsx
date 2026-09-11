import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Clock, FileText } from 'lucide-react';
import { calculateRemainingTime } from '../../utils/orderManagementStorage';
import { normalizeEgyptianPhone } from '../../utils/phoneUtils';

interface PortalReservationsViewProps {
  reservations: any[];
  onOpenDocument: (doc: any) => void;
}

export const PortalReservationsView: React.FC<PortalReservationsViewProps> = ({
  reservations = [],
  onOpenDocument,
}) => {
  const { settings } = useShowroom();
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-500" />
          <span>حجوزاتي المعتمدة</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          متابعة الحجوزات النشطة، العداد التنازلي لمهلة المعاينة، وإيصالات حجز المعرض.
        </p>
      </div>

      {/* Reservations List */}
      <div className="space-y-6">
        {reservations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لا توجد حجوزات نشطة حالياً.
          </div>
        ) : (
          reservations.map((res) => {
            const timeInfo = calculateRemainingTime(res.expiresAt);

            return (
              <div
                key={res.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 relative overflow-hidden"
              >
                {/* Top Status & Countdown Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
                      {res.reservationNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      حجز مؤقت (24 ساعة)
                    </span>
                  </div>

                  {/* Status / Countdown Box */}
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>الوقت المتبقي للمعاينة:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {timeInfo.isExpired ? 'منتهي الصلاحية' : timeInfo.formatted}
                    </span>
                  </div>
                </div>

                {/* Product Info & Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left (Product) */}
                  <div className="md:col-span-2 flex items-start gap-4">
                    <img
                      src={res.productImage}
                      alt={res.productTitle}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {res.productTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        نوع الحجز: حجز معاينة مؤقت (24 ساعة)
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">إجمالي السعر:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {res.productPrice.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() =>
                        onOpenDocument({
                          id: `doc-res-${res.id}`,
                          type: 'reservation_receipt',
                          title: 'إثبات حجز جهاز بالمعرض',
                          documentNumber: `RES-${res.reservationNumber}`,
                          issueDate: res.createdAt,
                          relatedReference: res.reservationNumber,
                          amount: res.productPrice,
                          productTitle: res.productTitle,
                          customerName: res.customerName,
                          customerPhone: res.customerPhone,
                          status: res.status,
                        })
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>معاينة وطباعة إثبات الحجز</span>
                    </button>
                    <a
                      href={`https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors text-center"
                    >
                      <span>تأكيد موعد الحضور بفرع {settings.address.area}</span>
                    </a>
                  </div>
                </div>

                {/* Timeline History */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">تحديثات الحجز:</h4>
                  <div className="space-y-2">
                    {res.timeline?.map((tl: any) => (
                      <div
                        key={tl.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{tl.title}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{tl.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tl.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
