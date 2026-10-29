import React from 'react';
import { Wrench, CheckCircle2, MessageCircle } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { WhatsAppMessageBuilder } from '../../core/services/WhatsAppMessageBuilder';

export const MaintenanceServiceCta: React.FC = () => {
  const { settings } = useShowroom();

  const handleContactWhatsApp = () => {
    const msg = WhatsAppMessageBuilder.buildServiceRequestMessage();
    WhatsAppMessageBuilder.openWhatsApp(settings.whatsappPhone, msg);
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 shadow-xl">
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex flex-col items-start gap-4 max-w-xl text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Wrench className="w-4 h-4" />
            <span>خدمات الصيانة والإصلاح والفحص الفني</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            صيانة احترافية وفحص منزلي شامل لأجهزتك
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            فريق فني متخصص لإصلاح وصيانة الثلاجات، الغسالات، البوتاجازات، والتكييفات بأعلى معايير الدقة. نوفر الفحص المنزلي وقطع الغيار الموثوقة، مع العلم أنه لا يُشترط شراء الجهاز من المعرض للاستفادة من الخدمة.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 w-full pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>فحص منزلي دقيق وتشخيص سريع للأعطال</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>قطع غيار موثوقة مع ضمان معتمد</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>متاحة للجميع دون اشتراط الشراء من المعرض</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>مواعيد مرنة واستجابة مباشرة عبر واتساب</span>
            </div>
          </div>
        </div>

        {/* Right Action Box */}
        <div className="w-full md:w-auto bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-4 shrink-0 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wrench className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              هل جهازك بحاجة لصيانة أو فحص؟
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تواصل مباشرة مع الفني المختص لحجز موعد ومعاينة العطل
            </p>
          </div>

          <button
            onClick={handleContactWhatsApp}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل عبر واتساب</span>
          </button>
        </div>
      </div>
    </section>
  );
};
