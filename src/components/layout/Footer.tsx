import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Sparkles,
  Facebook,
} from 'lucide-react';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../../utils/phoneUtils';

export const Footer: React.FC = () => {
  const { settings, categories, navigateTo } = useShowroom();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ضمان وجودة حقيقية</h4>
              <p className="text-xs text-slate-400 mt-1">
                جميع الأجهزة المستعملة والجديدة مفحوصة بدقة بضمان معتمد من PRO TECK.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">فحص شامل وشهادة جودة</h4>
              <p className="text-xs text-slate-400 mt-1">
                تقرير فني كامل يوضح الحالة التشغيلية ونسبة الكفاءة لكل جهاز قبل العرض.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">معاينة واقعية بالمعادي</h4>
              <p className="text-xs text-slate-400 mt-1">
                احجز الجهاز وافحصه بنفسك في معرضنا بشارع 68 المعادي.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl electric-gradient flex items-center justify-center text-white font-black text-lg">
                PT
              </div>
              <span className="font-black text-xl text-white">PRO TECK</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.brandTagline}
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-300 mt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.address.fullAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.workingHours.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Categories */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800">
              أقسام المعرض
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateTo('products', { categoryId: cat.id })}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-right cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800">
              روابط سريعة
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('products', { filterCondition: 'new' })}
                  className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  الأجهزة الجديدة بالكرتونة
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('products', { filterCondition: 'used' })}
                  className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  الأجهزة المستعملة بحالة الفابريقة
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('sell')}
                  className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  بيع جهازك لـ PRO TECK
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  عنوان وساعات العمل بالمعادي
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800">
              أرقام المعرض والتواصل
            </h4>
            <div className="flex flex-col gap-3 text-xs text-slate-300 mb-4">
              {/* Primary Phone */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-blue-400">الخط الرئيسي:</span>
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${settings.phone}`}
                    className="font-extrabold text-white hover:text-blue-400 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.phone)}</span>
                  </a>
                  <a
                    href={`https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[10px] font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    واتساب
                  </a>
                </div>
              </div>

              {/* Secondary Phone */}
              {settings.secondaryPhone && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-amber-400">الخط الثاني:</span>
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${settings.secondaryPhone}`}
                      className="font-extrabold text-white hover:text-blue-400 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.secondaryPhone)}</span>
                    </a>
                    <a
                      href={`https://wa.me/${normalizeEgyptianPhone(settings.secondaryWhatsappPhone || settings.secondaryPhone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[10px] font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      واتساب
                    </a>
                  </div>
                </div>
              )}

              {/* Official Facebook Page Button */}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  صفحتنا الرسمية على فيسبوك
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sleek Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {settings.address.fullAddress}
            </span>
            <span>ساعات العمل: {settings.workingHours.text}</span>
          </div>
          <div className="flex items-center gap-6">
            <span>{settings.email}</span>
            <span className="text-blue-500 font-bold">PRO TECK © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
