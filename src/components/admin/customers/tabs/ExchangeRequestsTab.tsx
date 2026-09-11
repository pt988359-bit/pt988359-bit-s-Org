import React from 'react';
import { Customer, ExchangeDeviceRequest } from '../../../../types/customerHub';
import { RequestAuditStatus } from '../../../../types/customerActions';
import { Repeat, Plus, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface ExchangeRequestsTabProps {
  customer: Customer;
  exchangeRequests: ExchangeDeviceRequest[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestAuditStatus) => void;
  onCreateNewRequest: () => void;
}

export const ExchangeRequestsTab: React.FC<ExchangeRequestsTabProps> = ({
  customer,
  exchangeRequests,
  onUpdateRequestStatus,
  onCreateNewRequest,
}) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Repeat className="w-4 h-4 text-cyan-400" />
            <span>طلبات الاستبدال وتداول الأجهزة المستعملة ({exchangeRequests.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            استبدال أجهزة قديمة بأجهزة حديثة من المعرض مع احتساب فرق السعر
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طلب استبدال</span>
        </button>
      </div>

      {exchangeRequests.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Repeat className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد طلبات استبدال مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exchangeRequests.map((exc) => (
            <div
              key={exc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 dir-ltr">
                    {exc.referenceNumber}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(exc.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">حالة طلب الاستبدال:</span>
                  <select
                    value={exc.status}
                    onChange={(e) => onUpdateRequestStatus(exc.id, e.target.value as RequestAuditStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">قيد المراجعة والمعاينة</option>
                    <option value="approved">معتمد وجاهز للتنفيذ</option>
                    <option value="completed">تم الاستبدال والتسليم</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">الجهاز القديم للعميل:</span>
                  <p className="font-bold text-white mt-0.5">{exc.oldDeviceTitle}</p>
                  <p className="text-cyan-400 font-bold mt-1">
                    تقييم السعر: {exc.oldDeviceEstimatedValue.toLocaleString('ar-EG')} ج.م
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-center items-center text-center">
                  <ArrowLeftRight className="w-5 h-5 text-cyan-400 mb-1" />
                  <span className="text-slate-400 text-[10px]">فارق السعر المطلوب تسديده:</span>
                  <p className="font-black text-emerald-400 text-sm mt-0.5">
                    {exc.cashDifference.toLocaleString('ar-EG')} ج.م
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px]">جهاز المعرض المستهدف:</span>
                  <p className="font-bold text-white mt-0.5">{exc.targetProductTitle}</p>
                  <p className="text-slate-300 font-bold mt-1">
                    سعر المعرض: {exc.targetProductPrice.toLocaleString('ar-EG')} ج.م
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
