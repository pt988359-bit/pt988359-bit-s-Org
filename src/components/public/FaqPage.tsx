import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'warranties' | 'reservations' | 'delivery' | 'trade';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'warranties',
    question: 'ما هي بطاقة الضمان والغطاء المعتمد مع الأجهزة؟',
    answer: 'تأتي الأجهزة مع بطاقة ضمان رسمية معتمدة توضح حالة توفر الضمان وتفاصيل الصيانة بالمعرض مع إمكانية استعراض صورة بطاقة الضمان مباشرة من صفحة الجهاز.',
  },
  {
    category: 'warranties',
    question: 'ماذا يحدث إذا ظهر عيب فني في الجهاز عند المعاينة أو بعد الشراء؟',
    answer: 'في حالة ظهور أي عيب فني، نرسل فني متخصص من المعرض لفحص الجهاز وصيانته مجاناً، أو استبدال الجهاز بجهاز آخر مماثل في حالة عدم إمكانية الإصلاح.',
  },
  {
    category: 'reservations',
    question: 'كيف يعمل نظام الحجز المجاني المباشر؟',
    answer: 'يمكنك إدخال اسمك ورقم الواتساب وساعة الزيارة المفضلين لحجز أي جهاز مجاناً وبدون أي دفع أونلاين. يتم إخفاء الجهاز فوراً من الموقع وبدء عد تنازلي لمدة 24 ساعة لزيارة المعرض والمعاينة على الطبيعة.',
  },
  {
    category: 'reservations',
    question: 'هل توجد أية رسوم أو عربون لحجز الجهاز؟',
    answer: 'لا، الحجز مجاني تماماً وبدون أي عربون أو دفع أونلاين. يتم الشراء وسداد القيمة بالكامل بالمعرض بعد المعاينة والتجربة المباشرة.',
  },
  {
    category: 'delivery',
    question: 'ما هي مناطق التوصيل المتاحة وتكلفة الشحن؟',
    answer: 'نوفر خدمة التوصيل والشحن لجميع مناطق القاهرة الكبرى والجيزة (المعادي، التجمع، مدينة نصر، الشيخ زايد، 6 أكتوبر).',
  },
  {
    category: 'trade',
    question: 'كيف أستبدل جهازي القديم بجهاز حديث من المعرض؟',
    answer: 'قم بفتح صفحة الجهاز الذي ترغب باقتنائه في المعرض، ثم اضغط زر "استبدل جهازك بهذا الجهاز" لتعبئة بيانات جهازك المستعمل. يتم ربط الطلب تلقائياً بالجهاز الجديد ليقوم المهندس بتقدير الفارق وإتمام التبادل.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredFaqs = activeTab === 'all'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === activeTab);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-4xl mx-auto w-full dir-rtl">
      {/* Title */}
      <div className="text-center flex flex-col gap-3 py-4">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-4 py-1.5 rounded-full w-fit mx-auto">
          الأسئلة الشائعة
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          كل ما تحتاج معرفته عن الشراء والحجز والضمان
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          إجابات شاملة ومباشرة على استفسارات عملائنا حول الحجز المجاني لـ 24 ساعة والمعاينة بفرع المعادي.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'warranties', label: 'الضمان والصيانة' },
          { id: 'reservations', label: 'الحجز المجاني (24 ساعة)' },
          { id: 'delivery', label: 'التوصيل والشركات' },
          { id: 'trade', label: 'الاستبدال والبيع' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-4">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card
              key={idx}
              className={`transition-all duration-200 overflow-hidden border ${
                isOpen ? 'border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
              >
                <span className="text-base sm:text-lg flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="p-5 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                  {faq.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
