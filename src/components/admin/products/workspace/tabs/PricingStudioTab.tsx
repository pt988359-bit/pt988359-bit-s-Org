import React, { useState } from 'react';
import { EnrichedProduct, ProductPricingBreakdown } from '../../../../../types/productStudio';
import { ProductPurchaseHistory, ProductSaleRecord } from '../../../../../types';
import { DollarSign, Save, Lock, AlertCircle, TrendingUp, HelpCircle, CheckCircle2, ShoppingCart, User, Truck, Wrench, Sparkles, Tag } from 'lucide-react';

interface PricingStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const PricingStudioTab: React.FC<PricingStudioTabProps> = ({ product, onUpdateProduct }) => {
  const currentPricing = product.pricingBreakdown || {
    purchaseCost: 24000,
    transportationCost: 600,
    repairCost: 400,
    cleaningCost: 300,
    accessoriesCost: 200,
    otherCosts: 0,
    totalCost: 25500,
    minAcceptablePrice: 32000,
    recommendedPrice: 34500,
    displayedPrice: product.price || 34500,
    isNegotiable: product.isNegotiable ?? true,
    expectedProfit: 9000,
    profitMarginPercent: 26.0,
    internalNotes: '',
  };

  const [form, setForm] = useState<ProductPricingBreakdown>(currentPricing);

  // Purchase History Form State (PART 1)
  const [purchaseHistoryForm, setPurchaseHistoryForm] = useState<ProductPurchaseHistory>({
    supplierName: product.purchaseHistory?.supplierName || 'شركة توريدات المعادي للأجهزة',
    purchaseDate: product.purchaseHistory?.purchaseDate || product.arrivalDate || new Date().toISOString().split('T')[0],
    purchaseCost: product.purchaseHistory?.purchaseCost ?? form.purchaseCost ?? 24000,
    transportationCost: product.purchaseHistory?.transportationCost ?? form.transportationCost ?? 600,
    maintenanceCost: product.purchaseHistory?.maintenanceCost ?? form.repairCost ?? 400,
    cleaningCost: product.purchaseHistory?.cleaningCost ?? form.cleaningCost ?? 300,
    accessoriesCost: product.purchaseHistory?.accessoriesCost ?? form.accessoriesCost ?? 200,
    totalCost: product.purchaseHistory?.totalCost ?? (form.purchaseCost + form.transportationCost + form.repairCost + form.cleaningCost + form.accessoriesCost),
    adminNotes: product.purchaseHistory?.adminNotes || 'تم الفحص الفني والاستلام بالمعرض',
  });

  // Sale Record Form State (PART 2)
  const [saleRecordForm, setSaleRecordForm] = useState<ProductSaleRecord>({
    buyerName: product.saleRecord?.buyerName || '',
    buyerPhone: product.saleRecord?.buyerPhone || '',
    saleDate: product.saleRecord?.saleDate || new Date().toISOString().split('T')[0],
    salePrice: product.saleRecord?.salePrice ?? product.price,
    totalCost: product.saleRecord?.totalCost ?? purchaseHistoryForm.totalCost,
    profit: product.saleRecord?.profit ?? (product.price - purchaseHistoryForm.totalCost),
    invoiceNumber: product.saleRecord?.invoiceNumber || `INV-${product.internalCode || product.id}`,
    paymentMethod: product.saleRecord?.paymentMethod || 'cash',
    reservationReference: product.saleRecord?.reservationReference || '',
    adminNotes: product.saleRecord?.adminNotes || '',
  });

  // Recalculate totals
  const totalCost =
    (Number(form.purchaseCost) || 0) +
    (Number(form.transportationCost) || 0) +
    (Number(form.repairCost) || 0) +
    (Number(form.cleaningCost) || 0) +
    (Number(form.accessoriesCost) || 0) +
    (Number(form.otherCosts) || 0);

  const displayedPrice = Number(form.displayedPrice) || 0;
  const expectedProfit = displayedPrice - totalCost;
  const profitMarginPercent = totalCost > 0 ? ((expectedProfit / totalCost) * 100).toFixed(1) : '0';

