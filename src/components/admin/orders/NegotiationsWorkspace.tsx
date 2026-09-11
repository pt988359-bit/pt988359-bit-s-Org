import React, { useState } from 'react';
import { NegotiationItem } from '../../../types/orderManagementCenter';
import {
  TrendingDown,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  User,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface NegotiationsWorkspaceProps {
  negotiations: NegotiationItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onUpdateNegotiation: (item: NegotiationItem, decision: 'accepted' | 'counter_offered' | 'declined', adminNote: string, counterAmount?: number) => void;
}

export const NegotiationsWorkspace: React.FC<NegotiationsWorkspaceProps> = ({
  negotiations,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onUpdateNegotiation,
}) => {
  const [activeItem, setActiveItem] = useState<NegotiationItem | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [adminNote, setAdminNote] = useState('');

  return (
    <div className="space-y-6 text-xs text-slate-100 dir-rtl">
      {/* Table of Negotiations */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === negotiations.length && negotiations.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                  />
                </th>
                <th className="p-4">المرجع</th>
                <th className="p-4">العميل والجهاز</th>
                <th className="p-4">السعر الأصلي</th>
                <th className="p-4">العرض المقترح</th>
                <th className="p-4">قيمة وخصم (%)</th>
                <th className="p-4">حالة المفاوضات</th>
                <th className="p-4 text-center">الإجراء والقرار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {negotiations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">
                    لا توجد طلبات تفاوض أو خصم أسعار حالية.
                  </td>
                </tr>
              ) : (
                negotiations.map((neg) => {
                  const isSelected = selectedIds.includes(neg.id);

                  return (
                    <tr
                      key={neg.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-amber-950/30' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(neg.id)}
                          className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Reference */}
                      <td className="p-4 font-mono font-black text-amber-400">
                        {neg.referenceNumber}
                      </td>

                      {/* Customer & Product */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <strong className="text-white font-bold block">{neg.customerName}</strong>
                          <span className="text-slate-400 text-[11px] block truncate max-w-[200px]">
                            {neg.productTitle}
                          </span>
                        </div>
                      </td>

                      {/* Original Price */}
                      <td className="p-4 font-black text-slate-300">
                        {neg.originalPrice.toLocaleString('ar-EG')} ج.م
                      </td>

                      {/* Suggested Price */}
                      <td className="p-4 font-black text-emerald-400">
                        {neg.suggestedPrice.toLocaleString('ar-EG')} ج.م
                      </td>

                      {/* Discount Amount & % */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-rose-400 block">
                            -{neg.discountAmount.toLocaleString('ar-EG')} ج.م
                          </span>
                          <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                            خصم {neg.discountPercent.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 font-bold border border-slate-800 text-[10px]">
                          {neg.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setActiveItem(neg);
                            setCounterPrice(neg.suggestedPrice);
                            setAdminNote(neg.adminNotes || '');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 transition-all cursor-pointer"
                        >
                          فتح جلسة المفاوضات
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Negotiation Session Overlay / Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span>جلسة تفاوض الخصم ({activeItem.referenceNumber})</span>
              </h3>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-slate-300">
                العميل: <strong className="text-white">{activeItem.customerName}</strong> ({activeItem.customerPhone})
              </p>
              <p className="text-slate-300">
                الجهاز: <strong className="text-slate-200">{activeItem.productTitle}</strong>
              </p>
              <div className="flex gap-4 pt-2 font-mono">
                <div>السعر الأصلي: <strong className="text-slate-300">{activeItem.originalPrice} ج.م</strong></div>
                <div>العرض المطلوب: <strong className="text-emerald-400">{activeItem.suggestedPrice} ج.م</strong></div>
              </div>
            </div>

            {/* Offer History Thread */}
            <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-400 block text-[10px]">سجل العروض والرسائل:</span>
              {activeItem.history.map((h) => (
                <div key={h.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{h.offeredBy === 'customer' ? 'عرض العميل' : 'عرض الأدمن'}</span>
                    <span className="text-emerald-400">{h.amount} ج.م</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">{h.note}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">عرض أدمن مقابل (Counter Price):</label>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-300 block">ملاحظة القرار:</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="ملاحظات الموافقة أو العرض المقابل..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateNegotiation(activeItem, 'declined', adminNote);
                  setActiveItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-bold hover:bg-rose-500/20"
              >
                رفض التفاوض
              </button>

              <button
                onClick={() => {
                  onUpdateNegotiation(activeItem, 'counter_offered', adminNote, counterPrice);
                  setActiveItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20"
              >
                تقديم عرض مقابل
              </button>

              <button
                onClick={() => {
                  onUpdateNegotiation(activeItem, 'accepted', adminNote);
                  setActiveItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-500 shadow-md"
              >
                قبول الخصم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
