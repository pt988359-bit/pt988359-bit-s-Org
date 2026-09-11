import React from 'react';
import { DollarSign, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';

export const SellDeviceCta: React.FC = () => {
  const { navigateTo } = useShowroom();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 shadow-xl">
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-4 max-w-xl text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <DollarSign className="w-4 h-4" />
            <span>خدمة شراء الأجهزة المستعملة بالمعادي</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            هل لديك أجهزة منزلية تريد بيعها بأعلى سعر؟
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            نشتري ثلاجات، غسالات، شاشات، وبوتاجازات مستعملة بحالة جيدة. نقوم بتقديم تقييم عادل وفوري مع إمكانية الفحص المنزلي وسداد الثمن كاش فوراً.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 w-full pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>تقييم عادل وسريع عبر الواتساب</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>دفع كاش فورى عند المعاينة</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>استلام ونقل على حساب المعرض</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>فحص ودية بدون إحراج</span>
            </div>
          </div>
        </div>

        {/* Right Action Box */}
        <div className="w-full md:w-auto bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-4 shrink-0 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              قدم طلب بيع جهازك الآن
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أرفق الصور والتفاصيل وسيصلك الرد خلال دقائق
            </p>
          </div>

          <button
            onClick={() => navigateTo('sell')}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sell Your Device / بيع جهازك القديم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
