import React from 'react';
import { Customer } from '../../../../types/customerHub';
import { ReservationRequestRecord, RequestAuditStatus } from '../../../../types/customerActions';
import { BookmarkCheck, Clock, Plus, AlertCircle, ShieldCheck } from 'lucide-react';

interface ReservationsTabProps {
  customer: Customer;
  reservations: ReservationRequestRecord[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestAuditStatus) => void;
  onCreateNewRequest: () => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  customer,
  reservations,
  onUpdateRequestStatus,
  onCreateNewRequest,
}) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>حجوزات العميل المؤقتة والنهائية ({reservations.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            سجل حجز الأجهزة لمنع البيع للغير مع تعليق مدة المعاينة
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة حجز جهاز جديد</span>
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <BookmarkCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد حجوزات مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 dir-ltr">
                    {res.referenceNumber}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    مدة الحجز: <strong className="text-white">{res.durationHours} ساعة</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">الحالة:</span>
                  <select
                    value={res.status}
                    onChange={(e) => onUpdateRequestStatus(res.id, e.target.value as RequestAuditStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">نشط وساري</option>
                    <option value="completed">تم الشراء والتسليم</option>
                    <option value="cancelled">انتهت المدة/ملغى</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={res.product.image}
                  alt={res.product.title}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-white truncate">{res.product.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    الماركة: {res.product.brand} | الإجمالي:{' '}
                    <span className="text-emerald-400 font-extrabold">
                      {res.product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
