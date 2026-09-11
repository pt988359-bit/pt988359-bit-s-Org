import React from 'react';
import { X, Sparkles, PenTool, Zap, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface ProductEntryChoiceModalProps {
  onClose: () => void;
  onSelectManual: () => void;
  onSelectAiIntake: () => void;
}

export const ProductEntryChoiceModal: React.FC<ProductEntryChoiceModalProps> = ({
  onClose,
  onSelectManual,
  onSelectAiIntake,
}) => {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">إضافة جهاز جديد بالنظام</h2>
              <p className="text-slate-400 text-xs mt-0.5">اختر مسار إدخال البيانات المفضل لإدارة المعرض</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Selection Grid */}
        <div className="p-6 space-y-4">
          {/* AI Intake Choice (Flagship Feature) */}
          <div
            onClick={onSelectAiIntake}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-blue-950/40 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>المحرك الذكي الأسرع</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-all shrink-0">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 flex-1 pr-1 sm:pr-0">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                <span>1. الإدخال بالذكاء الاصطناعي (AI Smart Product Intake)</span>
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                الصق أي نص عشوائي (رسالة واتساب، إعلان، مواصفات، فاتورة) وسيتم استخراج الماركة، التكلفة، الضمان، الوصف، والمواصفات تلقائياً مع شاشة مراجعة ونسب ثقة.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                  توفير 90% من الوقت
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  مراجعة مسبقة قبل الحفظ
                </span>
              </div>
            </div>
          </div>

          {/* Manual Entry Choice */}
          <div
            onClick={onSelectManual}
            className="group p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="p-4 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 group-hover:scale-105 transition-all shrink-0">
              <PenTool className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">
                2. الإدخال اليدوي التقليدي (Manual Product Entry)
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                تعبئة النموذج التقليدي خطوة بخطوة وإدخال بيانات الجهاز الأساسية والتكلفة يدوياً.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>نموذج تحكم مباشر بكافة الحقول</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>كلا المسارين يضمنان توليد كود فريد وسجل شراء مالي محكم</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
