import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "كيف يمكنني طلب شراء جهاز عبر الموقع؟",
      a: "يمكنك الضغط على زر 'طلب الشراء' في أي صفحة منتج، ثم إدخال بيانات الاسم ورقم الهاتف. يتواصل معك فريقنا لتأكيد التفاصيل وترتيب موعد المعاينة أو التوصيل السريع."
    },
    {
      q: "هل الدفع يتم أونلاين أم عند الاستلام؟",
      a: "الدفع يتم بالكامل عند الاستلام والمعاينة، إما داخل معرضنا بالمعادي شارع 68 أو بعد فحص الجهاز عند التوصيل لمنزلك بدون أي مدفوعات مسبقة."
    },
    {
      q: "ما هي فترة وشروط الضمان المعتمد للأجهزة الجديدة والمستعملة؟",
      a: "الأجهزة الجديدة تشمل ضمان الوكيل المعتمد بالكامل (من سنتين إلى 10 سنوات). أما الأجهزة المستعملة فتخضع لفحص شامل وتأتي بضمان معتمد من معرض PRO TECK بالمعادي لمدة من 6 إلى 12 شهراً مع حق الاستبدال خلال 7 أيام."
    },
    {
      q: "هل يمكنني تجربة وفحص تشغيل الجهاز بنفسي داخل المعرض؟",
      a: "بالتأكيد! نرحب بك دائماً في معرضنا بالمعادي شارع 68 طوال مواعيد العمل (2:00 ظهراً - 1:00 صباحاً). يقوم الفنيون بتشغيل الجهاز أمامك واختبار التبريد/التسخين والكهرباء بالكامل قبل دفع باقي المبلغ."
    },
    {
      q: "هل الأسعار المعلنة نهائية أم قابلة للتفاوض؟",
      a: "الأسعار محددة بناءً على التقييم الفني العادل والدقيق لكل جهاز. الأجهزة التي تحمل شارة 'قابل للتفاوض' تسمح بتفاوض بسيط ومباشر داخل صالة العرض مع مدير المبيعات."
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>الأسئلة الأكثر شيوعاً</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          كل ما تحتاج معرفته عن الشراء والمعاينة والضمان
        </h2>
      </div>

      {/* Accordion Container */}
      <div className="space-y-3 pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-slate-900 border-blue-500/50 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-right font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