  const handleSavePricing = () => {
    const updatedPricingBreakdown: ProductPricingBreakdown = {
      ...form,
      totalCost,
      expectedProfit,
      profitMarginPercent: Number(profitMarginPercent),
    };

    const updatedPurchaseHistory: ProductPurchaseHistory = {
      ...purchaseHistoryForm,
      purchaseCost: Number(form.purchaseCost),
      transportationCost: Number(form.transportationCost),
      maintenanceCost: Number(form.repairCost),
      cleaningCost: Number(form.cleaningCost),
      accessoriesCost: Number(form.accessoriesCost),
      totalCost,
    };

    const calculatedSaleProfit = (Number(saleRecordForm.salePrice) || displayedPrice) - totalCost;
    const updatedSaleRecord: ProductSaleRecord = {
      ...saleRecordForm,
      salePrice: Number(saleRecordForm.salePrice) || displayedPrice,
      totalCost,
      profit: calculatedSaleProfit,
    };

    onUpdateProduct({
      price: displayedPrice,
      isNegotiable: form.isNegotiable,
      minNegotiationPrice: Number(form.minAcceptablePrice),
      pricingBreakdown: updatedPricingBreakdown,
      purchaseHistory: updatedPurchaseHistory,
      saleRecord: saleRecordForm.buyerName ? updatedSaleRecord : product.saleRecord,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm">سرية بيانات التكلفة الشاملة وسجل الشراء</h4>
            <p className="text-[11px] text-amber-300/80">
              جميع عناصر التكلفة والهامش وسجل الشراء سرية للغاية وحصرية لإدارة المعرض.
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePricing}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات المالية والسجلات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Breakdown Inputs (PART 1 & PART 4) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            PART 1: سجل الشراء والتكلفة الشاملة (Purchase History)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-slate-400 font-bold block">اسم المورد (Supplier):</label>
              <input
                type="text"
                value={purchaseHistoryForm.supplierName}
                onChange={(e) => setPurchaseHistoryForm({ ...purchaseHistoryForm, supplierName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-slate-400 font-bold block">تاريخ الشراء (Purchase Date):</label>
              <input
                type="date"
                value={purchaseHistoryForm.purchaseDate}
                onChange={(e) => setPurchaseHistoryForm({ ...purchaseHistoryForm, purchaseDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">تكلفة الشراء (Purchase Cost):</label>
              <input
                type="number"
                value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">مصاريف النقل والشحن:</label>
              <input
                type="number"
                value={form.transportationCost}
                onChange={(e) => setForm({ ...form, transportationCost: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">تكلفة الصيانة وقطع الغيار:</label>
              <input
                type="number"
                value={form.repairCost}
                onChange={(e) => setForm({ ...form, repairCost: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">التنظيف والتعقيم الفني:</label>
              <input
                type="number"
                value={form.cleaningCost}
                onChange={(e) => setForm({ ...form, cleaningCost: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">الملحقات المضافة:</label>
              <input
                type="number"
                value={form.accessoriesCost}
                onChange={(e) => setForm({ ...form, accessoriesCost: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">مصاريف أخرى/نثريات:</label>
              <input
                type="number"
                value={form.otherCosts}
                onChange={(e) => setForm({ ...form, otherCosts: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-bold text-sm">
            <span className="text-slate-300">إجمالي التكلفة الحقيقية (Total Cost):</span>
            <span className="font-mono text-blue-400 text-base">{totalCost.toLocaleString()} ج.م</span>
          </div>
        </div>

        {/* Pricing Strategy & Margins */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            استراتيجية البيع وهامش الربح المتوقع
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-emerald-400 font-extrabold block">سعر العرض للجمهور بالموقع (Showroom Price):</label>
              <input
                type="number"
                value={form.displayedPrice}
                onChange={(e) => setForm({ ...form, displayedPrice: Number(e.target.value) })}
                className="w-full bg-slate-950 border-2 border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">الحد الأدنى المقبول للبيع:</label>
                <input
                  type="number"
                  value={form.minAcceptablePrice}
                  onChange={(e) => setForm({ ...form, minAcceptablePrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">السعر الموصى به:</label>
                <input
                  type="number"
                  value={form.recommendedPrice}
                  onChange={(e) => setForm({ ...form, recommendedPrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="checkbox"
                id="negToggle"
                checked={form.isNegotiable}
                onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="negToggle" className="font-bold text-white cursor-pointer">
                السعر قابل للتفاوض الذكي والعروض الرقمية (Negotiable)
              </label>
            </div>
          </div>

          {/* Computed Profit Box (PART 4) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">صافي الربح المتوقع (Net Profit):</span>
              <span className={`font-mono font-extrabold text-sm ${expectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {expectedProfit.toLocaleString()} ج.م
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">نسبة العائد على التكلفة (ROI):</span>
              <span className="font-mono font-extrabold text-blue-400 text-sm">{profitMarginPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* PART 2: Sale Record Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-purple-400" />
          PART 2: توثيق عملية البيع الدائمة (Sale Information & Invoice Record)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">اسم المشتري (Buyer Name):</label>
            <input
              type="text"
              value={saleRecordForm.buyerName}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, buyerName: e.target.value })}
              placeholder="مثال: أسامة فتحي"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">رقم الهاتف (Buyer Phone):</label>
            <input
              type="text"
              value={saleRecordForm.buyerPhone}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, buyerPhone: e.target.value })}
              placeholder="010XXXXXXXX"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">تاريخ البيع (Sale Date):</label>
            <input
              type="date"
              value={saleRecordForm.saleDate}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, saleDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">سعر البيع الفعلي (Sale Price):</label>
            <input
              type="number"
              value={saleRecordForm.salePrice}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, salePrice: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">رقم الفاتورة (Invoice No.):</label>
            <input
              type="text"
              value={saleRecordForm.invoiceNumber}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, invoiceNumber: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">طريقة الدفع (Payment Method):</label>
            <select
              value={saleRecordForm.paymentMethod}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, paymentMethod: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="cash">نقداً بالمعرض (Cash)</option>
              <option value="instapay">InstaPay (انستا باي)</option>
              <option value="vodafone_cash">Vodafone Cash (فودافون كاش)</option>
              <option value="card">بطاقة ائتمانية (Credit Card)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">مرجع الحجز السابق (إن وجد):</label>
            <input
              type="text"
              value={saleRecordForm.reservationReference || ''}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, reservationReference: e.target.value })}
              placeholder="RES-XXXXX"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">ملاحظات البيع والتسليم:</label>
            <input
              type="text"
              value={saleRecordForm.adminNotes || ''}
              onChange={(e) => setSaleRecordForm({ ...saleRecordForm, adminNotes: e.target.value })}
              placeholder="تسليم صالة العرض بالمعادي"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

