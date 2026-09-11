import React from 'react';
import { 
  ShieldCheck, 
  SearchCheck, 
  BookmarkCheck, 
  CreditCard, 
  RotateCcw, 
  Headphones, 
  Sparkles
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <SearchCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
      title: "فحص فني متخصص بالمعرض",
      description: "تخضع جميع الأجهزة المستعملة لفحص شامل دقيق للكهرباء والكويلات والمواتير بمركز صيانة المعادي المعتمد."
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      title: "المعاينة والتجربة قبل الشراء",
      description: "تفضل بزيارتنا في المعادي شارع 68 وافحص جهازك بنفسك وشاهده وهو يعمل بكفاءة كاملة قبل دفع أي مبلغ."
    },
    {
      icon: <BookmarkCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      title: "نظام حجز مسبق للجهاز",
      description: "احجز الجهاز المفضّل أونلاين واحفظه باسمك لمنع بيعه لعميل آخر حتى حضورك للمعاينة بالمعرض."
    },
    {
      icon: <CreditCard className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
      title: "حجز مجاني وتأكيد فورى",
      description: "تأكيد حجز الجهاز مجاناً أونلاين وحفظه باسمك لحين المعاينة والطلب النهائي بالمعرض."
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-rose-600 dark:text-rose-400" />,
      title: "ضمان استبدال 7 أيام",
      description: "نوفر ضمان استبدال حقيقي لمدة 7 أيام للأجهزة المستعملة مع ضمان صيانة معتمد من صالة العرض."
    },
    {
      icon: <Headphones className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
      title: "خدمة عملاء ودعم استشاري",
      description: "فريق متخصص بالمعادي متاح يومياً من 2:00 ظهراً حتى 1:00 صباحاً لإجابة استفساراتك وترشيح الأنسب."
    }
  ];

  return (
    <section className="bg-slate-900 text-white border border-slate-800 rounded-[32px] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-2xl text-right mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>لماذا يثق بنا عملاء المعادي والقاهرة؟</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          لماذا تختار المعرض الأوّل <br />
          <span className="text-blue-400">PRO TECK بالمعادي؟</span>
        </h2>
      </div>

      {/* Grid of 6 Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-6 transition-all duration-300 flex flex-col gap-3 group hover:border-slate-600"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="font-bold text-lg text-white">
              {feature.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
