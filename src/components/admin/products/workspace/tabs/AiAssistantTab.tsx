import React, { useState } from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import {
  Sparkles,
  CheckCircle2,
  X,
  Copy,
  Bot,
  RefreshCw,
  AlertTriangle,
  ThumbsUp,
  Share2,
  Globe,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface AiAssistantTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ product, onUpdateProduct }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const tools = product.aiAssistantTools || {
    improvedTitle: `ثلاجة ${product.brand} انفرتر ${product.specs[0]?.value || ''} نوفروست فرز أول المعادي`,
    improvedDescription: `احصل على ${product.title} المفحوصة بالكامل بمختبر PRO TECK مع ضمان المعرض المعتمد. تعمل بتكنولوجيا التبريد الذكية الموفرة للكهرباء.`,
    suggestedTags: [product.brand, 'أجهزة_المعادي', 'فرز_أول', 'انفرتر', 'ضمان_المعرض'],
    facebookPostText: `✨ جديد معروضات فرع المعادي شارع 68 ✨\n${product.title} ❄️\nالسعر: ${product.price.toLocaleString()} ج.م فقط!\nمع ضمان المعرض المعتمد وتوصيل فوري.\nاطلب معاينة الجهاز عبر موقعنا الرسمي.`,
    whatsAppAdText: `مرحباً! ${product.title} متوفرة بفرع المعادي بسعر ${product.price.toLocaleString()} ج.م شامل الضمان. لمعاينة الجهاز اضغط هنا.`,
    seoDescriptionText: `اشتري ${product.title} بأفضل سعر في مصر من معرض المعادي شارع 68 مع ضمان 10 سنوات وتوصيل لجميع المحافظات.`,
    approvalStatus: 'pending',
  };

  const handleSimulateAiRun = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onUpdateProduct({
        aiAssistantTools: {
          ...tools,
          lastGeneratedAt: new Date().toLocaleString('ar-EG'),
          approvalStatus: 'pending',
        },
      });
    }, 1200);
  };

  const handleApproveField = (fieldKey: string, newValue: any) => {
    if (fieldKey === 'title') {
      onUpdateProduct({ title: newValue, updatedAt: new Date().toISOString() });
    } else if (fieldKey === 'description') {
      onUpdateProduct({ publicDescription: newValue, updatedAt: new Date().toISOString() });
    } else if (fieldKey === 'seo') {
      onUpdateProduct({
        seo: { title: product.title, description: newValue, keywords: tools.suggestedTags || [] },
      });
    }

    // Mark AI status as approved
    onUpdateProduct({
      aiAssistantTools: { ...tools, approvalStatus: 'approved' },
      auditRecords: [
        {
          id: `audit-${Date.now()}`,
          date: new Date().toLocaleString('ar-EG'),
          adminName: 'PRO TECK Admin',
          adminRole: 'Super Admin',
          action: `اعتماد اقتراح الذكاء الاصطناعي للحقل (${fieldKey})`,
          newValue,
          reason: 'موافقة المشرف المباشرة',
        },
        ...(product.auditRecords || []),
      ],
    });
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Governance Mandatory Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm">قانون حوكمة الذكاء الاصطناعي (AI Governance Rule)</h4>
            <p className="text-[11px] text-indigo-300/80">
              الذكاء الاصطناعي ينصح ويقترح فقط، و **لا يحفظ أي تعديلات تلقائياً**. موافقة واعتماد المدير مطلوبة لكل نص.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateAiRun}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>توليد وتحديث المقترحات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Title & Description Optimizer Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            تحسين العنوان والوصف للجمهور (Copywriter AI)
          </h3>

          {/* Title Suggestion */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 font-bold block">العنوان المقترح لتحسين محركات البحث:</span>
            <p className="font-extrabold text-white text-xs">{tools.improvedTitle}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleApproveField('title', tools.improvedTitle)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>اعتماد وتطبيق كعنوان</span>
              </button>
            </div>
          </div>

          {/* Description Suggestion */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 font-bold block">الوصف التسويقي المقترح:</span>
            <p className="text-slate-300 leading-relaxed text-xs">{tools.improvedDescription}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
              <button
                onClick={() => handleApproveField('description', tools.improvedDescription)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>اعتماد وتطبيق كوصف معلن</span>
              </button>
            </div>
          </div>
        </div>

        {/* Marketing & Ads Generators */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            منشورات السوشيال ميديا والإعلانات
          </h3>

          {/* Facebook Post */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              بوست فيسبوك جاهز للنشر:
            </span>
            <p className="text-slate-300 font-mono text-[11px] whitespace-pre-line">{tools.facebookPostText}</p>
            <button
              onClick={() => navigator.clipboard.writeText(tools.facebookPostText || '')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ النص للفيسبوك</span>
            </button>
          </div>

          {/* WhatsApp Ad */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              رسالة واتساب الترويجية:
            </span>
            <p className="text-slate-300 font-mono text-[11px]">{tools.whatsAppAdText}</p>
            <button
              onClick={() => navigator.clipboard.writeText(tools.whatsAppAdText || '')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ النص للواتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
