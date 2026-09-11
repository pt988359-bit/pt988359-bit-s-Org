import React from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { Button } from './ui/Button';
import { Home, Search, MessageSquare, PhoneCall } from 'lucide-react';
import { normalizeEgyptianPhone } from '../utils/phoneUtils';

export const NotFoundPage: React.FC = () => {
  const { navigateTo, settings } = useShowroom();
  const whatsappPhone = normalizeEgyptianPhone(settings.whatsappPhone || settings.phone);
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('السلام عليكم، كنت أبحث عن صفحة أو جهاز بالمعرض الإلكتروني ولم أجدها.')}`;

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6 dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-3xl shadow-inner">
          404
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-extrabold text-[11px] border border-blue-500/20">
            عذراً، الصفحة غير متوفرة
          </span>
          <h2 className="text-2xl font-black text-white mt-2">لم نتمكن من العثور على الصفحة المطلوبة</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            قد يكون الرابط الذي اتبعت قد تغير أو تم بيع الجهاز المطلوب. يمكنك تصفح كتالوج أجهزتنا المتاحة حالياً أو التواصل معنا مباشر.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
          <Button
            variant="electric"
            onClick={() => navigateTo('home')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            الرئيسية
          </Button>

          <Button
            variant="outline"
            onClick={() => navigateTo('products')}
            leftIcon={<Search className="w-4 h-4" />}
          >
            تصفح الأجهزة
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 font-extrabold hover:bg-emerald-600 hover:text-white transition-all text-xs flex items-center gap-2 border border-emerald-500/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>استفسار واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
};
