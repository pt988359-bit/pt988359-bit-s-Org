/**
 * AiAssistantChatModal — Real Gemini-powered assistant chat for the admin panel.
 *
 * Connects to the existing POST /api/ai/chat server endpoint (server-side Gemini)
 * so the "المساعد الذكي AI" surfaces in the admin panel open a WORKING conversation
 * instead of local rule-based screens. Hooks are declared before any early return
 * to respect the React Rules of Hooks.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface AiAssistantChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const nowTime = () =>
  new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

const cleanReply = (raw: string) => raw.replace(/\*\*/g, '').trim();

export const AiAssistantChatModal: React.FC<AiAssistantChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا المساعد الذكي الحقيقي لمعرض PRO TECK، مدعوم بـ Gemini. اسألني عن الأجهزة والأسعار ونصائح البيع أو أي شيء يخص إدارة المعرض.',
      time: nowTime(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [slowHintVisible, setSlowHintVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // After 15s of waiting, reassure the user that generation can take up to a minute
  useEffect(() => {
    if (!isTyping) {
      setSlowHintVisible(false);
      return;
    }
    const t = setTimeout(() => setSlowHintVisible(true), 15000);
    return () => clearTimeout(t);
  }, [isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isTyping) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query, time: nowTime() }]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json().catch(() => null);
      const reply = data && data.reply ? String(data.reply) : '';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply
            ? cleanReply(reply)
            : 'عذراً، لم أستطع توليد رد الآن. حاول مرة أخرى بعد قليل.',
          time: nowTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'تعذر الاتصال بخدمة الذكاء الاصطناعي. تحقق من الاتصال ثم أعد المحاولة.',
          time: nowTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-[80vh] flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">المساعد الذكي — PRO TECK</h3>
              <p className="text-[11px] text-slate-400">
                {isTyping ? 'يكتب الآن…' : 'مدعوم بـ Gemini • متصل ومباشر'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            aria-label="إغلاق المحادثة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700'
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block mt-1 text-[10px] ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {slowHintVisible && (
                  <p className="mt-2 text-[10px] text-slate-400">
                    ما زلت أُعد ردك… قد يستغرق التوليد حتى دقيقة تقريبًا، لا تغلق النافذة.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            rows={2}
            placeholder="اكتب سؤالك للمساعد الذكي… (Enter للإرسال)"
            className="flex-1 resize-none bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isTyping || !inputText.trim()}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition cursor-pointer"
            aria-label="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantChatModal;
