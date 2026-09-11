import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Send, Lock } from 'lucide-react';

interface AiBusinessAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiBusinessAssistantModal: React.FC<AiBusinessAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = (promptText?: string) => {
    const input = promptText || query || 'ملخص الشامل للأداء المالي وتحليل الربحية';
    setIsAnalyzing(true);
    setAnalysisOutput(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (input.includes('صيانة') || input.includes('تصليح')) {
        setAnalysisOutput(`📊 **تقرير تحليل تكاليف الصيانة وقطع الغيار (PRO TECK المعادي):**

1. **ديب فريزر بيكو 6 درج (prod-105)**: بلغت مصاريف الصيانة 1,800 ج.م (تغيير فريون ودائرة تبريد) وهي تمثل 11.6% من سعر الشراء.
- **توصية**: عدم زيادة خصم التفاوض للعميل عن 500 ج.م لمنع نزول هامش الربح عن 15%.

2. **غسالة إل جي 8 كيلو (prod-102)**: تم تغيير كاباستور أصلي بقيمة 850 ج.م.
- **توصية**: الجهاز بحالة الفرز الأول، ويمكن رفعه للسعر المستهدف (21,000 ج.م) بثقة وجودة عالية.`);
      } else if (input.includes('تسعير') || input.includes('فصال')) {
        setAnalysisOutput(`💡 **توصيات الذكاء الاصطناعي لنطاقات التسعير وأمان الفصال:**

- **ثلاجة توشيبا 14 قدم**: السعر المستهدف 18,500 ج.م | أمان الفصال حتى 16,500 ج.م | الربح المتوقع 4,250 ج.م (23.0%).
- **شاشة سامسونج 55 بوصة**: السعر المستهدف 17,500 ج.م | أمان الفصال حتى 15,500 ج.م | الربح المتوقع 3,200 ج.م (21.1%).
- **قاعدة الفصال**: عدم تجاوز الخط الأحمر (الحد الأدنى المقبول) بدون موافقة صريحة.`);
      } else {
        setAnalysisOutput(`✨ **الملخص الإداري الشامل للأداء المالي (PRO TECK المعادي - يوليو 2026):**

- **إجمالي المقبوضات الشهرية**: 285,000 ج.م
- **إجمالي المصروفات التشغيلية**: 25,000 ج.م (تشمل إيجار الفرع 15,000 ج.م)
- **صافي الربح الشهري**: 74,500 ج.م (نسبة أرباح ممتازة 26.1%)
- **المنتجات الأكثر ربحية**: ثلاجات توشيبا وغسالات إل جي ديركت درايف
- **المنتجات التي تتطلب تحسين**: ديب فريزر بيكو بسبب ارتفاع تكلفة الصيانة النصف شهرية.`);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                المساعد المالي والإداري الذكي (AI Business Assistant)
              </h3>
              <span className="text-[11px] text-indigo-400 font-bold">تحليل الأداء وتوليد التوصيات التشغيلية</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            إغلاق ✕
          </button>
        </div>

        {/* STRICT MANDATORY RULE BANNER */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3.5 flex items-start gap-2 text-amber-300 text-xs font-bold leading-relaxed">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-400 block font-black">قاعدة حماية النظام المالي:</strong>
            الذكاء الاصطناعي يقوم بالتحليل والاقتراح فقط. يمتنع الذكاء الاصطناعي تماماً عن تسجيل المصروفات، اعتماد الشراء، تعديل الأرقام المالية، أو حذف السجلات. موافقة الأدمن حتمية ومطلوبة دائماً.
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick Preset Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block">تحليلات جاهزة سريعة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRunAnalysis('ملخص الشامل للأداء المالي وتحليل الربحية')}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold cursor-pointer transition-all"
              >
                📊 ملخص الأداء المالي والربحية
              </button>

              <button
                onClick={() => handleRunAnalysis('تحليل تكاليف الصيانة وقطع الغيار')}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold cursor-pointer transition-all"
              >
                🔧 تحليل تكاليف الصيانة المرتفعة
              </button>

              <button
                onClick={() => handleRunAnalysis('توصيات التسعير ونطاق أمان الفصال')}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold cursor-pointer transition-all"
              >
                💡 توصيات نطاقات التسعير والفصال
              </button>
            </div>
          </div>

          {/* Analysis Output Box */}
          {isAnalyzing ? (
            <div className="p-8 text-center space-y-3 bg-slate-950 rounded-2xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-indigo-300">جاري قراءة سجلات الخزينة والتكاليف وتوليد التقرير...</p>
            </div>
          ) : analysisOutput ? (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-slate-100 text-xs font-medium leading-relaxed whitespace-pre-line shadow-inner">
              {analysisOutput}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-bold bg-slate-950/40 rounded-2xl border border-slate-800/60">
              اختر تحليلاً سريعاً أو اكتب سؤالك للاستشارات المالية والإدارية
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب سؤالاً إدارياً (مثال: ما هي أكثر الأجهزة المربحة هذا الشهر؟)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
          <button
            onClick={() => handleRunAnalysis()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            تحليل
          </button>
        </div>
      </div>
    </div>
  );
};
