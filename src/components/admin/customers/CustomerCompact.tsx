import React from 'react';
import { Customer } from '../../../types/customerHub';
import { Eye, Edit, Phone, MessageSquare } from 'lucide-react';

interface CustomerCompactProps {
  customers: Customer[];
  onOpenWorkspace: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerCompact: React.FC<CustomerCompactProps> = ({
  customers,
  onOpenWorkspace,
  onEditCustomer,
}) => {
  return (
    <div className="space-y-2 dir-rtl text-xs">
      {customers.map((cust) => (
        <div
          key={cust.id}
          onClick={() => onOpenWorkspace(cust)}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {cust.id}
            </span>
            <div>
              <h4 className="font-extrabold text-white text-xs">{cust.fullName}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>{cust.primaryPhone}</span> | {cust.address.cityArea}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="text-slate-300">
              مشتريات: <strong className="text-emerald-400">{cust.totalPurchases}</strong> | حجوزات:{' '}
              <strong className="text-amber-400">{cust.totalReservations}</strong>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onOpenWorkspace(cust)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all cursor-pointer"
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
