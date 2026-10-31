import React, { useState } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { Phone, MessageCircle, Facebook, X, ChevronUp } from 'lucide-react';
import { normalizeEgyptianPhone, formatPhoneForDisplay } from '../utils/phoneUtils';

export const FloatingContactWidget: React.FC = () => {
  const { settings } = useShowroom();
  const [isOpen, setIsOpen] = useState(false);

  const primaryPhone = settings.phone;
  const secondaryPhone = settings.secondaryPhone;
  const facebookUrl = settings.socialLinks?.facebook;

  const primaryPhoneNormalized = normalizeEgyptianPhone(primaryPhone);
  const secondaryPhoneNormalized = normalizeEgyptianPhone(secondaryPhone);

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 flex flex-col items-start sm:items-end gap-3 font-sans dir-rtl">
      {/* Expanded Quick Contact Panel */}
      {isOpen && (
        <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl w-[calc(100vw-2rem)] max-w-xs sm:w-80 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                تواصل مباشر مع PRO TECK
              </h4>
              <p className="text-[11px] text-slate-400">يسعدنا المساعدة والمعاينة بالمعرض</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Contact Option */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              الخط الرئيسي (اتصال وواتساب)
            </span>
            <div className="text-sm font-extrabold text-slate-100">
              <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>
                {formatPhoneForDisplay(primaryPhone)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={`tel:${primaryPhone}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال هاتفي
              </a>
              <a
                href={`https://wa.me/${primaryPhoneNormalized}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                مراسلة واتساب
              </a>
            </div>
          </div>

          {/* Secondary Contact Option */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              الخط الثاني (اتصال وواتساب)
            </span>
            <div className="text-sm font-extrabold text-slate-100">
              <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>
                {formatPhoneForDisplay(secondaryPhone)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={`tel:${secondaryPhone}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال هاتفي
              </a>
              <a
                href={`https://wa.me/${secondaryPhoneNormalized}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                مراسلة واتساب
              </a>
            </div>
          </div>

          {/* Facebook Link */}
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all"
            >
              <Facebook className="w-4 h-4 fill-current" />
              تابع صفحتنا الرسمية على فيسبوك
            </a>
          )}
        </div>
      )}

      {/* Main Trigger Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 text-white font-extrabold text-[11px] sm:text-xs shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
      >
        <div className="relative">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
        </div>
        <span>تواصل معنا</span>
        {isOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:ml-1" /> : <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:ml-1" />}
      </button>
    </div>
  );
};
