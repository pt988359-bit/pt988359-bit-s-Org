import React, { useState, useEffect } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Input, Textarea } from './ui/Input';
import { ProductImage } from './ui/ProductImage';
import { validateEgyptianPhone, formatPhoneForDisplay, normalizeEgyptianPhone } from '../utils/phoneUtils';
import { WhatsAppMessageBuilder } from '../core/services/WhatsAppMessageBuilder';
import {
  Sparkles,
  Trash2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ReservationCartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, createReservation, navigateTo, settings } = useShowroom();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredVisitTime, setPreferredVisitTime] = useState('');
  const [notes, setNotes] = useState('');

  const [reservationCreated, setReservationCreated] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [countdownText, setCountdownText] = useState('23:59:59');

  // Countdown timer for confirmation page
  useEffect(() => {
    if (!reservationCreated || !reservationDetails?.expiresAt) return;

    const interval = setInterval(() => {
      const expires = new Date(reservationDetails.expiresAt).getTime();
      const diff = expires - Date.now();

      if (diff <= 0) {
        setCountdownText('انتهت مهلة الحجز (24 ساعة)');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownText(
        `${hours.toString().padStart(2, '0')}:${mins
          .toString()
          .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationCreated, reservationDetails]);

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      showToast('بيانات ناقصة', 'يرجى كتابة اسم العميل بالكامل', 'error');
      return;
    }

    if (!validateEgyptianPhone(whatsappNumber)) {
      showToast('رقم واتساب غير صحيح', 'يرجى كتابة رقم واتساب مصري صحيح (11 رقم يبدأ بـ 01)', 'error');
      return;
    }

    if (!preferredVisitTime) {
      showToast('ميعاد الزيارة مطلوب', 'يرجى تحديد ميعاد زيارة المعرض المفضل لمعاينة الجهاز', 'error');
      return;
    }

    const item = cart[0];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    try {
      const res = createReservation({
        productId: item.id,
        productTitle: item.title,
        productImage: item.images?.[0] || '',
        productPrice: item.price,
        customerName: customerName.trim(),
        customerPhone: whatsappNumber.trim(),
        customerEmail: customerEmail.trim() || undefined,
        preferredVisitTime,
        notes: notes.trim() || undefined,
        expiresAt,
        durationHours: 24,
      });

      setReservationDetails(res);
      setReservationCreated(true);
      clearCart();
      showToast('تم حجز الجهاز بنجاح', 'تم حجب الجهاز من العرض لمدة 24 ساعة لحين زيارتك بالمعرض', 'success');
    } catch (err: any) {
      showToast('خطأ أثناء الحجز', err.message || 'تعذر استكمال طلب الحجز', 'error');
    }
  };

  const handleWhatsAppClick = () => {
    if (!reservationDetails) return;
    const msg = `السلام عليكم، أود تأكيد حجز الجهاز مرجع رقم: (${reservationDetails.reservationNumber})\nالاسم: ${customerName}\nميعاد الزيارة: ${preferredVisitTime}\nشكراً لكم.`;
    WhatsAppMessageBuilder.openWhatsApp(settings.whatsappPhone, msg);
  };

  if (reservationCreated && reservationDetails) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-8 glass-panel rounded-3xl flex flex-col items-center text-center gap-6 dir-rtl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1 rounded-full font-mono">
            رقم مرجع الحجز: {reservationDetails.reservationNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-4">
            تم تسجيل حجز جهازك بنجاح!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-lg mx-auto">
            تم حجب الجهاز من العرض العام لمدة 24 ساعة. يسعدنا استقبالك بالمعرض لمعاينة وتجربة الجهاز بالكهرباء قبل إتمام الشراء.
          </p>
        </div>

        {/* 24-hour countdown box */}
        <div className="w-full p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>العداد التنازلي لمهلة الحجز المجاني (24 ساعة)</span>
          </div>
          <div className="text-3xl font-black font-mono tracking-widest text-emerald-400">
            {countdownText}
          </div>
        </div>

        {/* Reservation summary */}
        <div className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-right space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500">اسم العميل:</span>
            <span className="font-bold">{customerName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500">رقم الواتساب:</span>
            <span className="font-bold dir-ltr">{whatsappNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="text-slate-500">ميعاد الزيارة المحدد:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {preferredVisitTime ? new Date(preferredVisitTime).toLocaleString('ar-EG') : '-'}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">موقع المعاينة:</span>
            <span className="font-bold text-slate-900 dark:text-white">معرض المعادي - شارع 68</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Button
            variant="outline"
            className="w-full py-3 text-xs font-bold"
            onClick={() => window.open(settings.address.googleMapsUrl, '_blank')}
            leftIcon={<MapPin className="w-4 h-4 text-blue-500" />}
          >
            الذهاب إلى المعرض
          </Button>

          <Button
            variant="electric"
            className="w-full py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-none"
            onClick={handleWhatsAppClick}
            leftIcon={<MessageCircle className="w-4 h-4 text-white" />}
          >
            تأكيد عبر واتساب الرئيسي
          </Button>
        </div>

        {settings.secondaryPhone && (
          <div className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-amber-400 font-bold block">الخط الثاني للتواصل:</span>
              <span dir="ltr" className="font-mono font-bold text-white inline-block" style={{ unicodeBidi: 'isolate' }}>
                {formatPhoneForDisplay(settings.secondaryPhone)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${settings.secondaryPhone}`}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال
              </a>
              <a
                href={`https://wa.me/${normalizeEgyptianPhone(settings.secondaryWhatsappPhone || settings.secondaryPhone)}?text=${encodeURIComponent(`السلام عليكم، أود تأكيد حجز مرجع: ${reservationDetails.reservationNumber}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                واتساب
              </a>
            </div>
          </div>
        )}

        <Button variant="outline" className="text-xs" onClick={() => navigateTo('products')}>
          تصفح باقي أجهزة المعرض
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 flex flex-col gap-8 dir-rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-500" />
            نموذج حجز الجهاز المعتمد
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            حجز مجاني بالكامل لمدة 24 ساعة بدون أي مبالغ مالية أو دفع أونلاين
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigateTo('products')}>
          <ArrowRight className="w-4 h-4 ml-1" />
          رجوع للأجهزة
        </Button>
      </div>

      {cart.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl flex flex-col items-center gap-4 my-6">
          <Sparkles className="w-12 h-12 text-slate-400" />
          <h3 className="text-lg font-bold">لا يوجد جهاز محدد للحجز حالياً</h3>
          <p className="text-xs text-slate-500 max-w-md">
            قم باختيار الجهاز الذي تود حذفه من العرض العام وحجبه لمدة 24 ساعة لمعاينته بنفسك بالمعرض.
          </p>
          <Button variant="electric" onClick={() => navigateTo('products')}>
            تصفح أجهزة المعرض
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selected Item Card */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              الجهاز المحدد للحجز (1)
            </h3>

            {cart.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardBody className="p-4 space-y-4">
                  <ProductImage
                    src={item.images?.[0] || ''}
                    alt={item.title}
                    containerClassName="w-full h-48 rounded-xl overflow-hidden"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">{item.brand}</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {item.title}
                    </h4>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-2 block font-mono">
                      {item.price.toLocaleString()} {settings.currencySymbol}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-full py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-rose-200/50 dark:border-rose-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    إلغاء التحديد
                  </button>
                </CardBody>
              </Card>
            ))}

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>سياسة الحجز المعتمدة:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                يتم حجب الجهاز فور إرسال الطلب لمدة 24 ساعة. لا يلزم سداد أي مبالغ أونلاين.
              </p>
            </div>
          </div>

          {/* Form */}
          <Card className="lg:col-span-2 h-fit">
            <CardHeader>
              <h3 className="font-bold text-base">بيانات نموذج الحجز (24 ساعة)</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleConfirmReservation} className="flex flex-col gap-4">
                <Input
                  label="الاسم بالكامل *"
                  placeholder="مثال: أحمد محمود علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="رقم الواتساب / الهاتف *"
                  placeholder="010xxxxxxx"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                />

                <Input
                  label="البريد الإلكتروني (اختياري)"
                  type="email"
                  placeholder="example@domain.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <Input
                  label="تاريخ ووقت الزيارة المفضل بمعرض المعادي *"
                  type="datetime-local"
                  value={preferredVisitTime}
                  onChange={(e) => setPreferredVisitTime(e.target.value)}
                  required
                />

                <Textarea
                  label="ملاحظات أو طلبات خاصة لمعاينة الجهاز (اختياري)"
                  placeholder="مثل تجربة الموتور بالكهرباء أو الاستفسار عن كارت الضمان..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button type="submit" variant="electric" size="lg" className="w-full mt-2">
                  تأكيد الحجز وحجب الجهاز لمدة 24 ساعة
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};
