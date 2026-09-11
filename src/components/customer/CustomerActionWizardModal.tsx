import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import { CustomerActionType, ReservationDurationOption, CustomerDocument } from '../../types/customerActions';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ReservationService } from '../../core/services/ReservationService';
import { WhatsAppMessageBuilder } from '../../core/services/WhatsAppMessageBuilder';
import { NotificationService } from '../../core/services/NotificationService';
import { defaultRequestRepository } from '../../core/repositories/RequestRepository';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { validateEgyptianPhone, formatPhoneForDisplay } from '../../utils/phoneUtils';
import {
  generateReferenceNumber,
  savePurchaseRequest,
  saveReservationRequest,
  saveNegotiationRequest,
  saveInquiryRequest,
} from '../../utils/customerStorage';

import { PrintableReceiptModal } from './PrintableReceiptModal';
import {
  X,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Tag,
  Store,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  Copy,
  Upload,
  MessageCircle,
  MapPin,
  FileText,
  AlertCircle,
  Navigation,
  Car,
  UserCheck,
} from 'lucide-react';

interface CustomerActionWizardModalProps {
  product: Product;
  actionType: CustomerActionType | null;
  onClose: () => void;
}

export const CustomerActionWizardModal: React.FC<CustomerActionWizardModalProps> = ({
  product,
  actionType,
  onClose,
}) => {
  const { settings, submitTradeRequest, updateProduct, createReservation } = useShowroom();
  const { showToast } = useToast();
  const { customer, isCustomerAuthenticated, openLoginModal } = useCustomerAuth();

  // Wizard Step State (1-based)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields State
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerWhatsapp, setCustomerWhatsapp] = useState(customer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');

  useEffect(() => {
    if (customer) {
      if (customer.name) setCustomerName(customer.name);
      if (customer.phone) {
        setCustomerPhone(customer.phone);
        setCustomerWhatsapp(customer.phone);
      }
      if (customer.email) setCustomerEmail(customer.email);
    }
  }, [customer]);

  // Reservation Specifics
  const [reservationDuration, setReservationDuration] = useState<ReservationDurationOption>('24h');


  const [proofImage, setProofImage] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Negotiation Specifics
  const [offeredPrice, setOfferedPrice] = useState<string>(
    product.minNegotiationPrice ? product.minNegotiationPrice.toString() : product.price.toString()
  );
  const [negotiationNotes, setNegotiationNotes] = useState('');

  // Question Specifics
  const [questionText, setQuestionText] = useState('');

  // Exchange Specifics
  const [currentApplianceType, setCurrentApplianceType] = useState('ثلاجة');
  const [currentBrand, setCurrentBrand] = useState('إل جي');
  const [currentCondition, setCurrentCondition] = useState('مستعمل - حالة ممتازة');
  const [exchangeNotes, setExchangeNotes] = useState('');

  // Generated Result State
  const [generatedRef, setGeneratedRef] = useState<string>('');
  const [generatedDoc, setGeneratedDoc] = useState<CustomerDocument | null>(null);
  const [generatedWhatsAppMsg, setGeneratedWhatsAppMsg] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedInstaPay, setCopiedInstaPay] = useState(false);

  if (!actionType) return null;
  const effectiveActionType = actionType;

  // Validation
  const isCustomerInfoValid = () => {
    if (!customerName.trim()) return false;
    if (!validateEgyptianPhone(customerPhone)) return false;
    return true;
  };

  // Helper to render PART 4: Two Final Options
  const renderTwoFinalOptionsButtons = (whatsappMsgOverride?: string) => {
    const mapsUrl = settings.address.googleMapsUrl || BUSINESS_CONFIG.address.googleMapsUrl;
    const msg = whatsappMsgOverride || generatedWhatsAppMsg;

    return (
      <div className="space-y-3 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 1: الذهاب إلى المعرض */}
          <Button
            variant="outline"
            className="w-full text-xs font-bold border-slate-700 text-slate-200 hover:bg-slate-800 py-3"
            onClick={() => window.open(mapsUrl, '_blank')}
            leftIcon={<MapPin className="w-4 h-4 text-blue-400" />}
          >
            📍 الذهاب إلى المعرض
          </Button>

          {/* Button 2: التواصل عبر واتساب */}
          <Button
            variant="electric"
            className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-none py-3"
            onClick={() => WhatsAppMessageBuilder.openWhatsApp(settings.whatsappPhone, msg)}
            leftIcon={<MessageCircle className="w-4 h-4 text-white" />}
          >
            💬 التواصل عبر واتساب
          </Button>
        </div>

        {generatedDoc && (
          <button
            onClick={() => setShowReceiptModal(true)}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer block mx-auto pt-1"
          >
            عرض وثيقة الطلب / الإيصال ({generatedRef})
          </button>
        )}
      </div>
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // ACTION WORKFLOW HANDLERS
  // ==========================================

  // Action 1: Request Purchase
  const handleFinalizePurchaseRequest = () => {
    if (!isCustomerInfoValid()) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسمك ورقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)', 'error');
      return;
    }

    const ref = generateReferenceNumber('PUR');
    setGeneratedRef(ref);

    // Build WhatsApp message
    const msg = WhatsAppMessageBuilder.buildPurchaseMessage(
      { name: customerName, phone: customerPhone, email: customerEmail },
      { title: product.title, code: product.id, price: product.price },
      ref
    );
    setGeneratedWhatsAppMsg(msg);

    // Clean Architecture Request Repository Record
    defaultRequestRepository.createRequest({
      referenceNumber: ref,
      type: 'purchase',
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
        email: customerEmail,
      },
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images?.[0] || '',
      status: 'pending_approval',
      priority: 'high',
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: 'تم تسجيل طلب الشراء بانتظار المعاينة بالمعرض',
          actor: 'Customer',
        },
      ],
    });

    // Send In-App Notification (NotificationService Abstraction)
    NotificationService.sendNotification({
      title: 'طلب شراء جديد',
      message: `طلب شراء جديد للجهاز ${product.title} من العميل ${customerName}`,
      type: 'info',
      channel: 'in_app',
      recipientPhone: customerPhone,
    });

    const doc = savePurchaseRequest({
      id: 'pur-' + Date.now(),
      referenceNumber: ref,
      product: {
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        warrantyAvailable: product.warrantyAvailable ?? product.warranty?.available,
        condition: product.condition,
        image: product.images?.[0] || '',
        showroomLocation: product.showroomLocation,
      },
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
        email: customerEmail,
      },
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: 'تم تسجيل طلب الشراء بانتظار المعاينة بالمعرض',
          actor: 'Customer',
        },
      ],
    });

    setGeneratedDoc(doc);
    setCurrentStep(3); // Confirmation
  };

  // Action 2: Reservation (strictly 24h Free Reservation, limit 1 per customer)
  const handleFinalizeReservation = () => {
    if (!isCustomerInfoValid()) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسمك ورقم هاتف مصري صحيح', 'error');
      return;
    }

    // Check single active reservation rule (PART 10)
    if (ReservationService.hasActiveReservation(customerPhone)) {
      showToast('حجز نشط موجود', 'لديك حجز نشط بالفعل. يمكن كل عميل حجز جهاز واحد فقط في نفس الوقت.', 'warning');
      return;
    }

    try {
      // 24 Hours Free Reservation (TASK-002)
      const resInfo = ReservationService.createFreeReservation({
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.images?.[0] || '',
        customerName,
        customerPhone,
      });

      setGeneratedRef(resInfo.reservationNumber);

      // Build WhatsApp message
      const msg = WhatsAppMessageBuilder.buildReservationMessage(
        { name: customerName, phone: customerPhone, email: customerEmail },
        { title: product.title, code: product.id, price: product.price },
        resInfo.reservationNumber
      );
      setGeneratedWhatsAppMsg(msg);

      // Clean Architecture Request Repository Record
      defaultRequestRepository.createRequest({
        referenceNumber: resInfo.reservationNumber,
        type: 'reservation',
        customer: {
          fullName: customerName,
          phone: customerPhone,
          whatsappPhone: customerWhatsapp || customerPhone,
          email: customerEmail,
        },
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        productImage: product.images?.[0] || '',
        status: 'active',
        priority: 'urgent',
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            status: 'active',
            note: 'تم تثبيت الحجز المجاني لـ 24 ساعة وحجب الجهاز آلياً',
            actor: 'Customer',
          },
        ],
      });

      // Send In-App Notification (NotificationService Abstraction)
      NotificationService.sendNotification({
        title: 'حجز جهاز جديد 24 ساعة',
        message: `تم حجب الجهاز ${product.title} لمدة 24 ساعة للعميل ${customerName}`,
        type: 'success',
        channel: 'in_app',
        recipientPhone: customerPhone,
      });

      const doc = saveReservationRequest({
        id: resInfo.id,
        referenceNumber: resInfo.reservationNumber,
        product: {
          id: product.id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          image: product.images?.[0] || '',
        },
        customer: {
          fullName: customerName,
          phone: customerPhone,
          whatsappPhone: customerWhatsapp || customerPhone,
        },
        duration: '24h',
        durationHours: 24,
        status: 'active',

        createdAt: resInfo.reservedAtISO,
        expiresAt: resInfo.expiresAtISO,
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            status: 'active',
            note: 'تم تثبيت الحجز المجاني لـ 24 ساعة وحجب الجهاز من المعرض',
            actor: 'Customer',
          },
        ],
      });

      // Update product status to 'reserved' (PART 3: Automatic Product Hold)
      updateProduct(product.id, { status: 'reserved' });

      setGeneratedDoc(doc);
      setCurrentStep(3); // Reservation Confirmation Card
      showToast('تم الحجز بنجاح', 'تم حجز الجهاز لك لمدة 24 ساعة مجاناً وحجبه عن المعرض', 'success');
    } catch (err: any) {
      showToast('عفواً', err.message || 'حدث خطأ أثناء إجراء الحجز', 'error');
    }
  };





  // Action 4: Finalize Negotiation
  const handleFinalizeNegotiation = () => {
    if (!isCustomerInfoValid() || !offeredPrice) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسمك ورقم الهاتف والسعر المقترح', 'error');
      return;
    }

    const ref = generateReferenceNumber('NEG');
    setGeneratedRef(ref);

    const offeredPriceNum = parseFloat(offeredPrice) || product.price;

    const msg = WhatsAppMessageBuilder.buildNegotiationMessage(
      { name: customerName, phone: customerPhone, email: customerEmail },
      { title: product.title, code: product.id, price: product.price },
      offeredPriceNum,
      negotiationNotes,
      ref
    );
    setGeneratedWhatsAppMsg(msg);

    defaultRequestRepository.createRequest({
      referenceNumber: ref,
      type: 'negotiation',
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
        email: customerEmail,
      },
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images?.[0] || '',
      status: 'pending_approval',
      priority: 'medium',
      details: { offeredPrice: offeredPriceNum, notes: negotiationNotes },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: `تقديم طلب تفاوض بسعر ${offeredPriceNum} ج.م`,
          actor: 'Customer',
        },
      ],
    });

    NotificationService.sendNotification({
      title: 'طلب تفاوض جديد',
      message: `عرض سعر جديد ${offeredPriceNum} ج.م للجهاز ${product.title}`,
      type: 'info',
      channel: 'in_app',
      recipientPhone: customerPhone,
    });

    const doc = saveNegotiationRequest({
      id: 'neg-' + Date.now(),
      referenceNumber: ref,
      product: {
        id: product.id,
        title: product.title,
        originalPrice: product.price,
        minNegotiationPrice: product.minNegotiationPrice,
        image: product.images?.[0] || '',
      },
      suggestedPrice: offeredPriceNum,
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
      },
      notes: negotiationNotes,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: `تم تقديم اقتراح سعر بقيمة ${offeredPriceNum} ج.م بانتظار مراجعة المعرض`,
          actor: 'Customer',
        },
      ],
    });

    setGeneratedDoc(doc);
    setCurrentStep(3); // Confirmation
  };

  // Action 6: Finalize Inquiry
  const handleFinalizeInquiry = () => {
    if (!isCustomerInfoValid() || !questionText.trim()) {
      showToast('خطأ في البيانات', 'يرجى إدخال بياناتك ونص السؤال أو الاستفسار', 'error');
      return;
    }

    const ref = generateReferenceNumber('INQ');
    setGeneratedRef(ref);

    const msg = WhatsAppMessageBuilder.buildInquiryMessage(
      { name: customerName, phone: customerPhone, email: customerEmail },
      { title: product.title, code: product.id, price: product.price },
      questionText,
      ref
    );
    setGeneratedWhatsAppMsg(msg);

    defaultRequestRepository.createRequest({
      referenceNumber: ref,
      type: 'inquiry',
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
        email: customerEmail,
      },
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images?.[0] || '',
      status: 'active',
      priority: 'medium',
      details: { question: questionText },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'active',
          note: 'استفسار جديد عن الجهاز',
          actor: 'Customer',
        },
      ],
    });

    NotificationService.sendNotification({
      title: 'استفسار عميل جديد',
      message: `استفسار عن الجهاز ${product.title} من العميل ${customerName}`,
      type: 'info',
      channel: 'in_app',
      recipientPhone: customerPhone,
    });

    const doc = saveInquiryRequest({
      id: 'inq-' + Date.now(),
      referenceNumber: ref,
      product: {
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.images?.[0] || '',
      },
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
      },
      question: questionText,
      status: 'active',
      createdAt: new Date().toISOString(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'active',
          note: 'تم تحويل الاستفسار المباشر لفريق المعرض',
          actor: 'Customer',
        },
      ],
    });

    setGeneratedDoc(doc);
    setCurrentStep(2); // Confirmation & WhatsApp
  };

  // Action 7: Finalize Exchange
  const handleFinalizeExchange = () => {
    if (!isCustomerInfoValid()) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسمك ورقم هاتفك الصحيح', 'error');
      return;
    }

    const ref = generateReferenceNumber('EXC');
    setGeneratedRef(ref);

    const msg = WhatsAppMessageBuilder.buildTradeInMessage(
      { name: customerName, phone: customerPhone, email: customerEmail },
      {
        currentDeviceType: currentApplianceType,
        currentBrand: currentBrand,
        currentCondition: currentCondition,
        notes: exchangeNotes,
        targetProductTitle: product.title,
        targetProductCode: product.id,
        targetProductPrice: product.price,
      }
    );
    setGeneratedWhatsAppMsg(msg);

    defaultRequestRepository.createRequest({
      referenceNumber: ref,
      type: 'trade_in',
      customer: {
        fullName: customerName,
        phone: customerPhone,
        whatsappPhone: customerWhatsapp || customerPhone,
        email: customerEmail,
      },
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images?.[0] || '',
      status: 'pending_approval',
      priority: 'high',
      details: {
        currentDeviceType: currentApplianceType,
        currentBrand: currentBrand,
        currentCondition: currentCondition,
        notes: exchangeNotes,
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: 'طلب استبدال جهاز قديم بجهاز من المعرض',
          actor: 'Customer',
        },
      ],
    });

    NotificationService.sendNotification({
      title: 'طلب استبدال جهاز',
      message: `طلب استبدال جهاز ${currentApplianceType} (${currentBrand}) مقابل ${product.title}`,
      type: 'info',
      channel: 'in_app',
      recipientPhone: customerPhone,
    });

    submitTradeRequest({
      requestNumber: ref,
      customerName: customerName,
      customerPhone: customerPhone,
      whatsappPhone: customerWhatsapp || customerPhone,
      currentApplianceType: currentApplianceType,
      currentBrand: currentBrand,
      currentCondition: currentCondition,
      photoUrls: [],
      desiredProductId: product.id,
      desiredProductTitle: product.title,
      desiredProductPrice: product.price,
      desiredProductImage: product.images?.[0] || '',
      notes: exchangeNotes,
      status: 'new',
    });

    setCurrentStep(2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {effectiveActionType === 'request_purchase' && <ShoppingBag className="w-6 h-6" />}
              {effectiveActionType === 'reserve' && <Sparkles className="w-6 h-6 text-amber-400" />}
              {effectiveActionType === 'negotiate' && <Tag className="w-6 h-6 text-amber-300" />}
              {effectiveActionType === 'visit_showroom' && <Store className="w-6 h-6 text-blue-400" />}
              {effectiveActionType === 'ask_question' && <HelpCircle className="w-6 h-6 text-purple-400" />}
              {effectiveActionType === 'exchange' && <RefreshCw className="w-6 h-6 text-blue-400" />}
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {effectiveActionType === 'request_purchase' && 'طلب شراء واستلام من المعرض'}
                {effectiveActionType === 'reserve' && 'طلب حجز الجهاز (مجاني 24 ساعة)'}
                {effectiveActionType === 'negotiate' && 'تقديم طلب تفاوض واقتراح سعر'}
                {effectiveActionType === 'visit_showroom' && 'زيارة ومعاينة الجهاز بالمعرض'}
                {effectiveActionType === 'ask_question' && 'استفسار فني حول هذا الجهاز'}
                {effectiveActionType === 'exchange' && 'طلب استبدال جهازك الحالي'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{product.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================== */}
        {/* ACTION 1: REQUEST PURCHASE WORKFLOW        */}
        {/* ========================================== */}
        {actionType === 'request_purchase' && (
          <div className="space-y-5">
            {/* Step Indicators */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-3">
              <span className={currentStep === 1 ? 'text-blue-400' : ''}>1. ملخص الجهاز</span>
              <span className={currentStep === 2 ? 'text-blue-400' : ''}>2. بيانات العميل</span>
              <span className={currentStep === 3 ? 'text-emerald-400' : ''}>3. تأكيد الاعتماد</span>
            </div>

            {/* Step 1: Product Summary */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-400 font-bold block">{product.brand}</span>
                    <h4 className="text-sm font-bold text-white leading-snug">{product.title}</h4>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {product.price.toLocaleString()} {settings.currencySymbol}
                      </span>
                      <Badge condition={product.condition} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-2 text-xs text-slate-300">
                  <span className="text-blue-400 font-bold block">ملاحظة نظام المعرض:</span>
                  <p className="leading-relaxed">
                    هذا المواقع ليس منصة تجارة إلكترونية تقليدية. يتم تسجيل طلب الشراء أولاً، ثم يسعدنا استقبالك بالمعرض بالمعادي للمعاينة وتجربة الجهاز بالكهرباء قبل إتمام الدفع والاستلام.
                  </p>
                </div>

                <Button variant="electric" className="w-full" onClick={() => setCurrentStep(2)}>
                  متابعة إلى إدخال بيانات العميل
                </Button>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Input
                  label="الاسم بالكامل *"
                  placeholder="محمد أحمد علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="رقم الهاتف (مصري - 11 رقم) *"
                  placeholder="01012345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />

                <Input
                  label="رقم الواتساب (اختياري - إن كان مختلفاً)"
                  placeholder="01012345678"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                />

                <Input
                  label="البريد الإلكتروني (اختياري)"
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    السابق
                  </Button>
                  <Button variant="electric" className="flex-1" onClick={handleFinalizePurchaseRequest}>
                    تسليم طلب الشراء وحفظ المستند
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-mono font-bold">رقم مرجع الطلب:</span>
                  <span className="text-xl font-black text-blue-400 font-mono bg-blue-500/10 px-4 py-1 rounded-full border border-blue-500/20 inline-block mt-1">
                    {generatedRef}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 text-right">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>تم استلام طلب الشراء بنجاح (Pending Showroom Approval)</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    يرجى زيارة المعرض بفرع المعادي لمراجعة الجهاز وتجربته بالكامل قبل سداد المبلغ النهائي.
                  </p>
                </div>

                {renderTwoFinalOptionsButtons()}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* ACTION 2: FREE 24-HOUR RESERVATION ENGINE  */}
        {/* ========================================== */}
        {actionType === 'reserve' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-3">
              <span className={currentStep === 1 ? 'text-blue-400' : ''}>1. ملخص الجهاز</span>
              <span className={currentStep === 2 ? 'text-blue-400' : ''}>2. بيانات الحجز المجاني</span>
              <span className={currentStep === 3 ? 'text-emerald-400' : ''}>3. وثيقة الحجز</span>
            </div>

            {/* Step 1: Summary */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold block">{product.brand}</span>
                    <h4 className="text-sm font-bold text-white">{product.title}</h4>
                    <span className="text-base font-black text-emerald-400 font-mono block mt-1">
                      {product.price.toLocaleString()} {settings.currencySymbol}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    نظام الحجز المعتمد لدى PRO TECK مجاني بالكامل لمدة 24 ساعة. يتم حجب الجهاز فوراً من المعرض لحين حضورك للمعاينة والإتمام.
                  </span>
                </div>

                <Button variant="electric" className="w-full" onClick={() => setCurrentStep(2)}>
                  متابعة لإدخال البيانات وتثبيت الحجز
                </Button>
              </div>
            )}

            {/* Step 2: Customer Info & 24h Rule */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">مدة الحجز المعيارية:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    24 ساعة مجاناً
                  </span>
                </div>

                <Input
                  label="الاسم بالكامل *"
                  placeholder="أحمد محمود"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="رقم الهاتف للتواصل *"
                  placeholder="010xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    ملاحظة هامة: يُسمح للعميل بحجز جهاز واحد فقط في نفس الوقت. ينتهي الحجز تلقائياً بعد 24 ساعة ويعود الجهاز للمعرض ما لم يتم إتمام الشراء.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    السابق
                  </Button>
                  <Button variant="electric" className="flex-1" onClick={handleFinalizeReservation}>
                    تأكيد الحجز وحجب الجهاز لمدة 24 ساعة
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Final Confirmation Card */}
            {currentStep === 3 && (
              <div className="text-center space-y-5 py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-bold">تم تثبيت الحجز وحجب الجهاز بنجاح:</span>
                  <span className="text-xl font-black text-amber-400 font-mono bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/20 inline-block mt-2">
                    {generatedRef}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto bg-slate-950 p-3 rounded-xl border border-slate-800">
                  تم حجب الجهاز من العرض العام لمدة 24 ساعة. يمكنك زيارة الفرع للمعاينة والاستلام.
                </p>

                {renderTwoFinalOptionsButtons()}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* ACTION 4: NEGOTIATE PRICE                  */}
        {/* ========================================== */}
        {actionType === 'negotiate' && (
          <div className="space-y-4">
            {!product.isNegotiable ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">هذا الجهاز محدد بسعر ثـابت معتمد</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تم تقييم حالة ومكونات هذا الجهاز وتسعيره بأفضل سعر عادل بالمعرض. السعر النهائي: ({product.price.toLocaleString()} {settings.currencySymbol}).
                </p>
                <Button variant="electric" onClick={onClose} className="w-full">
                  حسناً، فهمت
                </Button>
              </div>
            ) : currentStep === 1 ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
                  سعر الجهاز بالمعرض: {product.price.toLocaleString()} {settings.currencySymbol}. يمكنك تقديم اقتراح السعر المناسب لك.
                </div>

                <Input
                  label="السعر المقترح للشراء (ج.م) *"
                  type="number"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  required
                />

                <Input
                  label="الاسم بالكامل *"
                  placeholder="محمد علي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="رقم الهاتف للتواصل *"
                  placeholder="010xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />

                <Textarea
                  label="ملاحظات التفاوض (اختياري)"
                  placeholder="أسباب اقتراح هذا السعر، موعد الاستلام المتوقع..."
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  rows={2}
                />

                <Button variant="electric" className="w-full" onClick={handleFinalizeNegotiation}>
                  تقديم العرض وحفظ الطلب
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">تم تسجيل طلب التفاوض ({generatedRef})</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم حفظ عرضك بقيمة ({parseFloat(offeredPrice).toLocaleString()} {settings.currencySymbol}). سيقوم مسؤول المعرض بمراجعته.
                </p>

                {renderTwoFinalOptionsButtons()}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* ACTION 5: VISIT SHOWROOM                   */}
        {/* ========================================== */}
        {actionType === 'visit_showroom' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Store className="w-5 h-5" />
                <span>{settings.showroomName} - فرع المعادي الرئيسي</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-900 pt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">العنوان الدقيق:</span>
                    <span>{settings.showroomAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">مواعيد المعاينة المباشرة:</span>
                    <span>
                      {typeof settings.workingHours === 'string'
                        ? settings.workingHours
                        : settings.workingHours?.text || `${settings.workingHours?.start || ''} - ${settings.workingHours?.end || ''}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">موقف السيارات والمواصلات:</span>
                    <span>موقف سيارات مجاني مخصص لعملاء المعرض أمام المعرض مباشرة (15 دقيقة من الطريق الدائري).</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="electric"
              className="w-full text-xs"
              onClick={() => {
                const mapsUrl = settings.address.googleMapsUrl || BUSINESS_CONFIG.address.googleMapsUrl;
                window.open(mapsUrl, '_blank');
              }}
              leftIcon={<Navigation className="w-4 h-4" />}
            >
              فتح الاتجاهات المباشرة عبر Google Maps
            </Button>
          </div>
        )}

        {/* ========================================== */}
        {/* ACTION 6: ASK ABOUT PRODUCT (INQUIRY)     */}
        {/* ========================================== */}
        {actionType === 'ask_question' && (
          <div className="space-y-4">
            {currentStep === 1 ? (
              <div className="space-y-4">
                <Input
                  label="الاسم بالكامل *"
                  placeholder="محمد محمود"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label="رقم الهاتف للتواصل *"
                  placeholder="010xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />

                <Textarea
                  label="نص السؤال أو الاستفسار *"
                  placeholder="هل الجهاز شامل الخراطيم والوصلات؟ ما هي تكلفة الشحن لمحافظة الجيزة؟"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  required
                />

                <Button variant="electric" className="w-full" onClick={handleFinalizeInquiry}>
                  إرسال الاستفسار وتوليد كود المتابعة
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">تم تسجيل استفسارك برقم ({generatedRef})</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  سيقوم المهندس المختص بالرد على استفسارك المباشر فوراً.
                </p>

                {renderTwoFinalOptionsButtons()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Receipt Modal Overlay */}
      <PrintableReceiptModal document={generatedDoc} onClose={() => setShowReceiptModal(false)} />
    </div>
  );
};
