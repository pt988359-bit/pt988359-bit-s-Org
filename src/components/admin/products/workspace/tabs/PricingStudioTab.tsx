import React, { useState } from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { Save, Tag, CheckCircle2 } from 'lucide-react';

interface PricingStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const PricingStudioTab: React.FC<PricingStudioTabProps> = ({ product, onUpdateProduct }) => {
  const [displayedPrice, setDisplayedPrice] = useState<number | ''>(
    product.price ?? product.pricingBreakdown?.displayedPrice ?? ''
  );
  const [isNegotiable, setIsNegotiable] = useState<boolean>(
    product.isNegotiable ?? product.pricingBreakdown?.isNegotiable ?? true
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    product.pricingBreakdown?.internalNotes || ''
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSavePricing = () => {
    const finalPrice = displayedPrice === '' ? 0 : Number(displayedPrice);

    onUpdateProduct({
      price: finalPrice,
      isNegotiable,
      pricingBreakdown: {
        ...(product.pricingBreakdown || {}),
        displayedPrice: finalPrice,
        isNegotiable,
        internalNotes,
      },
      updatedAt: new Date().toISOString(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Header & Save Action */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">تسعير الجهاز وسعر العرض الفعلي</h4>
            <p className="text-[11px] text-slate-400">
              سعر البيع الفعلي المعلن للعملاء في صالة المعرض وعلى الموقع بدون أي احتساب من تكلفة.
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePricing}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 shrink-0"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>تم حفظ السعر</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>
      </div>

      {/* Pricing Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label className="text-emerald-400 font-extrabold text-xs block">
              سعر البيع الفعلي للجهاز (Showroom Price):
            </label>
            <div className="relative">
              <input
                type="number"
                value={displayedPrice}
                onChange={(e) => setDisplayedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="أدخل سعر البيع بالجنيه المصري..."
                className="w-full bg-slate-950 border-2 border-emerald-500/40 rounded-xl px-4 py-3 text-sm font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-400 pl-14"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-500 pointer-events-none">
                ج.م
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              هذا هو السعر الأساسي الفعلي الذي يظهر للعملاء في صفحة المنتج والمعرض.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              id="negToggle"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="negToggle" className="font-bold text-white cursor-pointer select-none">
              السعر قابل للتفاوض الذكي والعروض الرقمية
            </label>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-slate-400 font-bold block">
              ملاحظات تسعير داخلية (اختياري):
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="أي ملاحظات إدارية خاصة بسعر هذا الجهاز..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

