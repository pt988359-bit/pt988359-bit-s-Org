import React from 'react';
import { PurchaseRequest } from '../../../types/orderManagementCenter';
import {
  User,
  Package,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRightLeft,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface PurchaseRequestsWorkspaceProps {
  requests: PurchaseRequest[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onSelectOrder: (item: PurchaseRequest) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onConvertToReservation: (item: PurchaseRequest) => void;
}

export const PurchaseRequestsWorkspace: React.FC<PurchaseRequestsWorkspaceProps> = ({
  requests,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onSelectOrder,
  onUpdateStatus,
  onConvertToReservation,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs text-slate-100 dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === requests.length && requests.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                />
              </th>
              <th className="p-4">رقم المرجع (Ref ID)</th>
              <th className="p-4">اسم العميل ورقم الهاتف</th>
              <th className="p-4">الجهاز المطلوب والسعر</th>
              <th className="p-4">تاريخ الطلب</th>
              <th className="p-4">الأولية والمسؤول</th>
              <th className="p-4">الحالة التشغيلية</th>
              <th className="p-4 text-center">الإجراءات السريعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد طلبات شراء مطابقة للبحث أو الفلتر حالياً.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const isSelected = selectedIds.includes(req.id);

                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(req.id)}
                        className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Reference ID */}
                    <td className="p-4">
                      <button
                        onClick={() => onSelectOrder(req)}
                        className="font-mono text-blue-400 font-black hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{req.referenceNumber}</span>
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <strong className="text-white font-bold block">{req.customerName}</strong>
                        <span className="text-slate-400 font-mono text-[11px] block">{req.customerPhone}</span>
                      </div>
                    </td>

                    {/* Product & Price */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-200 block truncate max-w-[220px]">
                          {req.productTitle}
                        </span>
                        <span className="font-black text-emerald-400">
                          {req.productPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                    </td>

                    {/* Requested Date */}
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {new Date(req.requestedDate).toLocaleDateString('ar-EG')}
                    </td>

                    {/* Priority & Admin */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black inline-block ${
                            req.priority === 'high'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          أولية: {req.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{req.assignedAdmin}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 font-bold border border-slate-800 inline-block text-[11px]">
                        {req.status}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectOrder(req)}
                          title="عرض التفاصيل 360"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onConvertToReservation(req)}
                          title="تحويل إلى حجز"
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-extrabold flex items-center gap-1 border border-purple-500/30 transition-all cursor-pointer text-[10px]"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>تحويل لحجز</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
