import React from 'react';
import { Customer } from '../../../types/customerHub';
import { getCustomerDynamicStats } from '../../../utils/customerStats';
import {
  User,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  ShoppingBag,
  BookmarkCheck,
  Tag,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onOpenWorkspace: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onSoftDeleteCustomer: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onOpenWorkspace,
  onEditCustomer,
  onSoftDeleteCustomer,
}) => {
  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'vip':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/30 text-[10px]">VIP مميز</span>;
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/30 text-[10px]">نشط</span>;
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-extrabold border border-blue-500/30 text-[10px]">عميل جديد</span>;
      case 'returning':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-extrabold border border-purple-500/30 text-[10px]">عائد لشراء مجدد</span>;
      case 'blocked':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-extrabold border border-rose-500/30 text-[10px]">محظور</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700 text-[10px]">مؤرشف</span>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl dir-rtl">
      <table className="w-full text-right border-collapse text-xs">
        <thead>
          <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
            <th className="p-3.5">كود العميل</th>
            <th className="p-3.5">اسم العميل بالكامل</th>
            <th className="p-3.5">الهاتف الرئيسي</th>
            <th className="p-3.5">الواتساب</th>
            <th className="p-3.5">المنطقة والمحافظة</th>
            <th className="p-3.5">أول تواصل</th>
            <th className="p-3.5">آخر نشاط</th>
            <th className="p-3.5 text-center">الطلبات</th>
            <th className="p-3.5 text-center">الشراء</th>
            <th className="p-3.5 text-center">حالة العميل</th>
            <th className="p-3.5 text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {customers.map((cust) => {
            const stats = getCustomerDynamicStats(cust.primaryPhone, cust.whatsappPhone);
            const totalRequests = stats.totalRequests;
            const totalPurchases = stats.totalPurchases;

            return (
              <tr
                key={cust.id}
                className="hover:bg-slate-800/50 transition-all cursor-pointer"
                onClick={() => onOpenWorkspace(cust)}
              >
                <td className="p-3.5 font-mono text-blue-400 font-black">{cust.id}</td>

                <td className="p-3.5 font-bold text-white">
                  <div className="flex items-center gap-2">
                    <span>{cust.fullName}</span>
                    {cust.isDuplicateCandidate && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
                        تطابق مكرر
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3.5 text-right font-mono text-slate-300">
                  <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{cust.primaryPhone}</span>
                </td>

                <td className="p-3.5 text-right font-mono text-emerald-400">
                  <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>+{cust.whatsappPhone}</span>
                </td>

                <td className="p-3.5 text-slate-300">
                  {cust.address?.cityArea || 'غير محدد'}{cust.address?.governorate ? ` - ${cust.address.governorate}` : ''}
                </td>

                <td className="p-3.5 text-slate-400">
                  {new Date(cust.firstContactDate).toLocaleDateString('ar-EG')}
                </td>

                <td className="p-3.5 text-slate-400">
                  {new Date(cust.lastActivityDate).toLocaleDateString('ar-EG')}
                </td>

                <td className="p-3.5 text-center font-bold text-blue-400">{totalRequests}</td>

                <td className="p-3.5 text-center font-bold text-emerald-400">{totalPurchases}</td>

                <td className="p-3.5 text-center">{getStatusBadge(cust.status)}</td>

              <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onOpenWorkspace(cust)}
                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
                    title="فتح ملف العميل"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onEditCustomer(cust)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                    title="تعديل البيانات"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSoftDeleteCustomer(cust)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                    title="نقل للأرشيف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};
