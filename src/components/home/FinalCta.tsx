import React from 'react';
import { ShoppingBag, MapPin, Sparkles, ShieldCheck, Phone } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

export const FinalCta: React.FC = () => {
  const { navigateTo, settings } = useShowroom();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white rounded-[36px] p-8 sm:p-14 md:p-16 border border-slate-800 shadow-2xl">
      {/* Decorative Blur Effect */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>PRO TECK • المعادي شارع 68</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          جاهز لمعاينة أحدث الأجهزة الفاخرة بنفسك؟
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
          تفضل بزيارة صالة العرض بالمعادي لاختبار وتجربة أحدث الأجهزة الجديدة والمستعملة المضمونة، أو احجز جهازك أونلاين الآن بخطوات بسيطة.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigateTo('products')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/30 cursor-pointer flex items-center gap-2.5"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>تصفح كافة المعروضات</span>
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-2xl transition-all backdrop-blur-md cursor-pointer flex items-center gap-2.5"
          >
            <MapPin className="w-5 h-5 text-rose-400" />
            <span>زيارة صالة العرض بالمعادي</span>
          </button>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 w-full">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ضمان معتمد على كافة الأجهزة</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <span>خدمة العملاء: <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.phone)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>القاهرة - المعادي - شارع 68</span>
          </div>
        </div>
      </div>
    </section>
  );
};
