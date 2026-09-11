import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Button } from '../ui/Button';
import { RefreshCw, Home, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import { normalizeEgyptianPhone } from '../../utils/phoneUtils';

interface ServerErrorPageProps {
  error?: Error | string;
  onRetry?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({ error, onRetry }) => {
  const { navigateTo, settings } = useShowroom();
  const whatsappPhone = normalizeEgyptianPhone(settings.whatsappPhone || settings.phone);
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('السلام عليكم، واجهت عطل فني (500) بالمنصة الرقمية لمعرض PRO TECK.')}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-black text-3xl shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
            خطأ في الخادم (500)
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">حدث عطل فني طارئ في المعرض</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            نعتذر لك! حدثت مشكلة غير متوقعة أثناء معالجة طلبك. نأمل منك إعادة المحاولة أو التواصل مع الدعم الفني للمعرض.
          </p>
          {error && (
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-400 text-right overflow-x-auto max-h-24">
              {typeof error === 'string' ? error : error.message}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
          {onRetry && (
            <Button
              variant="electric"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              إعادة المحاولة
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigateTo('home')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            الرئيسية
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 font-extrabold hover:bg-emerald-600 hover:text-white transition-all text-xs flex items-center gap-2 border border-emerald-500/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>تواصل مع الدعم</span>
          </a>
        </div>
      </div>
    </div>
  );
};
