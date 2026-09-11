import React, { useState } from 'react';
import { Customer } from '../../../../types/customerHub';
import { PurchaseRequestRecord, RequestAuditStatus } from '../../../../types/customerActions';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Plus, Eye, UserCheck } from 'lucide-react';

interface PurchaseRequestsTabProps {
  customer: Customer;
  requests: PurchaseRequestRecord[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestAuditStatus) => void;
  onCreateNewRequest: () => void;
}

export const PurchaseRequestsTab: React.FC<PurchaseRequestsTabProps> = ({
  customer,
  requests,
  onUpdateRequestStatus,
  onCreateNewRequest,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestRecord | null>(null);

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      {/* Header & Create Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span>طلبات الشراء الخاصة بالعميل ({requests.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            سجل طلبات الشراء المباشرة المرفوعة بالمعرض أو عبر الموقع
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء طلب شراء جديد</span>
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد طلبات شراء مسجلة لـ {customer.fullName}</p>
          <p className="text-[11px] text-slate-500 mt-1">يمكنك إضافة طلب شراء جديد بالضغط على الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 dir-ltr">
                    {req.referenceNumber}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(req.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">تغيير الحالة:</span>
                  <select
                    value={req.status}
                    onChange={(e) => onUpdateRequestStatus(req.id, e.target.value as RequestAuditStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending_approval">قيد المراجعة الفنية</option>
                    <option value="active">نشط ومعتمد</option>
                    <option value="completed">مكتمل ومسلم</option>
                    <option value="rejected">مرفوض</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-3">
                <img
                  src={req.product.image}
                  alt={req.product.title}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-white truncate">{req.product.title}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    الماركة: <span className="text-slate-200">{req.product.brand}</span> | السعر:{' '}
                    <span className="text-emerald-400 font-extrabold">
                      {req.product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  </p>
                </div>
              </div>

              {/* Audit Trail */}
              {req.auditTrail && req.auditTrail.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px]">
                  <p className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>آخر إجراء بطلب الشراء:</span>
                  </p>
                  <p className="text-slate-300">
                    {req.auditTrail[req.auditTrail.length - 1].note || 'تم تحديث حالة الطلب'} (بواسطة{' '}
                    {req.auditTrail[req.auditTrail.length - 1].actor || 'المشرف'})
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
