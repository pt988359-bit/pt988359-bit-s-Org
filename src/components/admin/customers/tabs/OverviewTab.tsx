import React from 'react';
import { Customer } from '../../../../types/customerHub';
import {
  User,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Tag,
  ShieldCheck,
  Pin,
  FileText,
} from 'lucide-react';

interface OverviewTabProps {
  customer: Customer;
  onUpdateCustomer: (updated: Partial<Customer>) => void;
  onNavigateTab: (tabKey: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  customer,
  onUpdateCustomer,
  onNavigateTab,
}) => {
  const conversionRate =
    customer.totalRequests > 0
      ? Math.round((customer.totalPurchases / customer.totalRequests) * 100)
      : 0;

  const pinnedNotes = customer.notes.filter((n) => n.isPinned);

  return (
    <div className="space-y-6 dir-rtl text-xs text-slate-200">
      {/* Top Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-[11px]">إجمالي الإنفاق والمبيعات</p>
            <p className="text-lg font-black text-emerald-400 mt-1">
              {customer.totalSpent.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-[11px]">إجمالي الطلبات الفعالة</p>
            <p className="text-lg font-black text-blue-400 mt-1">{customer.totalRequests} طلب</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
          <div>
            <p className="text-slate-400 text-[11px]">نسبة إتمام الصفقات</p>
            <p className="text-lg font-black text-purple-400 mt-1">{conversionRate}%</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Pinned Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Customer Information & Lifetime Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Information Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>بيانات التواصل والمنطقة</span>
              </h3>
              <span className="text-[11px] text-slate-400">كود العميل: {customer.id}</span>
            </div>

            {/* Customer Portal Tracking Code & Preview Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs">كود التتبع ببوابة العملاء:</span>
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white tracking-widest">
                        {`TRK-${customer.primaryPhone.slice(-6).toUpperCase()}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      يسمح للعميل بالدخول للبوابة المعزولة لمتابعة حجوزاته واستلام مستنداته برقم هاتفه.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`TRK-${customer.primaryPhone.slice(-6).toUpperCase()}`);
                      alert('تم نسخ كود التتبع بنجاح!');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    نسخ الكود
                  </button>
                  <a
                    href={`/portal`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold transition-colors text-center cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    معاينة Portal العميل
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  رقم الهاتف الرئيسي:
                </span>
                <p className="font-bold text-white text-right font-mono">
                  <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{customer.primaryPhone}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  رقم الواتساب:
                </span>
                <p className="font-bold text-emerald-400 text-right font-mono">
                  <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>+{customer.whatsappPhone}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  البريد الإلكتروني:
                </span>
                <p className="font-bold text-slate-200">{customer.email || 'غير مسجل'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  العنوان والمنطقة:
                </span>
                <p className="font-bold text-slate-200">
                  {customer.address?.cityArea || 'غير محدد'}{customer.address?.governorate ? ` - ${customer.address.governorate}` : ''}
                </p>
                {customer.address?.streetAddress && (
                  <p className="text-[11px] text-slate-400">{customer.address.streetAddress}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  تاريخ أول تواصل:
                </span>
                <p className="font-bold text-slate-200">
                  {new Date(customer.firstContactDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  آخر نشاط بالمعرض:
                </span>
                <p className="font-bold text-slate-200">
                  {new Date(customer.lastActivityDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Lifetime Summary */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ملخص القيمة التراكمية للعميل (Customer Lifetime Summary)</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              تم إنجاز <strong>{customer.totalPurchases} صفقات شراء</strong> ناجحة بإجمالي مبلغ{' '}
              <strong className="text-emerald-400">{customer.totalSpent.toLocaleString('ar-EG')} ج.م</strong>.
              العميل يظهر ولاءً عالياً لمعرض PRO TECK ويتم متابعته بواسطة المسؤول{' '}
              <strong className="text-blue-400">{customer.assignedAdmin || 'غير معين'}</strong>.
            </p>
          </div>
        </div>

        {/* Right Column (1 Col): Tags & Pinned Notes */}
        <div className="space-y-6">
          {/* Customer Tags */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>وسوم وتصنيفات العميل</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-[11px] flex items-center gap-1.5 shadow-sm"
                >
                  <Tag className="w-3 h-3 text-amber-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Pinned Notes Quick Access */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-rose-400" />
                <span>الملاحظات المقتطعة والمهام</span>
              </h3>
              <button
                onClick={() => onNavigateTab('notes')}
                className="text-blue-400 hover:underline text-[11px] font-bold"
              >
                عرض الكل
              </button>
            </div>

            {pinnedNotes.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4">لا توجد ملاحظات مثقلة حالياً</p>
            ) : (
              <div className="space-y-2">
                {pinnedNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[10px] text-amber-400">
                      <span>{n.author}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
