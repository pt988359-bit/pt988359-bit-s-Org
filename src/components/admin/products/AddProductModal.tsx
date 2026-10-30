import React, { useState, useRef } from 'react';
import { EnrichedProduct } from '../../../types/productStudio';
import { normalizeLifecycleState } from '../../../utils/productStudioStorage';
import { Category, ProductCondition } from '../../../types';
import { useShowroom } from '../../../context/ShowroomContext';
import { Plus, X, Save, Image, ShieldCheck, Upload, Loader2 } from 'lucide-react';
import { defaultSequenceService } from '../../../core/services/SequenceService';
import { IdGenerator } from '../../../core/services/IdGenerator';
import { uploadProductImageToStorage, convertFileToDataUrl } from '../../../firebase/storage';

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (newProduct: EnrichedProduct) => void;
  categories: Category[];
  brands: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onAddProduct,
  categories,
}) => {
  const { activeBrands } = useShowroom();
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'refrigerators');
  const [brand, setBrand] = useState(activeBrands[0]?.name || 'LG');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState<number>(25000);
  const [condition, setCondition] = useState<ProductCondition>('used_warranty');
  const [warrantyImageUrl, setWarrantyImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const tempProdId = IdGenerator.generateUniqueId('prod');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Immediately convert to Data URL so it is stored and displayed on the website right away
      const localDataUrl = await convertFileToDataUrl(file);
      setImageUrl(localDataUrl);
      setUploadProgress(50);

      // 2. Asynchronously upload to Firebase Storage in background
      try {
        const downloadUrl = await uploadProductImageToStorage(file, tempProdId, (pct) => {
          setUploadProgress(50 + Math.round(pct * 0.5));
        });
        if (downloadUrl) {
          setImageUrl(downloadUrl);
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed, image remains saved locally on the site:', storageErr);
      }
    } catch (err) {
      console.error('Failed to process image', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!title) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const newId = IdGenerator.generateUniqueId('prod');
      const internalCode = await defaultSequenceService.generateNextReference('product');

      const normState = normalizeLifecycleState('available');

      const createdProduct: EnrichedProduct = {
        id: newId,
        internalCode,
        qrCode: `QR-${internalCode}`,
        barcode: `622${Date.now().toString().slice(-9)}`,
        title,
        shortName: title.split(' ')[0],
        categoryId,
        brand,
        model: model || 'N/A',
        price: Number(price),
        description,
        publicDescription: description,
        condition,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        videos: [],
        ...normState,
        isNegotiable: true,
        warrantyAvailable: condition === 'used_warranty' || !!warrantyImageUrl,
        warrantyImageUrl: warrantyImageUrl.trim() || undefined,
        warrantyCardAvailable: condition === 'used_warranty' || !!warrantyImageUrl,
        reservationsCount: 0,
        purchaseRequestsCount: 0,
        negotiationsCount: 0,
        isArchived: false,
        mediaAlbums: [],
        extendedAccessories: [],
        showroomLocation: 'فرع المعادي شارع 68',
        arrivalDate: new Date().toLocaleDateString('ar-EG'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        specs: [
          { label: 'سعة الجهاز', value: '450 لتر' },
          { label: 'تكنولوجيا التبريد', value: 'انفرتر نوفروست' },
        ],
        warranty: {
          available: condition === 'used_warranty' || !!warrantyImageUrl,
          details: condition === 'used_warranty' ? 'بطاقة الضمان متوفرة' : 'بدون ضمان',
        },
        pricingBreakdown: {
          purchaseCost: Math.round(price * 0.7),
          transportationCost: 500,
          repairCost: 300,
          cleaningCost: 200,
          accessoriesCost: 0,
          otherCosts: 0,
          totalCost: Math.round(price * 0.72),
          minAcceptablePrice: Math.round(price * 0.85),
          recommendedPrice: price,
          displayedPrice: price,
          isNegotiable: true,
          expectedProfit: Math.round(price * 0.28),
          profitMarginPercent: 28,
        },
        inspectionChecklist: [],
        healthScores: {
          generalScore: 98,
          technicalScore: 100,
          appearanceScore: 95,
          overallScore: 98,
        },
        auditRecords: [
          {
            id: `audit-${Date.now()}`,
            date: new Date().toLocaleString('ar-EG'),
            adminName: 'PRO TECK Admin',
            adminRole: 'Super Admin',
            action: 'إنشاء ملف جهاز جديد بالنظام',
            newValue: title,
            reason: 'إضافة جهاز جديد للمعرض',
          },
        ],
      };

      onAddProduct(createdProduct);
    } catch (err) {
      console.error('Failed to create product', err);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">إضافة جهاز جديد للمعرض</h2>
              <p className="text-slate-400 text-[11px]">
                نظام الأجهزة الفردية الفريدة - يتم تخصيص كود فريد لكل جهاز
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">اسم الجهاز والموديل *:</label>
            <input
              type="text"
              required
              placeholder="مثال: ثلاجة ال جي 18 قدم نوفروست انفرتر ديجيتال"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">القسم *:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">الماركة (Brand) *:</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {activeBrands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.arabicName ? `${b.name} (${b.arabicName})` : b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">الموديل (Model):</label>
              <input
                type="text"
                placeholder="مثال: GN-B492GLCL"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">سعر الجهاز (ج.م) *:</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">حالة الجهاز والضمان *:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="used_warranty">مستعمل - بطاقة الضمان متوفرة</option>
                <option value="used_no_warranty">مستعمل - بدون ضمان</option>
                <option value="new">جديد بالكرتونة والضمان</option>
              </select>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleProductImageUpload}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300 block">رابط/رفع الصورة الرئيسية *:</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-2 py-0.5 text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 rounded font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      <span>رفع صورة</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">رابط صورة شهادة/بطاقة الضمان (اختياري):</label>
              <input
                type="text"
                placeholder="https://..."
                value={warrantyImageUrl}
                onChange={(e) => setWarrantyImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">وصف الجهاز التفصيلي:</label>
            <textarea
              rows={3}
              placeholder="تفاصيل حالة الجهاز، حالة الصاج، الفريزر، الضغط والكومبريسور..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-blue-500 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>إضافة الجهاز للنظام</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

