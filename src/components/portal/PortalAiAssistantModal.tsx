import React, { useState } from 'react';
import { X, Send, Bot, ShieldAlert } from 'lucide-react';

interface PortalAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  phoneNumber: string;
  summaryData: any;
}

export const PortalAiAssistantModal: React.FC<PortalAiAssistantModalProps> = ({
  isOpen,
  onClose,
  customerName,
  phoneNumber,
  summaryData,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: `مرحباً بك يا ${customerName}! أنا المساعد الذكي الخاص ببوابة عملاء PRO TECK. أستطيع مساعدتك في الاستفسار عن حالة طلباتك وحجوزاتك، شرح بنود الضمان والفواتير، أو صياغة طلبات الاستفسار لإدارة المعرض.`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = '';
      const q = query.toLowerCase();

      if (q.includes('ضمان') || q.includes('تأمين')) {
        aiResponse = `بناءً على سجلات حسابك (${phoneNumber})، يسري ضمان المعرض لمدة 12 شهراً كاملاً من تاريخ الفاتورة الرسمية. يتضمن الضمان تغطية عيوب التصنيع والمكونات الفنية الداخلية، مع خيار الاستبدال خلال 14 يوماً من تاريخ الاستلام في حال العيوب المصنعية غير القابلة للإصلاح.`;
      } else if (q.includes('حجز')) {
        aiResponse = `لديك حالياً (${summaryData?.reservations?.length || 0}) حجز نشط. بمجرد تأكيد الطلب، يتم حفظ الحجز وتخصيص الجهاز باسمك بالمعرض لمدة 24 ساعة للمعاينة والاستلام. يمكنك معاينة الجهاز وتجربته فنياً بفرع المعادي (شارع 68) قبل السداد.`;
      } else if (q.includes('فاتورة') || q.includes('إيصال')) {
        aiResponse = `يمكنك معاينة وطباعة كافة الفواتير وإيصالات الاستلام المعتمدة مباشرة عبر تبويب "مستنداتي" في القائمة الجانبية. جميع المستندات موثقة ومزودة برقم مرجعي إلكتروني.`;
      } else if (q.includes('ملخص') || q.includes('طلباتي')) {
        aiResponse = `ملخص نشاطك في المعرض:\n• عدد طلبات الشراء: ${summaryData?.purchaseRequests?.length || 0}\n• عدد الحجوزات النشطة: ${summaryData?.reservations?.length || 0}\n• الأجهزة المشتراة والمضمونة: ${summaryData?.completedSales?.length || 0}\nجميع بياناتك آمنة ومحفوظة برقم هاتفك المسجل.`;
      } else {
        aiResponse = `شكراً لتواصلك! تم تدوين استفسارك. يسعدنا إفادتك بأن إدارة معرض PRO TECK بالمعادي مجهزة لتزويدك بكافة التفاصيل الفنية. يمكنك متابعة حالة طلبك أو التواصل المباشر مع مبيعات المعرض عبر قسم الدعم الفني.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponse,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">مساعد بوابة العملاء الذكي</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  متصل ومستعد
                </span>
              </div>
              <p className="text-xs text-slate-400">خاص بـ: {customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Policy Notice */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            تنبيه أمان: المساعد الذكي يقدم المعلومات والملخصات والشروح فقط. لا يملك المساعد الصلاحية للموافقة على الطلبات أو تعديل البيانات.
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => handleSend('ما هو ملخص طلباتي وحجوزاتي؟')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer font-medium"
          >
            📊 ملخص حسابي
          </button>
          <button
            onClick={() => handleSend('اشرح لي شروط وضمان المعرض')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer font-medium"
          >
            🛡️ شروط الضمان
          </button>
          <button
            onClick={() => handleSend('كيف يمكنني طباعة الفواتير وإيصالات الحجز؟')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer font-medium"
          >
            🧾 طباعة الفواتير
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-blue-100 text-left' : 'text-slate-400 text-right'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Bot className="w-4 h-4 text-blue-500 animate-bounce" />
              <span>جاري صياغة الإجابة...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب استفسارك هنا..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
