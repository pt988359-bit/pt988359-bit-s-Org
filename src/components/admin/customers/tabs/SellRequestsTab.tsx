import React from 'react';
import { Customer, SellDeviceRequest } from '../../../../types/customerHub';
import { RequestAuditStatus } from '../../../../types/customerActions';
import { RefreshCw, Plus, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

interface SellRequestsTabProps {
  customer: Customer;
  sellRequests: SellDeviceRequest[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestAuditStatus) => void;
  onCreateNewRequest: () => void;
}

export const SellRequestsTab: React.FC<SellRequestsTabProps> = ({
  customer,
  sellRequests,
  onUpdateRequestStatus,
  onCreateNewRequest,
}) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>طلبات بيع أجهزة العميل لمعرض PRO TECK ({sellRequests.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            الأجهزة المعروضة من العميل للشراء المباشر أو التقييم الفني بالمعرض
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طلب بيع جهاز</span>
        </button>
      </div>

      {sellRequests.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد طلبات بيع أجهزة مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellRequests.map((sell) => (
            <div
              key={sell.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 dir-ltr">
                    {sell.referenceNumber}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(sell.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">قرار الشراء الفني:</span>
                  <select
                    value={sell.status}
                    onChange={(e) => onUpdateRequestStatus(sell.id, e.target.value as RequestAuditStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="pending_verification">قيد الفحص الفني</option>
                    <option value="approved">تم الموافقة واعتماد الشراء</option>
                    <option value="rejected">مرفوض لعدم مطابقة المعايير</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-white">{sell.deviceTitle}</h4>
                <p className="text-slate-300 text-[11px]">{sell.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px]">الماركة/الفئة:</span>
                    <p className="font-bold text-white">{sell.deviceBrand} - {sell.deviceCategory}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">السعر المطلوب من العميل:</span>
                    <p className="font-bold text-amber-300">{sell.expectedPrice.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">السعر المعروض من المعرض:</span>
                    <p className="font-black text-emerald-400">
                      {sell.offeredPrice ? `${sell.offeredPrice.toLocaleString('ar-EG')} ج.م` : 'قيد التقييم'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
