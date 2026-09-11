import React from 'react';
import { 
  Search, 
  FileText, 
  CreditCard, 
  SearchCheck, 
  CheckCircle2, 
  ArrowDown, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';

export const BuyingProcessTimeline: React.FC = () => {
  const { navigateTo } = useShowroom();

  const steps = [
    {
      num: "01",
      icon: <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "تصفح معروضات المعرض",
      desc: "استعرض تشكيلة الأجهزة الجديدة والمستعملة الفاخرة مع صور حقيقية وتفاصيل كاملة."
    },
    {
      num: "02",
      icon: <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "استعرض الفحص والمواصفات",
      desc: "اقرأ التقييم الفني الدقيق لمركز الصيانة ونسبة كفاءة الجهاز وفترة الضمان المتاحة."
    },
    {
      num: "03",
      icon: <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "احجز الجهاز أونلاين مجاناً",
      desc: "قم بتأكيد حجز الجهاز أونلاين مجاناً لحفظ الجهاز لحين حضورك للمعاينة بالمعرض."
    },
    {
      num: "04",
      icon: <SearchCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "معاينة وتجربة الجهاز بالمعرض",
      desc: "شرفنا بفرع المعادي شارع 68 وافحص جهازك المحجوز واختبر تشغيله على الطبيعة."
    },
    {
      num: "05",
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      title: "استلم جهازك مع فاتورة وضمان",
      desc: "سدد باقي المبلغ كاش أو كارت واستلم جهازك فوراً أو طلب التوصيل المنزلي."
    }
  ];

  return (
    <section className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>خطوات سهلة وآمنة 100%</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          كيف تتم عملية الشراء والمعاينة؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          خطوات بسيطة تضمن لك الحصول على جهازك المفضل بكل شفافية وأمان بالمعرض.
        </p>
      </div>

      {/* Horizontal / Vertical Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Step Number & Icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-800 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-xs shadow-xs">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>

            {/* Connecting Arrow for Desktop */}
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                <ArrowLeft className="w-5 h-5 text-blue-500/60 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Prompt */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigateTo('products')}
          className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <span>تصفح الأجهزة وابدأ الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
