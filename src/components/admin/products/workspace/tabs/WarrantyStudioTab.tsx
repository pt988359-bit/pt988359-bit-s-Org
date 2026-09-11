import React, { useState, useRef } from 'react';
import { EnrichedProduct, ProductWarranty } from '../../../../../types/productStudio';
import { ShieldCheck, Save, Image, CheckCircle2, XCircle, Upload, Loader2 } from 'lucide-react';
import { uploadProductImageToStorage, convertFileToDataUrl } from '../../../../../firebase/storage';

interface WarrantyStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const WarrantyStudioTab: React.FC<WarrantyStudioTabProps> = ({ product, onUpdateProduct }) => {
  const [available, setAvailable] = useState<boolean>(product.warranty?.available ?? true);
  const [warrantyImageUrl, setWarrantyImageUrl] = useState<string>(product.warrantyImageUrl || '');
  const [warrantyNotes, setWarrantyNotes] = useState<string>(product.warranty?.details || 'يشمل الضمان الرسمى مع بطاقة صيانة معتمدة.');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Immediately convert to Data URL so it is saved and displayed on the website right away
      const localDataUrl = await convertFileToDataUrl(file);
      setWarrantyImageUrl(localDataUrl);
      setUploadProgress(50);

      // Instantly save to product state
      onUpdateProduct({
        warrantyImageUrl: localDataUrl,
        warranty: {
          available,
          details: warrantyNotes,
          images: [localDataUrl],
        },
        updatedAt: new Date().toISOString(),
      });

      // 2. Asynchronously upload to Firebase Storage in background
      try {
        const downloadUrl = await uploadProductImageToStorage(file, product.id, (pct) => {
          setUploadProgress(50 + Math.round(pct * 0.5));
        });
        if (downloadUrl) {
          setWarrantyImageUrl(downloadUrl);
          onUpdateProduct({
            warrantyImageUrl: downloadUrl,
            warranty: {
              available,
              details: warrantyNotes,
              images: [downloadUrl],
            },
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed, warranty image remains saved locally on the site:', storageErr);
      }
    } catch (err) {
      console.error('Failed to process warranty image', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSaveWarranty = () => {
    const updatedWarranty: ProductWarranty = {
      available,
      details: warrantyNotes,
      images: warrantyImageUrl ? [warrantyImageUrl] : [],
    };

    onUpdateProduct({
      warrantyAvailable: available,
      warrantyDetails: warrantyNotes,
      warranty: updatedWarranty,
      warrantyImageUrl,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">إدارة بطاقة ضمان الجهاز (Warranty Settings)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                تحديد توفر الضمان وإرفاق صورة شهادة الضمان المعتمدة للجهاز
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveWarranty}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات الضمان</span>
          </button>
        </div>

        {/* Toggle Available */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-white text-sm block">حالة توفر الضمان</span>
            <span className="text-slate-400 text-xs">هل يحتوي هذا الجهاز على ضمان معتمد؟</span>
          </div>
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              available
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {available ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>الضمان متوفر</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>بدون ضمان</span>
              </>
            )}
          </button>
        </div>

        {/* Image Upload / URL Input */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-400" />
              <span>صورة بطاقة / شهادة الضمان (Warranty Card Image):</span>
            </span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الرفع ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة بطاقة الضمان</span>
                </>
              )}
            </button>
          </label>

          <input
            type="text"
            value={warrantyImageUrl}
            onChange={(e) => setWarrantyImageUrl(e.target.value)}
            placeholder="أدخل رابط صورة بطاقة الضمان..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 dir-ltr text-left"
          />

          {warrantyImageUrl && (
            <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
              <img src={warrantyImageUrl} alt="بطاقة الضمان" className="max-h-48 rounded-lg object-contain" />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="font-bold text-slate-300 block">تفاصيل وتغطية الضمان:</label>
          <textarea
            value={warrantyNotes}
            onChange={(e) => setWarrantyNotes(e.target.value)}
            rows={3}
            placeholder="اكتب تفاصيل تغطية الضمان وسياسة الصيانة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

