import React, { useState, useEffect } from 'react';
import { ReservationItem } from '../../../types/orderManagementCenter';
import { calculateRemainingTime } from '../../../utils/orderManagementStorage';
import {
  Clock,
  CheckCircle2,
  Eye,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface ReservationsWorkspaceProps {
  reservations: ReservationItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onSelectReservation: (item: ReservationItem) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onToggleAutoRelease?: (id: string) => void;
  onConvertToSale: (item: ReservationItem) => void;
}

export const ReservationsWorkspace: React.FC<ReservationsWorkspaceProps> = ({
  reservations,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onSelectReservation,
  onUpdateStatus,
  onConvertToSale,
}) => {
  // Live ticker state to update countdown every second
  const [, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs text-slate-100 dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === reservations.length && reservations.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                />
              </th>
              <th className="p-4">رقم الحجز</th>
              <th className="p-4">العميل والجهاز</th>
              <th className="p-4">نوع الحجز</th>
              <th className="p-4">العد التنازلي للـ 24 ساعة (Live)</th>
              <th className="p-4">سعر الجهاز</th>
              <th className="p-4">حالة الحجز</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد حجوزات حالية.
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const isSelected = selectedIds.includes(res.id);
                const isReserved = res.status === 'Reserved' || res.status === 'active';
                const isExpired = res.status === 'Expired' || res.status === 'expired';
                const isCompleted = res.status === 'Completed' || res.status === 'completed';

                const countdown = calculateRemainingTime(res.expiresAt, false);

                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-purple-950/30' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(res.id)}
                        className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Reservation Number */}
                    <td className="p-4">
                      <button
                        onClick={() => onSelectReservation(res)}
                        className="font-mono text-purple-400 font-black hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{res.reservationNumber}</span>
                      </button>
                    </td>

                    {/* Customer & Product */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <strong className="text-white font-bold block">{res.customerName}</strong>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                          {res.productTitle}
                        </span>
                      </div>
                    </td>

                    {/* Reservation Type */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-extrabold border border-blue-500/20 text-[10px] inline-block">
                        حجز مجاني (24 ساعة)
                      </span>
                    </td>

                    {/* Live Expiration Countdown */}
                    <td className="p-4">
                      {isReserved ? (
                        <div
                          className={`px-3 py-1 rounded-xl font-mono font-black text-xs inline-flex items-center gap-1.5 shadow-sm ${
                            countdown.badgeColor === 'red'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                              : countdown.badgeColor === 'amber'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{countdown.formatted}</span>
                        </div>
                      ) : isExpired ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px]">
                          منتهي آلياً
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                          تم إتمام البيع
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">{res.status}</span>
                      )}
                    </td>

                    {/* Product Price */}
                    <td className="p-4">
                      <span className="font-bold text-emerald-400 block font-mono">
                        {res.productPrice?.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isReserved
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                            : isExpired
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : isCompleted
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isReserved ? 'محجوز (24h)' : isExpired ? 'منتهي (Expired)' : isCompleted ? 'مكتمل (Completed)' : res.status}
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectReservation(res)}
                          title="معاينة الحجز"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isReserved && (
                          <button
                            onClick={() => onConvertToSale(res)}
                            title="إتمام البيع والتسليم (بيع الجهاز)"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1 transition-all cursor-pointer text-[10px] shadow-sm shadow-emerald-600/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>إتمام البيع</span>
                          </button>
                        )}
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
