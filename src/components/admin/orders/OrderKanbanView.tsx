import React from 'react';
import { PurchaseRequest } from '../../../types/orderManagementCenter';
import {
  Clock,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
} from 'lucide-react';

interface OrderKanbanViewProps {
  purchaseRequests: PurchaseRequest[];
  onSelectOrder: (item: any, type: string) => void;
  onMoveStatus: (id: string, newStatus: string) => void;
}

export const OrderKanbanView: React.FC<OrderKanbanViewProps> = ({
  purchaseRequests,
  onSelectOrder,
  onMoveStatus,
}) => {
  const kanbanColumns = [
    { id: 'new', title: 'طلب جديد (New)', color: 'border-blue-500/40 bg-blue-500/5 text-blue-400' },
    { id: 'review', title: 'قيد المراجعة (Review)', color: 'border-amber-500/40 bg-amber-500/5 text-amber-400' },
    { id: 'waiting_customer', title: 'بانتظار العميل (Waiting)', color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400' },
    { id: 'ready_pickup', title: 'جاهز للاستلام (Ready)', color: 'border-teal-500/40 bg-teal-500/5 text-teal-400' },
    { id: 'completed', title: 'مكتمل ومباع (Completed)', color: 'border-green-500/40 bg-green-500/5 text-green-400' },
    { id: 'cancelled', title: 'ملغي / مرفوض (Cancelled)', color: 'border-rose-500/40 bg-rose-500/5 text-rose-400' },
  ];

  // Map item status to kanban column ID
  const getItemColumnId = (item: any): string => {
    const s = item.status;
    if (s === 'new') return 'new';
    if (s === 'pending_review' || s === 'pending') return 'review';
    if (s === 'waiting_customer') return 'waiting_customer';
    if (s === 'ready_for_pickup') return 'ready_pickup';
    if (s === 'completed' || s === 'converted_to_sale') return 'completed';
    if (s === 'cancelled' || s === 'rejected' || s === 'expired') return 'cancelled';
    return 'new';
  };

  // Combine items for Kanban
  const allKanbanItems = purchaseRequests.map((pr) => ({ ...pr, _type: 'request' }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar min-h-[600px] dir-rtl">
      {kanbanColumns.map((col) => {
        const columnItems = allKanbanItems.filter((item) => getItemColumnId(item) === col.id);

        return (
          <div
            key={col.id}
            className="w-72 shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col max-h-[75vh]"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b rounded-t-2xl flex items-center justify-between ${col.color}`}>
              <h3 className="font-extrabold text-xs flex items-center gap-2">
                <span>{col.title}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/60 font-mono text-[10px] font-black border border-current">
                {columnItems.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              {columnItems.length === 0 ? (
                <div className="p-6 text-center text-slate-600 text-[11px] border border-dashed border-slate-800 rounded-xl">
                  لا توجد طلبات هنا
                </div>
              ) : (
                columnItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all shadow-md space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {item.referenceNumber || 'REF-N/A'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        طلب شراء
                      </span>
                    </div>

                    <p className="font-black text-white text-xs leading-snug line-clamp-2">
                      {item.productTitle}
                    </p>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{item.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-emerald-400">
                          {(item.productPrice || item.finalPrice || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                        {item.priority && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            أولية: {item.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Move & Action Controls */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <button
                        onClick={() => onSelectOrder(item, item._type)}
                        className="text-blue-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>معاينة</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onMoveStatus(item.id, 'rejected')}
                          title="نقل إلى مرفوض"
                          className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
