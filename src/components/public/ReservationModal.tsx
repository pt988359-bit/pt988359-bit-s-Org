import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { ProductImage } from '../ui/ProductImage';
import { validateEgyptianPhone } from '../../utils/phoneUtils';
import { WhatsAppMessageBuilder } from '../../core/services/WhatsAppMessageBuilder';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

interface ReservationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { createReservation, settings } = useShowroom();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredVisitTime, setPreferredVisitTime] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [countdownText, setCountdownText] = useState('23:59:59');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setReservationDetails(null);
      setCustomerName('');
      setPhoneNumber('');
      setWhatsappNumber('');
      setCustomerEmail('');
      setPreferredVisitTime('');
      setNotes('');
    }
  }, [isOpen, product]);

  // 24h Countdown Timer Effect for Confirmation Screen
  useEffect(() => {
    if (!isSubmitted || !reservationDetails?.expiresAt) return;

    const interval = setInterval(() => {
      const expires = new Date(reservationDetails.expiresAt).getTime();
      const now = Date.now();
      const diff = expires - now;

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
  }, [isSubmitted, reservationDetails]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('بيانات ناقصة', 'يرجى كتابة الاسم بالكامل', 'error');
      return;
    }

    const effectivePhone = phoneNumber.trim() || whatsappNumber.trim();
    const effectiveWhatsapp = whatsappNumber.trim() || phoneNumber.trim();

    if (!validateEgyptianPhone(effectivePhone)) {
      showToast('رقم هاتف غير صحيح', 'يرجى كتابة رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)', 'error');
      return;
    }

    if (!preferredVisitTime) {
      showToast('ميعاد الزيارة مطلوب', 'يرجى تحديد ميعاد زيارة المعرض المفضل لمعاينة الجهاز', 'error');
      return;
    }

    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = createReservation({
        productId: product.id,
        productTitle: product.title,
        productImage: product.images?.[0] || '',
        productPrice: product.price,
        customerName: customerName.trim(),
        customerPhone: effectivePhone,
        phone: effectivePhone,
        whatsapp: effectiveWhatsapp,
        email: customerEmail.trim() || undefined,
        preferredVisitTime,
        notes: notes.trim() || undefined,
        expiresAt,
        durationHours: 24,
      });

      setReservationDetails(res);
      setIsSubmitted(true);
      showToast('تم حجز الجهاز بنجاح', 'تم حجب الجهاز من العرض لمدة 24 ساعة لحين زيارتك بالمعرض', 'success');
    } catch (err: any) {
      showToast('خطأ أثناء الحجز', err.message || 'تعذر استكمال طلب الحجز', 'error');
    }
  };

  const handleWhatsAppClick = () => {
    if (!reservationDetails) return;
    const msg = `السلام عليكم، أرغب في تأكيد حجز الجهاز برقم المرجع: (${reservationDetails.reservationNumber})\nالجهاز: ${product.title}\nالاسم: ${customerName}\nميعاد الزيارة المفضل: ${preferredVisitTime}\nشكراً لكم.`;
    WhatsAppMessageBuilder.openWhatsApp(settings.whatsappPhone, msg);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                حجز الجهاز لمعاينة المعرض
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">حجز مجاني لمدة 24 ساعة بدون أي دفع إلكتروني</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Product Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
              <ProductImage
                src={product.images?.[0] || ''}
                alt={product.title}
                containerClassName="w-16 h-16 rounded-xl overflow-hidden shrink-0"
              />
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">{product.brand}</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.title}</h4>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {product.price.toLocaleString()} {settings.currencySymbol}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <Input
              label="الاسم بالكامل *"
              placeholder="مثال: أحمد محمود علي"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="رقم الهاتف *"
                placeholder="010xxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />

              <Input
                label="رقم الواتساب *"
                placeholder="010xxxxxxx"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
              />
            </div>

            <Input
              label="البريد الإلكتروني (اختياري)"
              type="email"
              placeholder="example@domain.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />

            <Input
              label="تاريخ ووقت الزيارة المفضل بالمعرض *"
              type="datetime-local"
              value={preferredVisitTime}
              onChange={(e) => setPreferredVisitTime(e.target.value)}
              required
            />

            <Textarea
              label="ملاحظات (اختياري)"
              placeholder="مثال: يرغب في تجربة الجهاز بالكهرباء أو الاستفسار عن كارت الضمان..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />

            {/* Policy Info */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                عند إرسال الطلب، سيتم حجب الجهاز فوراً من العرض العام لمدة 24 ساعة وتجهيزه لمعاينتك في معرض المعادي (شارع 68). لا يلزم دفع أي مبلغ إلكتروني.
              </span>
            </div>

            <Button type="submit" variant="electric" size="lg" className="w-full mt-2">
              حجز الجهاز وحجبه لمدة 24 ساعة
            </Button>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                رقم مرجع الحجز الخاص بك:
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono bg-amber-500/10 px-5 py-1.5 rounded-full border border-amber-500/20 inline-block">
                {reservationDetails?.reservationNumber || 'RES-2026-XXXX'}
              </span>
            </div>

            {/* Countdown widget */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>العداد التنازلي لانتهاء الحجز المجاني (24 ساعة)</span>
              </div>
              <div className="text-3xl font-black font-mono tracking-widest text-emerald-400">
                {countdownText}
              </div>
            </div>

            {/* Summary Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right space-y-2 text-xs">
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

            {/* Final Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full text-xs font-bold py-3"
                onClick={() => window.open(settings.address.googleMapsUrl, '_blank')}
                leftIcon={<MapPin className="w-4 h-4 text-blue-500" />}
              >
                الذهاب للمعرض
              </Button>

              <Button
                variant="electric"
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-none py-3"
                onClick={handleWhatsAppClick}
                leftIcon={<MessageCircle className="w-4 h-4 text-white" />}
              >
                تأكيد عبر واتساب
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
