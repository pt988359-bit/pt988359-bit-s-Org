import React from 'react';
import { Customer } from '../../../../types/customerHub';
import { NegotiationRequestRecord, RequestAuditStatus } from '../../../../types/customerActions';
import { Percent, ArrowLeftRight, Check, X, MessageSquare, Plus } from 'lucide-react';

interface NegotiationsTabProps {
  customer: Customer;
  negotiations: NegotiationRequestRecord[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestAuditStatus) => void;
  onCreateNewRequest: () => void;
}

export const NegotiationsTab: React.FC<NegotiationsTabProps> = ({
  customer,
  negotiations,
  onUpdateRequestStatus,
  onCreateNewRequest,
}) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-purple-400" />
            <span>عروض السعر والتفاوض المرفوعة ({negotiations.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            عروض الخصم المقترحة من العميل ومراجعة مسؤول المعرض للحد الأدنى المسموح
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طلب تفاوض</span>
        </button>
      </div>

      {negotiations.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Percent className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجدطلبات تفاوض مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {negotiations.map((neg) => {
            const discountPercent = Math.round(
              ((neg.product.originalPrice - neg.suggestedPrice) / neg.product.originalPrice) * 100
            );

            return (
              <div
                key={neg.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 dir-ltr">
                      {neg.referenceNumber}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(neg.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">القرار التجاري:</span>
                    <select
                      value={neg.status}
                      onChange={(e) => onUpdateRequestStatus(neg.id, e.target.value as RequestAuditStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="pending_approval">قيد النظر والتقييم</option>
                      <option value="approved">الموافقة على السعر المقترح</option>
                      <option value="rejected">رفض العرض والالتزام بالسعر</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={neg.product.image}
                    alt={neg.product.title}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-white truncate">{neg.product.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] mt-1">
                      <span className="text-slate-400">
                        السعر الأصلي:{' '}
                        <span className="line-through text-slate-500 font-bold">
                          {neg.product.originalPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </span>
                      <span className="text-purple-300 font-bold">
                        العرض المقترح:{' '}
                        <span className="text-emerald-400 font-black">
                          {neg.suggestedPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20 text-[10px]">
                        خصم مطلوب {discountPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {neg.notes && (
                  <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                    ملاحظة العميل: {neg.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
