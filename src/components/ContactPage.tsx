import React from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { Card, CardBody } from './ui/Card';
import { MapPin, Clock, Mail, Phone, MessageCircle, Navigation, Facebook } from 'lucide-react';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../utils/phoneUtils';

export const ContactPage: React.FC = () => {
  const { settings } = useShowroom();

  const primaryPhone = settings.phone;
  const secondaryPhone = settings.secondaryPhone;
  const facebookUrl = settings.socialLinks?.facebook;

  return (
    <div className="max-w-5xl mx-auto pb-12 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600" />
          معلومات معرض PRO TECK والعنوان
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          يسعدنا زيارتكم لمعاينة كافة الأجهزة المنزلية الجديدة والمستعملة وتجربتها بنفسك بالمعرض
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardBody className="flex items-start gap-4 p-5">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">عنوان المعرض</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {settings.address.fullAddress}
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-1">
                  {settings.address.landmarks}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-start gap-4 p-5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">مواعيد وساعات العمل</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {settings.workingHours.text}
                </p>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                  المعرض مفتوح طوال أيام الأسبوع
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Primary Phone Card */}
          <Card>
            <CardBody className="flex items-start gap-4 p-5">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">الخط الرئيسي للمعرض</h3>
                <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>
                    {formatPhoneForDisplay(primaryPhone)}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href={`tel:${primaryPhone}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    اتصال
                  </a>
                  <a
                    href={`https://wa.me/${normalizeEgyptianPhone(primaryPhone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    واتساب
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Secondary Phone Card */}
          <Card>
            <CardBody className="flex items-start gap-4 p-5">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">الخط الثاني للمعرض</h3>
                <p className="text-xs font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>
                    {formatPhoneForDisplay(secondaryPhone)}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <a
                    href={`tel:${secondaryPhone}`}
                    className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    اتصال
                  </a>
                  <a
                    href={`https://wa.me/${normalizeEgyptianPhone(secondaryPhone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    واتساب
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Facebook Page Card */}
          {facebookUrl && (
            <Card>
              <CardBody className="flex items-start gap-4 p-5">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 shrink-0">
                  <Facebook className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">فيسبوك المعرض الرسمي</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    تابع أحدث عروض ومعروضات الأجهزة الفاخرة يومياً
                  </p>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-2 hover:underline"
                  >
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                    زيارة صفحة فيسبوك
                  </a>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Map / Location Showcase */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">موقع المعرض على الخريطة (المعادي شارع 68)</h3>
                <p className="text-xs text-slate-400 mt-1">القاهرة - المعادي</p>
              </div>
              <a
                href={settings.address.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                فتح الخريطة
              </a>
            </div>

            <CardBody className="flex-1 p-0 relative min-h-[350px] bg-slate-800 flex items-center justify-center text-slate-400">
              <iframe
                title="PRO TECK Showroom Maadi Location"
                src={settings.address.googleMapsEmbedUrl || BUSINESS_CONFIG.address.googleMapsEmbedUrl}
                className="w-full h-full min-h-[350px] border-0"
                loading="lazy"
                allowFullScreen
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
