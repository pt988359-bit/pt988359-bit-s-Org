import React from 'react';
import { ShoppingCart, CheckCircle2, Clock, Wrench, Package, DollarSign, Tag, TrendingUp } from 'lucide-react';
import { AppliancePurchaseRecord } from '../../../types/adminFinance';

interface PurchaseHistoryTabProps {
  purchases: AppliancePurchaseRecord[];
}

const STATUS_CONFIG = {
  sold: { label: 'تم البيع بربح', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  in_stock: { label: 'معروض بالمعرض', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  in_repair: { label: 'في مركز الصيانة', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  reserved: { label: 'محجوز بعربون', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

export const PurchaseHistoryTab: React.FC<PurchaseHistoryTabProps> = ({ purchases }) => {
  return (
    <div className="space-y-6 dir-rtl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-indigo-400" />
          سجل شراء الأجهزة وسابقة المشتريات (Purchase History)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          تتبع تاريخ وتكاليف شراء كل جهاز دخل المعرض مع ربطه بالمورد وحساب صافي الربح المحقق بعد البيع.
        </p>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                <th className="p-4">رقم الشراء</th>
                <th className="p-4">اسم الجهاز والتصنيف</th>
                <th className="p-4">المورد المصدر</th>
                <th className="p-4">تاريخ الشراء</th>
                <th className="p-4">سعر الشراء الاصلي</th>
                <th className="p-4">مصاريف الصيانة والجهيز</th>
                <th className="p-4">الحالة الحالية</th>
                <th className="p-4">الربح المحقق بعد البيع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">لا توجد عمليات شراء مسجلة في السجل حتى الآن</p>
                  </td>
                </tr>
              ) : (
                purchases.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || { label: 'قيد العرض', color: 'bg-slate-800 text-slate-300 border-slate-700' };
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-400">{item.referenceNumber}</td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{item.applianceTitle}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{item.category}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-300">{item.supplierName}</td>
                      <td className="p-4 font-mono text-slate-400">{item.purchaseDate}</td>
                      <td className="p-4 font-mono font-black text-slate-100">
                        {item.purchasePrice.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-4 font-mono font-bold text-rose-400">
                        -{item.repairExpenses.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black">
                        {item.profitAfterSale !== undefined ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{item.profitAfterSale.toLocaleString('ar-EG')} ج.م
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">قيد العرض</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
