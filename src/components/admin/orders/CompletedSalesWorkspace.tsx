import React from 'react';
import { CompletedSaleItem } from '../../../types/orderManagementCenter';
import { CheckCircle2, FileText, ShoppingCart, User, CreditCard } from 'lucide-react';

interface CompletedSalesWorkspaceProps {
  sales: CompletedSaleItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

export const CompletedSalesWorkspace: React.FC<CompletedSalesWorkspaceProps> = ({
  sales,
  selectedIds,
  onToggleSelect,
  onSelectAll,
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
                  checked={selectedIds.length === sales.length && sales.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                />
              </th>
              <th className="p-4">رقم الأمر (Order #)</th>
              <th className="p-4">اسم العميل والهاتف</th>
              <th className="p-4">الجهاز المباع</th>
              <th className="p-4">السعر النهائي المسدد</th>
              <th className="p-4">رقم الفاتورة</th>
              <th className="p-4">طريقة الاستلام والتحويل</th>
              <th className="p-4">تاريخ الإتمام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد مبيعات مكتملة مسجلة بعد.
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const isSelected = selectedIds.includes(sale.id);

                return (
                  <tr key={sale.id} className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-green-950/30' : ''}`}>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(sale.id)}
                        className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-black text-emerald-400">{sale.orderNumber}</td>
                    <td className="p-4">
                      <strong className="text-white font-bold block">{sale.customerName}</strong>
                      <span className="text-slate-400 font-mono text-[10px]">{sale.customerPhone}</span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-200">{sale.productTitle}</td>
                    <td className="p-4 font-black text-emerald-400 text-xs">
                      {sale.finalPrice.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-4 font-mono text-blue-400 font-bold">{sale.invoiceNumber}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20 text-[10px]">
                        {sale.deliveryType === 'showroom_pickup' ? 'استلام بالمعرض' : 'توصيل منزل'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {new Date(sale.completionDate).toLocaleDateString('ar-EG')}
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
