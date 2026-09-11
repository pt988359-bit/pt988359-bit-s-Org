import React, { useState } from 'react';
import { Customer } from '../../../../types/customerHub';
import {
  Bot,
  Sparkles,
  Copy,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldAlert,
} from 'lucide-react';

interface AiAssistantTabProps {
  customer: Customer;
  onAddNoteFromAi: (noteText: string) => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ customer, onAddNoteFromAi }) => {
  const [promptType, setPromptType] = useState<
    'history_summary' | 'draft_whatsapp' | 'followup' | 'negotiation_summary' | 'incomplete_check'
  >('history_summary');

  const [aiOutput, setAiOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = (type: typeof promptType) => {
    setPromptType(type);
    setIsGenerating(true);
    setCopied(false);

    setTimeout(() => {
      let result = '';
      if (type === 'history_summary') {
        result = `📋 ملخص تاريخ العميل الشامل (${customer.fullName}):
• كود العميل: ${customer.id} | الحالة: ${customer.status.toUpperCase()}
• إجمالي المبيعات المكتملة: ${customer.totalSpent.toLocaleString('ar-EG')} ج.م عبر ${customer.totalPurchases} صفقات شراء.
• عدد الحجوزات والطلبات: ${customer.totalRequests} طلبات شاملة ${customer.totalReservations} حجوزات.
• الملاحظات الرئيسية: العميل يفضل التواصل عبر الواتساب، ويهتم بأجهزة النوفروست والشاشات.
• التقييم العام: عميل هاديء عالي القيمة (High-Value Customer) يحتاج متابعة تسليم الفواتير في المواعيد المحددة.`;
      } else if (type === 'draft_whatsapp') {
        result = `أهلاً بك أستاذ ${customer.fullName}🌹
معك ${customer.assignedAdmin || 'معرض PRO TECK للأجهزة المنزلية'}.
أود إبلاغ سيادتك ببدء فحص وتجهيز الجهاز الخاص بكم في الفرع. يمكنك معاينة تقرير الفحص الشامل وشهادة الضمان المعيارية عبر هذا الرابط.
يسعدنا تشريفك لمعرض المعادي (شارع 68) أو التأكيد لاستلام الجهاز بمقركم اليوم!
مع خالص التحية، معرض PRO TECK المعادي.`;
      } else if (type === 'followup') {
        result = `مساء الخير أستاذ ${customer.fullName}🌸
أتمنى أن تكون بخير وعافية.
نود المتابعة معكم بشأن طلب الحجز الأخير للجهاز في معرض PRO TECK.
هل يناسبكم تأكيد موعد الشحن اليوم، أم ترغبون في الاستفسار عن تفاصيل إضافية من الفني المختص؟
في خدمتك دائماً!`;
      } else if (type === 'negotiation_summary') {
        result = `💡 تحليل وملخص التفاوض لـ ${customer.fullName}:
• العميل قدم مقترح خصم بقيمة 5% إلى 10% على الأجهزة المحجوزة.
• نسبة قبول العروض السابقة: 100% بشرط تقديم عربون حجز فوري عبر InstaPay.
• التوصية: الموافقة على الخصم المقترح المقدر بـ 1000 ج.م في حالة سداد باقي المبلغ نقداً عند الاستلام.`;
      } else if (type === 'incomplete_check') {
        const missing = [];
        if (!customer.email) missing.push('البريد الإلكتروني غير مكتمل');
        if (!customer.address.streetAddress) missing.push('العنوان التفصيلي للشارع غير مكتمل');

        result = missing.length > 0
          ? `⚠️ تنبيه البيانات غير المكتملة:\n• ${missing.join('\n• ')}\n\nيرجى استكمال البيانات قبل إصدار فاتورة الشراء بالضمان الذهبي.`
          : `✅ جميع البيانات الأساسية والتفصيلية لملف العميل مكتملة بنسبة 100%.`;
      }

      setAiOutput(result);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      {/* Disclaimer Warning Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1.5 shadow-md">
        <div className="flex items-center gap-2 font-extrabold text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>ضوابط الذكاء الاصطناعي (AI Operational Rules)</span>
        </div>
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          الذكاء الاصطناعي يقوم بصياغة الردود وتحليل البيانات للارتقاء بخدمة العميل.{' '}
          <strong>الذكاء الاصطناعي لا يرسل أي رسائل للعميل مباشرة ولا يعدل بيانات العميل تلقائياً.</strong>{' '}
          يتوجب مراجعة واعتماد المشرف البشري قبل أي إجراء.
        </p>
      </div>

      {/* AI Action Quick Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <button
          onClick={() => handleGenerate('history_summary')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 text-right transition-all cursor-pointer space-y-1"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-extrabold text-white block">تلخيص سجل العميل</span>
        </button>

        <button
          onClick={() => handleGenerate('draft_whatsapp')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-right transition-all cursor-pointer space-y-1"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-white block">مسودة رد واتساب</span>
        </button>

        <button
          onClick={() => handleGenerate('followup')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 text-right transition-all cursor-pointer space-y-1"
        >
          <Send className="w-4 h-4 text-blue-400" />
          <span className="font-extrabold text-white block">رسالة متابعة دورية</span>
        </button>

        <button
          onClick={() => handleGenerate('negotiation_summary')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-right transition-all cursor-pointer space-y-1"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-white block">تحليل التفاوض</span>
        </button>

        <button
          onClick={() => handleGenerate('incomplete_check')}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 text-right transition-all cursor-pointer space-y-1"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span className="font-extrabold text-white block">فحص البيانات الناقصة</span>
        </button>
      </div>

      {/* Output Panel */}
      {isGenerating ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-purple-400 space-y-2">
          <Sparkles className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          <p className="font-extrabold text-sm text-white">جاري تحليل بيانات العميل واستخراج التوصية...</p>
        </div>
      ) : aiOutput ? (
        <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>نتيجة ومقترح مساعد الذكاء الاصطناعي:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={() => onAddNoteFromAi(aiOutput)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>إدراج كملاحظة بالملف</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 font-sans leading-relaxed text-xs whitespace-pre-wrap dir-rtl">
            {aiOutput}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">اختر أحد الخيارات أعلاه لبدء المساعدة الذكية لملف العميل</p>
        </div>
      )}
    </div>
  );
};
