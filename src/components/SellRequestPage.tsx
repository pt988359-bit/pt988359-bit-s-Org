import React, { useState } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { Card, CardBody } from './ui/Card';
import { Input, Select, Textarea } from './ui/Input';
import {
  PlusCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Video,
  DollarSign,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  Copy,
  Check,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import { SellRequest } from '../types';
import { formatPhoneForDisplay, normalizeEgyptianPhone } from '../utils/phoneUtils';
import { WhatsAppMessageBuilder } from '../core/services/WhatsAppMessageBuilder';

export const SellRequestPage: React.FC = () => {
  const { submitSellRequest, navigateTo, settings } = useShowroom();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedRequest, setSubmittedRequest] = useState<SellRequest | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Step 1: Device Information
  const [category, setCategory] = useState<string>('ثلاجة وديب فريزر');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [condition, setCondition] = useState<string>('كالجديد');
  const [workingStatus, setWorkingStatus] = useState<string>('يعمل بكفاءة كاملة');
  const [previousRepairs, setPreviousRepairs] = useState<string>('لا يوجد إصلاحات سابقة');
  const [description, setDescription] = useState<string>('');

  // Step 2: Device Details
  const [capacitySize, setCapacitySize] = useState<string>('');
  const [specifications, setSpecifications] = useState<string>('');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState<string>('جميع الملحقات والرفوف الأصلية متوفرة');
  const [missingParts, setMissingParts] = useState<string>('لا يوجد قطع مفقودة');
  const [problemsOrDefects, setProblemsOrDefects] = useState<string>('لا يوجد عيوب تشغيلية');

  // Step 3: Media
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Step 4: Expected Price
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Step 5: Customer Information
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [area, setArea] = useState<string>('المعادي');
  const [address, setAddress] = useState<string>('');
  const [preferredContactTime, setPreferredContactTime] = useState<string>('مساءً (5 م - 10 م)');

  // Dynamic capacity label helper
  const getCapacityLabel = () => {
    switch (category) {
      case 'ثلاجة وديب فريزر':
        return 'السعة (بالقدم أو اللتر) *';
      case 'غسالة ملابس':
      case 'غسالة أطباق':
        return 'الحمولة / السعة (بالكيلو جرام) *';
      case 'تكييف':
        return 'القدرة (بالحصان أو BTU) *';
      case 'شاشة سمارت':
        return 'حجم الشاشة (بالبوصة) *';
      case 'بوتاجاز أو فرن':
        return 'عدد الشعلات والمقاس *';
      default:
        return 'السعة أو الحجم الأبعاد *';
    }
  };

  const getCapacityPlaceholder = () => {
    switch (category) {
      case 'ثلاجة وديب فريزر':
        return 'مثال: 18 قدم نوفروست / 450 لتر';
      case 'غسالة ملابس':
      case 'غسالة أطباق':
        return 'مثال: 9 كيلو تحميل أمامي';
      case 'تكييف':
        return 'مثال: 1.5 حصان بارد/ساخن انفرتر';
      case 'شاشة سمارت':
        return 'مثال: 55 بوصة 4K Smart';
      case 'بوتاجاز أو فرن':
        return 'مثال: 5 شعلة مقاس 60×90 ستانلس';
      default:
        return 'مثال: الأبعاد والقياسات الأساسية';
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setPhotoUrls((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    showToast('تم إضافة الصورة', 'تم إضافة رابط الصورة لمعاينة الطلب', 'info');
  };

  const handleRemoveImage = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!brand.trim()) {
        showToast('حقل مطلوب', 'يرجى إدخال الماركة التجارية للجهاز', 'error');
        return false;
      }
      if (!deviceName.trim()) {
        showToast('حقل مطلوب', 'يرجى كتابة اسم الجهاز الوصفي', 'error');
        return false;
      }
    } else if (step === 2) {
      if (!capacitySize.trim()) {
        showToast('حقل مطلوب', 'يرجى تحديد السعة أو الحجم الخاص بالجهاز', 'error');
        return false;
      }
    } else if (step === 3) {
      if (photoUrls.length === 0) {
        showToast('تنبيه الميديا', 'يرجى إضافة صورة واحدة على الأقل للجهاز لإتاحة الفحص المبدئي', 'warning');
        return false;
      }
    } else if (step === 4) {
      if (!askingPrice || parseFloat(askingPrice) <= 0) {
        showToast('حقل مطلوب', 'يرجى إدخال السعر المطلوب بالجنية المصري', 'error');
        return false;
      }
    } else if (step === 5) {
      if (!customerName.trim()) {
        showToast('حقل مطلوب', 'يرجى إدخال اسمك بالكامل', 'error');
        return false;
      }
      if (!customerPhone.trim() || customerPhone.length < 8) {
        showToast('حقل مطلوب', 'يرجى إدخال رقم هاتف صحيح للتواصل', 'error');
        return false;
      }
      if (!address.trim()) {
        showToast('حقل مطلوب', 'يرجى إدخال عنوان المعاينة بالكامل', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    const finalWhatsapp = sameAsPhone ? customerPhone : whatsappPhone || customerPhone;

    const created = submitSellRequest({
      applianceType: category,
      brand,
      model,
      deviceName,
      year,
      condition,
      workingStatus,
      previousRepairs,
      description,
      capacitySize,
      specifications,
      accessoriesIncluded,
      missingParts,
      problemsOrDefects,
      photoUrls,
      videoUrl,
      askingPrice: parseFloat(askingPrice) || 0,
      isNegotiable,
      notes,
      customerName,
      customerPhone,
      whatsappPhone: finalWhatsapp,
      customerEmail,
      area,
      address,
      preferredContactTime,
      location: `${area} - ${address}`,
      status: 'new',
    });

    try {
      const msg = WhatsAppMessageBuilder.buildSellDeviceMessage(
        {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        {
          deviceType: category,
          brand,
          model,
          condition,
          description: description || deviceName,
          expectedPrice: parseFloat(askingPrice) || 0,
          requestNumber: created.requestNumber,
        }
      );
      WhatsAppMessageBuilder.openWhatsApp(settings.whatsappPhone, msg);
    } catch (err) {
      console.error('Failed to open WhatsApp for sell request:', err);
    }

    setSubmittedRequest(created);
    showToast('تم استلام الطلب بنجاح', `رقم الطلب الخاص بك: ${created.requestNumber}`, 'success');
  };

  const handleCopyRequestNumber = () => {
    if (submittedRequest?.requestNumber) {
      navigator.clipboard.writeText(submittedRequest.requestNumber);
      setCopied(true);
      showToast('تم النسخ', 'تم نسخ رقم الطلب إلى الحافظة', 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // If submitted, show the professional success screen
  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto my-8 pb-12">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-emerald-500/30 bg-slate-900/90 text-white flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              تم تسجيل الطلب بنجاح
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              تم استلام طلب بيع جهازك لـ PRO TECK
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed mt-2">
              سيقوم فريق الفحص والتقييم الفني في معرض PRO TECK بمراجعة بيانات جهازك والتواصل معك عبر الهاتف والواتساب في أسرع وقت.
            </p>
          </div>

          {/* Request Number Box */}
          <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-bold">رقم الطلب المرجعي:</span>
              <span className="text-xl font-black text-blue-400 font-mono tracking-wider">
                {submittedRequest.requestNumber}
              </span>
            </div>
            <button
              onClick={handleCopyRequestNumber}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ رقم الطلب'}</span>
            </button>
          </div>

          {/* Summary Card */}
          <div className="w-full text-right p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-700/50 pb-2">
              ملخص تفاصيل الطلب المقدم:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">اسم الجهاز: </span>
                <span className="font-bold text-white">{submittedRequest.deviceName || submittedRequest.brand}</span>
              </div>
              <div>
                <span className="text-slate-400">القسم: </span>
                <span className="font-bold text-white">{submittedRequest.applianceType}</span>
              </div>
              <div>
                <span className="text-slate-400">الحالة التشغيلية: </span>
                <span className="font-bold text-amber-300">{submittedRequest.workingStatus}</span>
              </div>
              <div>
                <span className="text-slate-400">السعر المطلوب: </span>
                <span className="font-bold text-emerald-400">
                  {submittedRequest.askingPrice?.toLocaleString()} ج.م ({submittedRequest.isNegotiable ? 'قابل للتفاوض' : 'نهائي'})
                </span>
              </div>
              <div>
                <span className="text-slate-400">اسم العميل: </span>
                <span className="font-bold text-white">{submittedRequest.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400">رقم التواصل: </span>
                <span className="font-bold text-white">
                  <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>
                    {submittedRequest.customerPhone}
                  </span>
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">منطقة المعاينة: </span>
                <span className="font-bold text-white">{submittedRequest.location}</span>
              </div>
            </div>
          </div>

          {/* Business Rule Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-right text-[11px] leading-relaxed flex items-start gap-3 w-full">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">تنبيه سياسة المعاينة:</span>
              تخضع جميع الأجهزة للفحص الميداني واختبار الأداء المباشر من قِبل فني المعرض قبل اعتماد الشراء النهائي والدفع الكاش الفوري عند الاستلام.
            </div>
          </div>

          {/* Direct Contact Buttons */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 w-full space-y-3">
            <span className="text-xs font-bold text-slate-300 block text-right">
              للاستفسار السريع ومتابعة التقييم المباشر:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="text-right">
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

              {settings.secondaryPhone && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="text-right">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <Button
              variant="electric"
              size="lg"
              className="w-full sm:flex-1"
              onClick={() => navigateTo('home')}
            >
              العودة إلى الصفحة الرئيسية
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                setSubmittedRequest(null);
                setCurrentStep(1);
              }}
            >
              تقديم طلب بيع جهاز آخر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                خدمات العُملاء المباشرة
              </span>
              <span className="text-xs text-slate-400">• الشراء الفوري الكاش</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <PlusCircle className="w-8 h-8 text-emerald-500" />
              بيع جهازك لـ PRO TECK
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              قدم بيانات جهازك المنزلي المستعمل أو الجديد للحصول على تقييم عادل من خبراء المعرض مع إمكانية المعاينة والدفع الكاش المباشر.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-left border-r border-slate-800 pr-6 pl-2 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-white text-sm">PRO TECK Maadi</span>
            <span>استلام من باب المنزل</span>
            <span className="text-emerald-400 font-bold">دفع كاش فوري</span>
          </div>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
          <span>الخطوة {currentStep} من 5</span>
          <span className="text-blue-600 dark:text-blue-400">
            {currentStep === 1 && 'بيانات الجهاز الأساسية'}
            {currentStep === 2 && 'المواصفات الفنية والحالة'}
            {currentStep === 3 && 'الصور والميديا'}
            {currentStep === 4 && 'السعر المطلوب والتفاوض'}
            {currentStep === 5 && 'بيانات المشتري والعنوان'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-blue-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step Icons Row */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { step: 1, label: 'الجهاز' },
            { step: 2, label: 'التفاصيل' },
            { step: 3, label: 'الميديا' },
            { step: 4, label: 'السعر' },
            { step: 5, label: 'التواصل' },
          ].map((item) => {
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : isDone
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span className="hidden sm:inline text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Form */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
        <CardBody className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* STEP 1: Device Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    الخطوة 1: معلومات الجهاز الأساسية
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    حدد نوع وماركة وموديل الجهاز المراد عرضه للبيع لـ PRO TECK.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="قسم أو نوع الجهاز *"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: 'ثلاجة وديب فريزر', label: 'ثلاجة وديب فريزر' },
                      { value: 'غسالة ملابس', label: 'غسالة ملابس' },
                      { value: 'غسالة أطباق', label: 'غسالة أطباق' },
                      { value: 'بوتاجاز أو فرن', label: 'بوتاجاز أو فرن' },
                      { value: 'تكييف', label: 'تكييف هواء' },
                      { value: 'شاشة سمارت', label: 'شاشة سمارت' },
                      { value: 'أجهزة منزلية أخرى', label: 'أجهزة منزلية أخرى' },
                    ]}
                  />

                  <Input
                    label="الماركة التجارية (Brand) *"
                    placeholder="مثال: LG, Samsung, Sharp, Kiriazi, Beko"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="اسم الجهاز الوصفي *"
                    placeholder="مثال: ثلاجة ال جي 18 قدم نوفروست ديجيتال"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    required
                  />

                  <Input
                    label="الموديل (Model Number)"
                    placeholder="مثال: GN-B562SQCL (إن وجد)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="سنة الشراء أو الصنع (اختياري)"
                    placeholder="مثال: 2022"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />

                  <Select
                    label="حالة الجهاز العامة *"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    options={[
                      { value: 'جديد بالكرتونة', label: 'جديد بالكرتونة والضمان' },
                      { value: 'كالجديد', label: 'كالجديد (استعمال خفيف جداً)' },
                      { value: 'مستعمل بحالة جيدة', label: 'مستعمل بحالة جيدة جداً' },
                      { value: 'مستعمل بحالة متوسطة', label: 'مستعمل بحالة متوسطة' },
                      { value: 'يحتاج صيانة', label: 'يحتاج صيانة بسيطة' },
                    ]}
                  />

                  <Select
                    label="الحالة التشغيلية *"
                    value={workingStatus}
                    onChange={(e) => setWorkingStatus(e.target.value)}
                    options={[
                      { value: 'يعمل بكفاءة كاملة', label: 'يعمل بكفاءة 100% ممتاز' },
                      { value: 'يعمل مع ملاحظات خفيفة', label: 'يعمل مع وجود ملاحظات شكلية' },
                      { value: 'يعمل جزئياً', label: 'يعمل جزئياً (يحتاج صيانة)' },
                      { value: 'عاطل عن العمل', label: 'لا يعمل / قطع غيار' },
                    ]}
                  />
                </div>

                <Input
                  label="سجل الإصلاحات والصيانة السابقة"
                  placeholder="مثال: تم تغيير ترموستات أصلي في التوكيل / لم يتم فتح الجهاز سابقاً"
                  value={previousRepairs}
                  onChange={(e) => setPreviousRepairs(e.target.value)}
                />

                <Textarea
                  label="وصف إضافي للجهاز"
                  placeholder="اكتب أي معلومات إضافية تخص حالة الأجهزة أو فترة الاستخدام..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* STEP 2: Device Details */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    الخطوة 2: المواصفات والتفاصيل الدقيقة
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    تساعد هذه البيانات خبير التقييم في تحديد السعر المبدئي بدقة.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={getCapacityLabel()}
                    placeholder={getCapacityPlaceholder()}
                    value={capacitySize}
                    onChange={(e) => setCapacitySize(e.target.value)}
                    required
                  />

                  <Input
                    label="المواصفات الفنية المتميزة"
                    placeholder="مثال: محرك انفرتر، لون استانلس، شاشة ديجيتال، خاصية بخار..."
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="الملحقات والقطع المرفقة"
                    placeholder="مثال: الرفوف الأصلية، الأقواس، الريموت، الكتالوج، الفاتورة..."
                    value={accessoriesIncluded}
                    onChange={(e) => setAccessoriesIncluded(e.target.value)}
                  />

                  <Input
                    label="أجزاء أو قطع مفقودة (إن وجد)"
                    placeholder="مثال: درج الخضار مكسور، غطاء مقبض غير متوفر..."
                    value={missingParts}
                    onChange={(e) => setMissingParts(e.target.value)}
                  />
                </div>

                <Textarea
                  label="عيوب أو مشاكل ظاهرة في الجهاز *"
                  placeholder="يرجى ذكر أي خدوش أو صدمات خارجية أو ملاحظات صوتية بكل أمانة لسهولة الفحص..."
                  value={problemsOrDefects}
                  onChange={(e) => setProblemsOrDefects(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* STEP 3: Media */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    الخطوة 3: الصور والفيديو المعاين للجهاز
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    إضافة صور واضحة من زوايا متعددة يزيد من سرعة وقبول الطلب لدى الفنيين.
                  </p>
                </div>

                {/* Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    إضافة رابط صورة جديدة للجهاز:
                  </span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ضع رابط الصورة هنا (URL)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="electric" onClick={handleAddImage} leftIcon={<Upload className="w-4 h-4" />}>
                      إضافة
                    </Button>
                  </div>
                </div>

                {/* Video URL Input */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-500" />
                    رابط فيديو قصير للجهاز وهو يعمل (اختياري):
                  </span>
                  <Input
                    placeholder="رابط يوتيوب أو درايف أو فيديو الواتساب..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                {/* Image Preview Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      الصور المرفقة بالطلب ({photoUrls.length}):
                    </span>
                  </div>

                  {photoUrls.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                      لم يتم إضافة صور بعد. يرجى إضافة صورة واحدة على الأقل.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {photoUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-32 bg-slate-900 shadow-md"
                        >
                          <img src={url} alt={`صورة الجهاز ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            title="حذف الصورة"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                            صورة {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Expected Price */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    الخطوة 4: السعر المطلوب وشروط البيع
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    حدد قيمتك التقديرية المرجوة للجهاز بالجنية المصري.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="السعر المطلوب كاش (بالجنية المصري ج.م) *"
                    placeholder="مثال: 9500"
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      هل السعر قابل للتفاوض البسيط؟ *
                    </span>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsNegotiable(true)}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isNegotiable
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        نعم، قابل للتفاوض
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNegotiable(false)}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          !isNegotiable
                            ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        لا، سعر نهائي غير قابل للتفاوض
                      </button>
                    </div>
                  </div>
                </div>

                <Textarea
                  label="ملاحظات إضافية بخصوص طريقة الدفع والاستلام"
                  placeholder="مثال: يفضل الفحص والاستلام في أيام عطلة نهاية الأسبوع، يوجد مصعد في العمارة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* STEP 5: Customer Information */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    الخطوة 5: بيانات المشتري وعنوان المعاينة
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    أدخل بيانات التواصل الصحيحة ليتواصل معك مسؤولي المعاينة.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="الاسم بالكامل *"
                    placeholder="مثال: أحمد محمود مصطفى"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />

                  <Input
                    label="رقم الهاتف للتواصل *"
                    placeholder="01012345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                {/* WhatsApp Same As Phone Checkbox */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>رقم الواتساب هو نفس رقم الهاتف المكتوب أعلى</span>
                  </label>
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                </div>

                {!sameAsPhone && (
                  <Input
                    label="رقم الواتساب المخصص *"
                    placeholder="011xxxxxxx"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    required
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="البريد الإلكتروني (اختياري)"
                    placeholder="example@mail.com"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />

                  <Select
                    label="المنطقة / الحي *"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    options={[
                      { value: 'المعادي', label: 'المعادي' },
                      { value: 'حدائق المعادي', label: 'حدائق المعادي' },
                      { value: 'زهراء المعادي', label: 'زهراء المعادي' },
                      { value: 'القاهرة الجديدة والتجمع', label: 'القاهرة الجديدة والتجمع' },
                      { value: 'مدينة نصر', label: 'مدينة نصر' },
                      { value: 'مصر الجديدة', label: 'مصر الجديدة' },
                      { value: 'الجيزة والهرم', label: 'الجيزة والهرم' },
                      { value: 'مناطق أخرى بالقاهرة الكبرى', label: 'مناطق أخرى بالقاهرة الكبرى' },
                    ]}
                  />
                </div>

                <Input
                  label="عنوان الشارع والعمارة بالتفصيل *"
                  placeholder="شارع 9، عمارة 14، الدور الثالث، شقة 6"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <Select
                  label="الوقت المفضل للاتصال والمناقشة *"
                  value={preferredContactTime}
                  onChange={(e) => setPreferredContactTime(e.target.value)}
                  options={[
                    { value: 'صباحاً (9 ص - 1 ظ)', label: 'صباحاً (من 9 صباحاً إلى 1 ظهراً)' },
                    { value: 'عصراً (1 ظ - 5 م)', label: 'عصراً (من 1 ظهراً إلى 5 مساءً)' },
                    { value: 'مساءً (5 م - 10 م)', label: 'مساءً (من 5 مساءً إلى 10 مساءً)' },
                  ]}
                />
              </div>
            )}

            {/* Navigation & Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-4">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  leftIcon={<ChevronRight className="w-4 h-4" />}
                >
                  الخطوة السابقة
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="electric"
                  onClick={handleNextStep}
                  rightIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  المتابعة للخطوة التالية
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="electric"
                  size="lg"
                  leftIcon={<CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                >
                  تأكيد وإرسال طلب البيع لـ PRO TECK
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
