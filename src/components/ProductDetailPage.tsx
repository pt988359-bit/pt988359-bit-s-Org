import React, { useState } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { normalizeEgyptianPhone } from '../utils/phoneUtils';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { MediaExperience } from './product-detail/MediaExperience';
import { TechSpecs } from './product-detail/TechSpecs';
import { WarrantyCard } from './product-detail/WarrantyCard';
import { SimilarProducts } from './product-detail/SimilarProducts';
import { ProductExchangeModal } from './ProductExchangeModal';
import { ProductActionModals } from './product-detail/ProductActionModals';
import {
  MessageCircle,
  Tag,
  ShieldCheck,
  Award,
  ArrowRight,
  Share2,
  Heart,
  ChevronLeft,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { selectedProductId, getProductById, navigateTo, settings } = useShowroom();

  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
  const [actionModalType, setActionModalType] = useState<
    'buy' | 'negotiate' | 'showroom' | 'directions' | 'exchange' | 'inquiry' | null
  >(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const product = selectedProductId ? getProductById(selectedProductId) : undefined;

  if (!product) {
    return (
      <div className="p-16 text-center glass-panel rounded-3xl my-12 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">لم يتم العثور على الجهاز المطلوب</h2>
        <p className="text-xs text-slate-500">قد يكون الجهاز تم بيعه أو حذف معرّفه من المعرض.</p>
        <Button variant="electric" onClick={() => navigateTo('products')}>
          العودة لقائمة أجهزة المعرض
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `تفقد هذا الجهاز في معرض PRO TECK: ${product.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNegotiateWhatsApp = () => {
    const phone = settings.whatsappPhone || settings.phone;
    const cleanPhone = normalizeEgyptianPhone(phone || '');
    const text = encodeURIComponent(
      `مرحباً PRO TECK، أود التفاوض على سعر الجهاز التالي:\n` +
      `اسم الجهاز: ${product.title}\n` +
      `كود الجهاز: #${product.internalCode || product.id}\n` +
      `السعر المعلن: ${product.price.toLocaleString()} ج.م\n` +
      `رابط الجهاز: ${window.location.href}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 pb-24 animate-fadeIn max-w-6xl mx-auto dir-rtl px-4 sm:px-6">
      {/* Top Navigation & Share */}
      <div className="flex items-center justify-between gap-4 text-xs pt-2">
        <button
          onClick={() => navigateTo('products')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للأجهزة المتاحة</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <Share2 className="w-4 h-4" />
          {copiedLink ? <span className="text-emerald-400 font-bold">تم النسخ</span> : <span>مشاركة</span>}
        </button>
      </div>

      {/* Product Title & Code Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            {product.brand}
          </span>
          <Badge condition={product.condition} size="sm" />
          {product.warrantyCardAvailable && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              بطاقة الضمان متوفرة
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">كود: #{product.internalCode || product.id}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          {product.title}
        </h1>
      </div>

      {/* 1. Images / Videos Section */}
      <MediaExperience product={product} />

      {/* 2. Price & Action Buttons */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400 block font-bold mb-1">السعر المعروض بالمعرض:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                {product.price.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-300">{settings.currencySymbol}</span>
            </div>
          </div>

          <div className="text-right sm:text-left bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl">
            <span className="text-[10px] text-blue-400 block font-bold">شراء ومعاينة:</span>
            <span className="text-xs font-bold text-white">معاينة وفحص بفرع المعادي</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="electric"
            size="lg"
            className="w-full font-extrabold"
            onClick={() => setActionModalType('buy')}
            leftIcon={<Tag className="w-5 h-5 text-white" />}
          >
            طلب شراء مباشر
          </Button>

          {/* Subtle Secondary Button for Negotiation - Opens WhatsApp directly */}
          <Button
            variant="outline"
            size="lg"
            className="w-full font-bold border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleNegotiateWhatsApp}
            leftIcon={<MessageCircle className="w-5 h-5 text-emerald-400" />}
          >
            التفاوض على السعر
          </Button>
        </div>
      </div>

      {/* 5. Product Description */}
      {product.description && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-3">
          <h2 className="text-lg font-black text-white">وصف وحالة الجهاز الحالية</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </section>
      )}

      {/* 6. Specifications Section */}
      <TechSpecs product={product} />

      {/* 7. Warranty Image / Card Section */}
      <WarrantyCard product={product} />

      {/* 8. Related Products Engine (Up to 6 products) */}
      <SimilarProducts currentProduct={product} />

      {/* Modals */}
      <ProductExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        targetProduct={product}
      />

      <ProductActionModals
        product={product}
        modalType={actionModalType}
        onClose={() => setActionModalType(null)}
      />
    </div>
  );
};
