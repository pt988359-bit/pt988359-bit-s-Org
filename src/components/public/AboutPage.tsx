import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Wrench,
  Sparkles,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, navigateTo } = useShowroom();

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full w-fit">
            عن معرض PRO TECK المعادي
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            الرواد في عالم الأجهزة المنزلية الفاخرة بفرع المعادي
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            معرض PRO TECK تأسس لتقديم مفهوم جديد كلياً في شراء الأجهزة المنزلية الجديدة والمستعملة بحالة الزيرو. ندمج التكنولوجيا الحديثة، والضمان المعتمد، والفحص الفني من 18 نقطة لنضمن لعملائنا أفضل تجربة شراء في مصر.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Button variant="electric" onClick={() => navigateTo('products')}>
              استعرض الأجهزة المتاحة
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigateTo('contact')}>
              تواصل مع إدارة المعرض
            </Button>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">ضمان معتمد حتى 24 شهر</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            كل جهاز يُباع من معرضنا يأتي بضمان رسمي حقيقي وصيانة فورية.
          </p>
        </Card>

        <Card className="p-6 flex flex-col gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">فحص 18 نقطة جودة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            يخضع كل جهاز لمشروع اختبار كامل يشمل الموتور، التبريد، والدوائر الكهربائية.
          </p>
        </Card>

        <Card className="p-6 flex flex-col gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">أشخاص حقيقيون بمعرضنا</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            تفضل بزيارة معرضنا بالمعادي شارع 68 للمعاينة الشاملة والتجربة المباشرة.
          </p>
        </Card>

        <Card className="p-6 flex flex-col gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">تقييم عادل للاستبدال</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            نقدم لك أفضل سعر لجهازك القديم عند الاستبدال أو البيع المباشر للمعرض.
          </p>
        </Card>
      </div>

      {/* Showroom Location & Info */}
      <Card className="p-8 bg-slate-900 text-white flex flex-col lg:flex-row justify-between gap-8 items-center">
        <div className="flex flex-col gap-4 max-w-xl">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">موقعنا وفرعنا الرئيسي</span>
          <h2 className="text-2xl sm:text-3xl font-black">معرض PRO TECK - المعادي شارع 68</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {settings.address.fullAddress} ({settings.address.landmarks})
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <Clock className="w-4 h-4" />
            <span>مواعيد العمل: {settings.workingHours.text}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={settings.address.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
          >
            <MapPin className="w-4 h-4" />
            افتح موقع الخريطة Google Maps
          </a>
        </div>
      </Card>
    </div>
  );
};
