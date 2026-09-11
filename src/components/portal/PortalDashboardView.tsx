import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Phone,
  Facebook,
} from 'lucide-react';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../../utils/phoneUtils';

interface PortalDashboardViewProps {
  session: any;
  aggregatedData: any;
  onNavigate: (view: string) => void;
  onOpenDocument: (doc: any) => void;
  onOpenAi: () => void;
}

export const PortalDashboardView: React.FC<PortalDashboardViewProps> = ({
  session,
  aggregatedData,
  onNavigate,
  onOpenDocument,
  onOpenAi,
}) => {
  const { settings } = useShowroom();
  const {
    purchaseRequests = [],
    reservations = [],
    completedSales = [],
    documents = [],
    warranties = [],
    notifications = [],
  } = aggregatedData;

  const activeReservations = reservations.filter((r: any) => r.status !== 'expired' && r.status !== 'completed');
  const activeWarranties = warranties.filter((w: any) => w.status === 'active');

  return (
    <div className="space-y-8 animate-fade-in dir-rtl">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>بوابة العملاء المعتمدة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              أهلاً بك، {session?.customerName || 'عميلنا العزيز'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              يمكنك متابعة كافة طلبات الشراء، الحجوزات، شهادات الضمان، وإيصالات المعاينة الخاصة بك بكل أمان.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAi}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>استشارة المساعد الذكي</span>
            </button>
            <button
              onClick={() => onNavigate('support')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>الدعم الفني</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('requests')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">طلبات الشراء</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {purchaseRequests.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">طلب مسجل</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('reservations')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الحجوزات النشطة</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeReservations.length}
            </span>
            <span className="text-[11px] text-amber-500 font-medium block mt-0.5">قيد الانتظار والمعاينة</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('purchases')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الأجهزة المشتراة</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {completedSales.length}
            </span>
            <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">عمليات مكتملة</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('warranty')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">شهادات الضمان</span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeWarranties.length}
            </span>
            <span className="text-[11px] text-purple-500 font-medium block mt-0.5">ضمان ساري</span>
          </div>
        </div>
      </div>

      {/* Active Reservation Live Banner if available */}
      {activeReservations.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shrink-0 mt-1 sm:mt-0">
              <Clock className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-amber-200 text-sm sm:text-base">
                  حجز نشط مؤكد: {activeReservations[0].productTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  {activeReservations[0].reservationNumber}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                سعر الجهاز للمعاينة والاستلام بالمعرض: <span className="font-bold text-emerald-600">{activeReservations[0].productPrice.toLocaleString('ar-EG')} ج.م</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reservations')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
          >
            تفاصيل الحجز وإيصال التأكيد
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Requests & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Purchases / Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">أحدث طلبات الشراء والحجز</h3>
              </div>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                عرض كافة الطلبات ({purchaseRequests.length})
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {purchaseRequests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">لا توجد طلبات شراء سابقة مسجلة.</p>
              ) : (
                purchaseRequests.slice(0, 3).map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={req.productImage}
                        alt={req.productTitle}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {req.productTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="font-mono text-blue-500 font-bold">{req.referenceNumber}</span>
                          <span>•</span>
                          <span>{req.productPrice.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                      {req.status === 'new' ? 'جديد قيد المراجعة' : req.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Documents Access */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">المستندات والفواتير الرسمية</h3>
              </div>
              <button
                onClick={() => onNavigate('documents')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                مركز المستندات ({documents.length})
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.slice(0, 4).map((doc: any) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.documentNumber}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors rotate-180" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Notifications & Showroom Info */}
        <div className="space-y-8">
          {/* Private Notifications Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              إشعارات حسابك الرسمية
            </h3>

            <div className="mt-4 space-y-3">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(notif.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Showroom Visit Info Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                PT
              </div>
              <div>
                <h4 className="font-bold text-sm">موقع المعرض للمعاينة</h4>
                <p className="text-xs text-slate-400">{settings.address.fullAddress}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يسعدنا استقبالكم {settings.workingHours.text} لتجربة ومعاينة الأجهزة المحجوزة.
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              {/* Primary Phone */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold block">الخط الرئيسي:</span>
                  <span dir="ltr" className="text-xs font-mono font-bold text-white inline-block" style={{ unicodeBidi: 'isolate' }}>
                    {formatPhoneForDisplay(settings.phone)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${settings.phone}`}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                    title="اتصال"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${normalizeEgyptianPhone(settings.whatsappPhone || settings.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                    title="واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Secondary Phone */}
              {settings.secondaryPhone && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">الخط الثاني:</span>
                    <span dir="ltr" className="text-xs font-mono font-bold text-white inline-block" style={{ unicodeBidi: 'isolate' }}>
                      {formatPhoneForDisplay(settings.secondaryPhone)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${settings.secondaryPhone}`}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                      title="اتصال"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/${normalizeEgyptianPhone(settings.secondaryWhatsappPhone || settings.secondaryPhone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Facebook Link */}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 text-white font-bold text-xs transition-all"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>صفحة فيسبوك الرسمية</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
