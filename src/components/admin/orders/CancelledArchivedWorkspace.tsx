import React from 'react';
import { PurchaseRequest } from '../../../types/orderManagementCenter';
import { RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface CancelledArchivedWorkspaceProps {
  items: PurchaseRequest[];
  isArchivedView?: boolean;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
}

export const CancelledArchivedWorkspace: React.FC<CancelledArchivedWorkspaceProps> = ({
  items,
  isArchivedView = false,
  onRestore,
  onPurge,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs text-slate-100 dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
              <th className="p-4">مرجع الطلب</th>
              <th className="p-4">اسم العميل والهاتف</th>
              <th className="p-4">الجهاز</th>
              <th className="p-4">السعر</th>
              <th className="p-4">تاريخ الإلغاء/الأرشفة</th>
              <th className="p-4 text-center">الإجراء الاسترجاعي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد طلبات ملغاة أو مؤرشفة حالياً.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-black text-rose-400">{item.referenceNumber}</td>
                  <td className="p-4">
                    <strong className="text-white block font-bold">{item.customerName}</strong>
                    <span className="text-slate-400 font-mono text-[10px]">{item.customerPhone}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{item.productTitle}</td>
                  <td className="p-4 font-black text-slate-300">{item.productPrice.toLocaleString('ar-EG')} ج.م</td>
                  <td className="p-4 font-mono text-slate-400">
                    {new Date(item.requestedDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onRestore(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 font-extrabold border border-blue-500/30 hover:bg-blue-600/30 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>استعادة للعمليات</span>
                      </button>
                      <button
                        onClick={() => onPurge(item.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
