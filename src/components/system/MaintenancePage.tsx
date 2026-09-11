import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Button } from '../ui/Button';
import { Wrench, Clock, Phone, MessageSquare, MapPin } from 'lucide-react';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../../utils/phoneUtils';

export const MaintenancePage: React.FC = () => {
  const { settings } = useShowroom();
  const whatsappPhone = normalizeEgyptianPhone(settings.whatsappPhone || settings.phone);
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار أثناء أعمال الصيانة التحديثية لمعرض PRO TECK.')}`;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl w-full shadow-2xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-3xl shadow-inner">
          <Wrench className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-[11px] border border-amber-500/20">
            تحديث وتطوير الأنظمة
          </span>
          <h2 className="text-2xl font-black text-white mt-2">المعرض الإلكتروني قيد الصيانة المبرمجة</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            نقوم حالياً بتحديث وتحديث قوالب الأجهزة والأسعار لضمان أفضل خدمة لكم. المعرض الميداني بمقر المعادي مفتوح كالمعتاد لاستقبالكم.
          </p>
        </div>

        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-right space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>ساعات العمل الميداني: {settings.workingHours.text || 'يومياً من 2:00 ظهراً حتى 1:00 صباحاً'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span>العنوان: {settings.address.fullAddress}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
          <a
            href={`tel:${settings.phone}`}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Phone className="w-4 h-4" />
            <span>اتصال تلفوني ({formatPhoneForDisplay(settings.phone)})</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 font-extrabold hover:bg-emerald-600 hover:text-white transition-all text-xs flex items-center gap-2 border border-emerald-500/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>مراسلة واتساب المعرض</span>
          </a>
        </div>
      </div>
    </div>
  );
};
