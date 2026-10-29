import React, { useState } from 'react';
import { normalizeEgyptianPhone } from '../../../utils/phoneUtils';
import {
  Bot,
  X,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  TrendingDown,
  Clock,
  Send,
} from 'lucide-react';

interface OrderAiAssistantModalProps {
  orderData: {
    referenceNumber: string;
    customerName: string;
    customerPhone: string;
    productTitle: string;
    productPrice: number;
    status: string;
    suggestedPrice?: number;
    notes?: string;
  };
  onClose: () => void;
}

export const OrderAiAssistantModal: React.FC<OrderAiAssistantModalProps> = ({ orderData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'draft_whatsapp' | 'risks' | 'suggest_actions'>('summary');
  const [copied, setCopied] = useState(false);

  // Generates smart draft WhatsApp message based on status and details
  const generateWhatsappDraft = () => {
    return `أهلاً بك أ. ${orderData.customerName} 👋
معك خدمة العملاء من PRO TECK - فرع المعادي.

بخصوص طلبك رقم (${orderData.referenceNumber}) لـ "${orderData.productTitle}":
يسعدنا إبلاغك بأن الجهاز جاهز للمعاينة والاستلام بالمعرض.
المبلغ المطلوب هو: ${orderData.productPrice.toLocaleString('ar-EG')} ج.م.

يمكنك السداد كاش أو عبر InstaPay عند الاستلام، أو زيارتنا في شارع 68 المعادي للمعاينة والتجربة.
للرد السريع لا تتردد بالرد على هذه الرسالة مباشرة!`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>المساعد الذكي لإدارة الطلبات والعمليات (PRO TECK AI)</span>
              </h2>
              <p className="text-slate-400 text-[11px]">
                تحليل الطلب: <strong className="text-indigo-400">{orderData.referenceNumber}</strong> | العميل:{' '}
                <strong className="text-slate-200">{orderData.customerName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Operational Rules Disclaimer (Mandatory) */}
        <div className="p-3.5 bg-indigo-950/50 border-b border-indigo-800/40 text-indigo-300 text-[11px] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="leading-tight">
            <strong>قانون الأمان الذكي:</strong> المساعد يقوم بالتلخيص والتحليل وصياغة الردود واكتشاف المخاطر فقط.{' '}
            <span className="text-rose-400 font-bold underline">
              الذكاء الاصطناعي لا يوافق ولا يغير الحالة ولا يتواصل مباشرة مع العميل تلقائياً.
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ملخص الطلب</span>
          </button>

          <button
            onClick={() => setActiveTab('draft_whatsapp')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'draft_whatsapp'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>مسودة رد واتساب</span>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'risks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>كشف المخاطر والنواقص</span>
          </button>

          <button
            onClick={() => setActiveTab('suggest_actions')}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'suggest_actions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>توصيات الإجراء التالي</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-[11px]">
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>التحليل التلخيصي السريع من الذكاء الاصطناعي:</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  الطلب المقدم من العميل <strong>{orderData.customerName}</strong> يخص شراء الجهاز{' '}
                  <strong className="text-white">{orderData.productTitle}</strong> بقيمة أصلية{' '}
                  <strong className="text-emerald-400">{orderData.productPrice.toLocaleString('ar-EG')} ج.م</strong>.
                  الحالة الحالية هي <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-white">{orderData.status}</span>.
                </p>
                {orderData.notes && (
                  <p className="text-slate-400 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    ملاحظات المسجلة: "{orderData.notes}"
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'draft_whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-300">مسودة رد مقترحة عبر الواتساب:</span>
                <button
                  onClick={() => handleCopy(generateWhatsappDraft())}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={7}
                value={generateWhatsappDraft()}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-emerald-300 font-sans leading-relaxed focus:outline-none"
              />

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span>تنبيه: يمكنك نسخ النص وإرساله يدوياً عبر تطبيق الواتساب الخاص بالمعرض.</span>
                <a
                  href={`https://wa.me/${normalizeEgyptianPhone(orderData.customerPhone || '')}?text=${encodeURIComponent(generateWhatsappDraft())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-extrabold hover:bg-emerald-500 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>فتح في واتساب</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <h4 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>نقاط المخاطر والملاحظات المكتشفة:</span>
                </h4>
                <ul className="space-y-1.5 text-amber-200 list-disc list-inside leading-relaxed">
                  <li>يوصى بالتحقق من موعد الحضور للمعاينة بالمعرض قبل التوصيل.</li>
                  <li>يوصى بالتحقق من مطابقة الهاتف والصورة قبل تأكيد التوصيل.</li>
                  <li>نسبة الخصم المطلوبة أعلى من الحد المسموح للأجهزة الفرز الأول.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'suggest_actions' && (
            <div className="space-y-3">
              <span className="font-extrabold text-slate-300 block">خطوات العمل الموصى بها للأدمن:</span>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-white font-bold block">1. إرسال تذكير بالدفع عبر الواتساب</strong>
                    <span className="text-slate-400">لإنهاء فترة الانتظار وتأكيد طلب الشراء.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-[10px]">توصية عالية</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-white font-bold block">2. تعيين موعد معاينة بفرع المعادي</strong>
                    <span className="text-slate-400">في حال رغبة العميل بفحص الجهاز بنفسه قبل الدفع.</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-[10px]">توصية فرعية</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">PRO TECK AI Kernel v2.5 - Enterprise Operational Intelligence</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold transition-all cursor-pointer"
          >
            إغلاق المساعد
          </button>
        </div>
      </div>
    </div>
  );
};
