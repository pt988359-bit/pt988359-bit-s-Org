import React, { useState } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { Input, Select, Textarea } from './ui/Input';
import {
  X,
  RefreshCw,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Video,
  DollarSign,
  User,
  Phone,
  MessageCircle,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  Tag,
  ArrowLeftRight,
} from 'lucide-react';
import { Product, TradeRequest } from '../types';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../constants/placeholders';

interface ProductExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: Product;
}

export const ProductExchangeModal: React.FC<ProductExchangeModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
}) => {
  const { submitTradeRequest, settings } = useShowroom();
  const { showToast } = useToast();

  const [submittedRequest, setSubmittedRequest] = useState<TradeRequest | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Form Fields for Customer's Device
  const [currentCategory, setCurrentCategory] = useState<string>('غسالة ملابس');
  const [currentBrand, setCurrentBrand] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('');
  const [currentCondition, setCurrentCondition] = useState<string>('مستعمل بحالة جيدة');
  const [workingStatus, setWorkingStatus] = useState<string>('يعمل بكفاءة كاملة');
  const [description, setDescription] = useState<string>('');

  // Media
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Valuation
  const [expectedValue, setExpectedValue] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(true);

  // Customer Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [sameAsPhone, setSameAsPhone] = useState<boolean>(true);
  const [area, setArea] = useState<string>('المعادي');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setPhotoUrls((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    showToast('تم إضافة الصورة', 'تم أرشفة الصورة المرفقة بالطلب', 'info');
  };

  const handleRemoveImage = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBrand.trim()) {
      showToast('حقل مطلوب', 'يرجى إدخال ماركة جهازك المستعمل الحالية', 'error');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('بيانات التواصل', 'يرجى إدخال اسمك ورقم الهاتف للتواصل', 'error');
      return;
    }

    const finalWhatsapp = sameAsPhone ? customerPhone : whatsappPhone || customerPhone;

    const created = submitTradeRequest({
      desiredProductId: targetProduct.id,
      desiredProductTitle: targetProduct.title,
      desiredProductPrice: targetProduct.price,
      desiredProductImage: targetProduct.images?.[0] || '',
      currentApplianceType: currentCategory,
      currentBrand,
      currentModel,
      currentCondition,
      workingStatus,
      description,
      currentConditionNotes: description,
      photoUrls,
      videoUrl,
      estimatedTradeValue: parseFloat(expectedValue) || 0,
      isNegotiable,
      customerName,
      customerPhone,
      whatsappPhone: finalWhatsapp,
      area,
      notes,
      status: 'new',
    });

    setSubmittedRequest(created);
    showToast('تم إرسال طلب الاستبدال', `رقم الطلب: ${created.requestNumber}`, 'success');
  };

  const handleCopyNumber = () => {
    if (submittedRequest?.requestNumber) {
      navigator.clipboard.writeText(submittedRequest.requestNumber);
      setCopied(true);
      showToast('تم النسخ', 'تم نسخ رقم الطلب بنجاح', 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">طلب استبدال جهازك القديم</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                احصل على خصم مباشر واستبدل جهازك القديم بـ PRO TECK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Target Product Info Banner (Auto-Attached) */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={targetProduct.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER}
                alt={targetProduct.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                }}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="text-right">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  الجهاز المستهدف للشراء من المعرض:
                </span>
                <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                  {targetProduct.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">سعر المعرض:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {targetProduct.price.toLocaleString()} {settings.currencySymbol}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 shrink-0 text-center">
              كود الجهاز: {targetProduct.id}
            </div>
          </div>

          {/* Submission Result */}
          {submittedRequest ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">تم استلام طلب الاستبدال بنجاح</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  سيقوم مسؤولو التقييم في معرض PRO TECK بدراسة بيانات جهازك وتحديد الفارق التقديري للتسليم.
                </p>
              </div>

              {/* Request Number Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 max-w-md mx-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">رقم طلب الاستبدال:</span>
                  <span className="text-lg font-black text-blue-400 font-mono tracking-wider">
                    {submittedRequest.requestNumber}
                  </span>
                </div>
                <button
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-right leading-relaxed max-w-md mx-auto">
                <span className="font-bold block mb-1">ملاحظة الهيكل البرمجي:</span>
                تخضع كافة طلبات الاستبدال للمراجعة والفحص الفني البشري المباشر ولا يتم قبول أي جهاز أوتوماتيكياً.
              </div>

              <Button variant="electric" onClick={onClose} className="w-full max-w-md mx-auto">
                إغلاق النافذة والعودة للجهاز
              </Button>
            </div>
          ) : (
            /* Exchange Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  أدخل بيانات جهازك القديم المراد استبداله:
                </h3>
              </div>

              {/* Device Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="قسم جهازك الحالي *"
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  options={[
                    { value: 'ثلاجة وديب فريزر', label: 'ثلاجة وديب فريزر' },
                    { value: 'غسالة ملابس', label: 'غسالة ملابس' },
                    { value: 'غسالة أطباق', label: 'غسالة أطباق' },
                    { value: 'بوتاجاز أو فرن', label: 'بوتاجاز أو فرن' },
                    { value: 'تكييف', label: 'تكييف هواء' },
                    { value: 'شاشة سمارت', label: 'شاشة سمارت' },
                    { value: 'أجهزة أخرى', label: 'أجهزة منزلية أخرى' },
                  ]}
                />

                <Input
                  label="ماركة جهازك المستعمل (Brand) *"
                  placeholder="مثال: LG, Sharp, Kiriazi..."
                  value={currentBrand}
                  onChange={(e) => setCurrentBrand(e.target.value)}
                  required
                />
              </div>

              {/* Model & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="الموديل (إن وجد)"
                  placeholder="مثال: PT-500"
                  value={currentModel}
                  onChange={(e) => setCurrentModel(e.target.value)}
                />

                <Select
                  label="حالة الجهاز *"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  options={[
                    { value: 'جديد بالكرتونة', label: 'جديد بالكرتونة' },
                    { value: 'كالجديد', label: 'كالجديد (ممتاز)' },
                    { value: 'مستعمل بحالة جيدة', label: 'مستعمل بحالة جيدة' },
                    { value: 'مستعمل بحالة متوسطة', label: 'مستعمل بحالة متوسطة' },
                    { value: 'يحتاج صيانة', label: 'يحتاج صيانة' },
                  ]}
                />

                <Select
                  label="الحالة التشغيلية *"
                  value={workingStatus}
                  onChange={(e) => setWorkingStatus(e.target.value)}
                  options={[
                    { value: 'يعمل بكفاءة كاملة', label: 'يعمل بكفاءة كاملة' },
                    { value: 'يعمل مع ملاحظات', label: 'يعمل مع وجود ملاحظات' },
                    { value: 'يحتاج صيانة', label: 'يحتاج صيانة' },
                    { value: 'عاطل', label: 'عاطل عن العمل' },
                  ]}
                />
              </div>

              <Textarea
                label="وصف الجهاز وملاحظات الفحص"
                placeholder="اذكر حالة الجهاز، أسباب الاستبدال، وسجل الصيانة المتاحة..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              {/* Media Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  صور جهازك المستعمل (إجباري صورة على الأقل):
                </span>
                <div className="flex gap-2">
                  <Input
                    placeholder="رابط الصورة المرفقة..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="electric" onClick={handleAddImage} leftIcon={<Upload className="w-4 h-4" />}>
                    إضافة
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img src={url} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 rounded-full text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <Input
                  label="رابط فيديو قصير للجهاز (اختياري)"
                  placeholder="رابط فيديو يوضح عمل الجهاز..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              {/* Expected Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="القيمة التقديرية لجهازك المستعمل (ج.م) *"
                  placeholder="مثال: 6500"
                  type="number"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-300">هل القيمة قابلة للتفاوض؟</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNegotiable(true)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                        isNegotiable
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      قابل للتفاوض
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNegotiable(false)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                        !isNegotiable
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      قيمة ثابته
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  بيانات صاحب الجهاز للتواصل والمعاينة:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="الاسم بالكامل *"
                    placeholder="مثال: محمد السيد"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />

                  <Input
                    label="رقم الهاتف *"
                    placeholder="010xxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>رقم الواتساب هو نفس رقم الهاتف المكتوب أعلاه</span>
                  </label>
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                </div>

                {!sameAsPhone && (
                  <Input
                    label="رقم الواتساب *"
                    placeholder="011xxxxxxx"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    required
                  />
                )}

                <Select
                  label="المنطقة *"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  options={[
                    { value: 'المعادي', label: 'المعادي' },
                    { value: 'حدائق المعادي', label: 'حدائق المعادي' },
                    { value: 'القاهرة الجديدة', label: 'القاهرة الجديدة' },
                    { value: 'مدينة نصر', label: 'مدينة نصر' },
                    { value: 'مناطق أخرى', label: 'مناطق أخرى بالقاهرة' },
                  ]}
                />

                <Textarea
                  label="عنوان المعاينة وملاحظات إضافية"
                  placeholder="الشارع، رقم العمارة، الشقة، وأنسب أوقات الزيارة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Action Trigger */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="electric"
                  size="lg"
                  className="w-full sm:flex-1"
                  leftIcon={<RefreshCw className="w-5 h-5 text-emerald-300" />}
                >
                  تأكيد وإرسال طلب الاستبدال
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
