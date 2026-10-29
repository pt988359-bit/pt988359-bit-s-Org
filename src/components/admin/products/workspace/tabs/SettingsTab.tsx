import React, { useState } from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { QrCode, Trash2, RotateCcw, Save, ShieldAlert, Barcode, Hash, CheckCircle2, DollarSign } from 'lucide-react';

interface SettingsTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
  onSoftDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
  onMarkAsSold: (finalPrice: number) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  product,
  onUpdateProduct,
  onSoftDelete,
  onRestore,
  onMarkAsSold,
}) => {
  const [codeFormat, setCodeFormat] = useState(product.internalCode || `PT-WM-2026-0001`);
  const [qrCodeVal, setQrCodeVal] = useState(product.qrCode || `QR-${product.id}`);
  const [salePrice, setSalePrice] = useState<string>(
    product.price !== undefined && product.price > 0 ? String(product.price) : ''
  );
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  const handleSaveCode = () => {
    onUpdateProduct({
      internalCode: codeFormat,
      qrCode: qrCodeVal,
      updatedAt: new Date().toISOString(),
    });
  };

  const numSalePrice = parseFloat(salePrice);
  const isSaleButtonDisabled = !salePrice.trim() || isNaN(numSalePrice) || numSalePrice <= 0;

  const handleDirectSale = () => {
    if (isSaleButtonDisabled) return;
    onMarkAsSold(numSalePrice);
    setSaleSuccessMessage(`تم تسجيل بيع الجهاز بنجاح بسعر ${numSalePrice.toLocaleString()} ج.م`);
    setTimeout(() => {
      setSaleSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Product ID Configuration */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">إعدادات كود الجهاز والتكويد الرقمي</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                الكود المعتمد يظهر بالفواتير، باركود QR، الحجوزات، وأدوات البحث السريع
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveCode}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كود الجهاز</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">كود الجهاز الداخلي (Product ID):</label>
            <input
              type="text"
              value={codeFormat}
              onChange={(e) => setCodeFormat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">كود QR والموقع بالفرع:</label>
            <input
              type="text"
              value={qrCodeVal}
              onChange={(e) => setQrCodeVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* QR Code Visual Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <div className="w-20 h-20 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-16 h-16 text-slate-950" />
          </div>
          <div>
            <span className="font-mono text-xs font-extrabold text-blue-400 block">{codeFormat}</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              يمكن طباعة هذا الرمز كملصق شفاف على الجهاز بفرع المعادي للمعاينة الفورية عبر الموبايل
            </span>
          </div>
        </div>
      </div>

      {/* Direct Sale Registration Card */}
      {product.status === 'sold' ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-300">تسجيل بيع مباشر</h3>
              <p className="text-emerald-200 text-xs font-bold mt-1">
                تم بيع هذا الجهاز بتاريخ {product.soldAt ? (product.soldAt.includes('T') ? product.soldAt.split('T')[0] : product.soldAt) : 'سابقاً'} بسعر {(product.finalPrice ?? product.price ?? 0).toLocaleString()} ج.م
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">تسجيل بيع مباشر (بدون طلب أونلاين)</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  تسجيل فوري لعمليات البيع الحضوري بالمعرض أو هاتفياً وتحديث حالة الجهاز إلى مباع
                </p>
              </div>
            </div>
          </div>

          {saleSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saleSuccessMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1 space-y-1">
              <label className="font-bold text-slate-300 block">
                السعر الفعلي اللي اتباع بيه الجهاز (ج.م):
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="أدخل السعر الفعلي..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <button
                type="button"
                disabled={isSaleButtonDisabled}
                onClick={handleDirectSale}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                  !isSaleButtonDisabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد البيع</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archiving & Soft Delete Card (PART 7) */}
      <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <h3 className="font-extrabold text-sm text-rose-300">منطقة الأرشفة والحذف الآمن (PART 7: Deleted Product Archive)</h3>
            <p className="text-[11px] text-rose-400/80">
              لحماية السجلات المالية والضمانات، لا يتم حذف أي جهاز نهائياً من قاعدة البيانات. يتم إخفاؤه من الموقع العام ونقله للأرشيف الداخلي.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!product.isArchived && (
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">سبب الحذف / الأرشفة (Archive Reason):</label>
              <select
                value={product.archiveReason || 'sold'}
                onChange={(e) =>
                  onUpdateProduct({
                    archiveReason: e.target.value as 'sold' | 'damaged' | 'returned' | 'cancelled' | 'other',
                  })
                }
                className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="sold">تم البيع (Sold)</option>
                <option value="damaged">تالف / غير صالح (Damaged)</option>
                <option value="returned">مرتجع (Returned)</option>
                <option value="cancelled">ملغى (Cancelled)</option>
                <option value="other">سبب آخر (Other)</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-bold text-white block">حالة الجهاز بالنظام:</span>
              <span className="text-[11px] text-slate-400 block">
                {product.isArchived
                  ? `الجهاز بأرشيف المعرض حالياً (سبب الأرشفة: ${product.archiveReason || 'غير محدد'})`
                  : 'الجهاز نشط ومعروض في قاعدة بيانات المعرض والموقع'}
              </span>
            </div>

            {product.isArchived ? (
              <button
                onClick={() => onRestore(product.id, product.title)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-500 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة الجهاز للموقع العام</span>
              </button>
            ) : (
              <button
                onClick={() => onSoftDelete(product.id, product.title)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-500 transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>إخفاء ونقل إلى الأرشيف (Archive)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
