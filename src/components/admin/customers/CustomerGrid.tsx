import React from 'react';
import { Customer } from '../../../types/customerHub';
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
  DollarSign,
} from 'lucide-react';

interface CustomerGridProps {
  customers: Customer[];
  onOpenWorkspace: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerGrid: React.FC<CustomerGridProps> = ({
  customers,
  onOpenWorkspace,
  onEditCustomer,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 dir-rtl text-xs">
      {customers.map((cust) => (
        <div
          key={cust.id}
          onClick={() => onOpenWorkspace(cust)}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-4 shadow-xl flex flex-col justify-between group"
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-400 font-black bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                {cust.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 font-bold border border-slate-800 text-[10px]">
                {cust.status.toUpperCase()}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">
              {cust.fullName}
            </h3>

            <div className="space-y-1 text-slate-400 text-[11px]">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span dir="ltr" className="inline-block font-mono text-slate-300" style={{ unicodeBidi: 'isolate' }}>{cust.primaryPhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span dir="ltr" className="inline-block font-mono text-emerald-400" style={{ unicodeBidi: 'isolate' }}>+{cust.whatsappPhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{cust.address.cityArea} - {cust.address.governorate}</span>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div>
              <span className="text-slate-500 text-[10px]">الطلبات</span>
              <p className="font-black text-blue-400 text-xs">{cust.totalRequests}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">الشراء</span>
              <p className="font-black text-emerald-400 text-xs">{cust.totalPurchases}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">الحجوزات</span>
              <p className="font-black text-amber-400 text-xs">{cust.totalReservations}</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-black text-xs">
              {cust.totalSpent.toLocaleString('ar-EG')} ج.م
            </span>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEditCustomer(cust)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
              >
                تعديل
              </button>
              <button
                onClick={() => onOpenWorkspace(cust)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                فتح الملف
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
