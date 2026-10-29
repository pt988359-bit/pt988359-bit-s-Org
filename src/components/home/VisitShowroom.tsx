import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Mail, 
  Navigation, 
  Building2,
} from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { normalizeEgyptianPhone } from '../../utils/phoneUtils';

import { BUSINESS_CONFIG } from '../../config/businessConfig';

export const VisitShowroom: React.FC = () => {
  const { settings } = useShowroom();

  return (
    <section className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>العنوان والمقر الرئيسي بالمعادي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            تفضل بزيارة صالة العرض بالمعادي
          </h2>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          معاينة حية وتجربة تشغيل فورية لكافة الأجهزة
        </div>
      </div>

      {/* Main Grid: Showroom Image & Info vs Map Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column (7 cols): Showroom Image & Details */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-lg">
          <div className="space-y-6">
            {/* Showroom Image Placeholder */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center p-6 space-y-2 select-none">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center mb-2 border border-blue-500/30">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="text-white font-extrabold text-base">معرض PRO TECK المعادي</h4>
                <p className="text-slate-400 text-xs">أكبر تشكيلة أجهزة كهربائية فرز أول ومستعملة بالضمان</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 right-4 text-white space-y-1 z-10">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  معرض PRO TECK الرئيسي
                </span>
                <h3 className="text-xl font-bold">المعادي - شارع 68</h3>
              </div>
            </div>

            {/* Address & Hours Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">العنوان والتفاصيل</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                    القاهرة - المعادي - شارع 68
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {settings.address.landmarks}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">مواعيد العمل اليومية</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                    2:00 ظهراً - 1:00 صباحاً (2 PM - 1 AM)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                    مفتوح طوال أيام الأسبوع
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Contact Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <a
              href={`tel:${settings.phone}`}
              className="py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال</span>
            </a>

            <a
              href={`https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>واتساب</span>
            </a>

            <a
              href={`mailto:${settings.email}`}
              className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>إيميل</span>
            </a>

            <a
              href={settings.address.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Navigation className="w-4 h-4" />
              <span>اتجاهات</span>
            </a>
          </div>
        </div>

        {/* Right Column (5 cols): Google Maps Interactive View Placeholder */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] overflow-hidden flex flex-col justify-between shadow-lg relative min-h-[380px]">
          {/* Map Header Overlay */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 z-10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold">موقع المعرض على الخريطة</span>
            </div>
            <a
              href={settings.address.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>فتح خرائط جوجل</span>
              <Navigation className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Map Iframe / Placeholder */}
          <div className="relative w-full h-full min-h-[320px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
            <iframe
              title="PRO TECK Maadi Showroom Location Map"
              src={settings.address.googleMapsEmbedUrl || BUSINESS_CONFIG.address.googleMapsEmbedUrl}
              className="w-full h-full border-0 min-h-[340px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};
