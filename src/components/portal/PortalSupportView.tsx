import React, { useState } from 'react';
import { MessageCircle, Send, Bot } from 'lucide-react';
import { getPortalSupportMessages, sendPortalSupportMessage } from '../../utils/portalStorage';

interface PortalSupportViewProps {
  session: any;
  onOpenAi: () => void;
}

export const PortalSupportView: React.FC<PortalSupportViewProps> = ({ session, onOpenAi }) => {
  const [messages, setMessages] = useState(getPortalSupportMessages());
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = sendPortalSupportMessage({
      threadId: 'th-101',
      sender: 'customer',
      senderName: session?.customerName || 'العميل',
      message: inputText.trim(),
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate showroom reply
    setTimeout(() => {
      const adminReply = sendPortalSupportMessage({
        threadId: 'th-101',
        sender: 'showroom_admin',
        senderName: 'PRO TECK Admin',
        message: 'تم استلام رسالتك بنجاح! يسعدنا مساعدتك في أي استفسار يخص أجهزتك وحجوزاتك بالمعرض.',
      });
      setMessages((prev) => [...prev, adminReply]);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in dir-rtl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-500" />
            <span>مركز الدعم والتواصل المباشر مع المعرض</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            محادثات مباشرة وموثقة مع إدارة المبيعات والخدمات الفنية بفرع المعادي.
          </p>
        </div>

        <button
          onClick={onOpenAi}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Bot className="w-4 h-4 text-amber-300" />
          <span>الاستفسار السريع عبر المساعد الذكي</span>
        </button>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg flex flex-col h-[520px] overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'customer' ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'customer'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب استفسارك لإدارة المعرض..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
