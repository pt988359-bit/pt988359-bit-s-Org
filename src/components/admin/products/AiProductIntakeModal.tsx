import React, { useState, useRef } from 'react';
import { Category } from '../../../types';
import { SupplierRecord } from '../../../types/adminFinance';
import { EnrichedProduct } from '../../../types/productStudio';
import { ExtractedProductData, FieldExtractionResult } from '../../../types/aiProductIntake';
import { AiExtractionService } from '../../../core/services/AiExtractionService';
import { useShowroom } from '../../../context/ShowroomContext';
import { convertFileToDataUrl } from '../../../firebase/storage';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Save,
  Loader2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Truck,
  ShieldCheck,
  Tag,
  Wrench,
  Search,
  FileText,
  User,
  Layers,
  Building,
  Upload,
} from 'lucide-react';

interface AiProductIntakeModalProps {
  onClose: () => void;
  onAddProduct: (newProduct: EnrichedProduct) => void;
  categories: Category[];
  suppliers?: SupplierRecord[];
}

export const AiProductIntakeModal: React.FC<AiProductIntakeModalProps> = ({
  onClose,
  onAddProduct,
  categories,
}) => {
  const { activeBrands, suppliers: contextSuppliers, addBrand, addSupplier } = useShowroom();
  const suppliers = contextSuppliers || [];

  // State
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Cancellation controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Quick inline creation state for missing Brand / Category / Supplier
  const [showAddBrandInline, setShowAddBrandInline] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  
  const [showAddSupplierInline, setShowAddSupplierInline] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Image Assist Foundation state (Part 5)
  const [uploadedImageNames, setUploadedImageNames] = useState<string[]>([]);
  const [isSimulatingVision, setIsSimulatingVision] = useState(false);

  // Handle Text Paste Example
  const handleLoadSampleText = () => {
    setRawText(`رسالة الواتساب من مورد المعادي:
وصلنا ثلاجة ال جي نوفروست 18 قدم انفرتر رقم الموديل GN-B492GLCL لون فضي ديجيتال.
الجهاز مستعمل بضمان 12 شهر من المصنع. حالة الكومبريسور والجسم فابريقة خالية من الخدوش.
سعر الشراء الاصلي من شركة العربي للتوريدات: 18,500 جنيه.
مصاريف الشحن ونقل المعرض: 600 جنيه.
صيانة وقطع غيار: 400 جنيه.
سعر البيع المقترح للعميل بالمعرض: 27,000 جنيه.
المرفقات: شهادة الضمان والرفوف الأصلية.`);
  };

  // Run AI Extraction Engine
  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setError('يرجى كتابة أو لصق النص المُراد تحليله أولاً.');
      return;
    }

    setError(null);
    setExtractedData(null);
    setIsAnalyzing(true);
    setAnalyzeProgress('جاري الاتصال بمحرك الذكاء الاصطناعي وتطبيق قواعد التحليل المعقدة...');

    // Setup cancellation controller
    abortControllerRef.current = new AbortController();

    try {
      const context = {
        availableCategories: categories.map((c) => ({ id: c.id, name: c.name })),
        availableBrands: activeBrands.map((b) => b.name),
        availableSuppliers: suppliers.map((s) => ({ id: s.id, name: s.name })),
        categories,
        brands: activeBrands,
        suppliers,
      };

      setAnalyzeProgress('جاري استخراج الماركة، التكلفة الشاملة، الضمان والمواصفات الديناميكية...');
      const result = await AiExtractionService.extractProductFromText(
        rawText,
        context,
        abortControllerRef.current.signal
      );

      setExtractedData(result);
    } catch (err: any) {
      if (err.message?.includes('إلغاء')) {
        setError('تم إلغاء عملية التحليل.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تحليل البيانات.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalyzeProgress('');
    }
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Inline Quick Creation Handlers
  const handleInlineAddBrand = () => {
    if (!newBrandName.trim()) return;
    addBrand({
      id: newBrandName.toLowerCase().replace(/\s+/g, '-'),
      name: newBrandName.trim(),
      isActive: true,
    });
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        brand: { ...extractedData.brand, value: newBrandName.trim(), status: 'green', confidence: 100 },
        brandExists: true,
      });
    }
    setNewBrandName('');
    setShowAddBrandInline(false);
  };

  const handleInlineAddSupplier = () => {
    if (!newSupplierName.trim()) return;
    addSupplier({
      name: newSupplierName.trim(),
      phone: '',
      contactPerson: 'مسؤول التوريدات',
      governorate: 'القاهرة',
      city: 'المعادي',
      suppliedCategories: ['أجهزة منزلية'],
      rating: 5,
    });
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        supplierName: { ...extractedData.supplierName, value: newSupplierName.trim(), status: 'green', confidence: 100 },
        supplierExists: true,
      });
    }
    setNewSupplierName('');
    setShowAddSupplierInline(false);
  };

  // Image Assist Simulation & Local Storage
  const handleSimulateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const names = filesArr.map((f: File) => f.name);
      setUploadedImageNames(names);
      setIsSimulatingVision(true);

      try {
        const dataUrls = await Promise.all(filesArr.map((f: File) => convertFileToDataUrl(f)));
        if (extractedData && dataUrls.length > 0) {
          setExtractedData({
            ...extractedData,
            images: {
              value: dataUrls,
              confidence: 100,
              status: 'green',
              note: 'تم حفظ الصور محلياً للموقع بنجاح',
            },
          });
        }
      } catch (err) {
        console.error('Error processing images in intake modal:', err);
      } finally {
        setIsSimulatingVision(false);
      }
    }
  };

  // Field Edit Helpers for Review Screen
  const updateField = <K extends keyof ExtractedProductData>(
    field: K,
    newVal: any
  ) => {
    if (!extractedData) return;
    const current = extractedData[field] as FieldExtractionResult<any>;
    if (typeof current === 'object' && 'value' in current) {
      setExtractedData({
        ...extractedData,
        [field]: { ...current, value: newVal, status: 'green', confidence: 100, note: 'تم التعديل يدوياً بواسطة المدير' },
      });
    }
  };

  // Create Product upon Admin Approval
  const handleApproveAndCreate = async () => {
    if (isCreatingProduct || !extractedData) return;
    setIsCreatingProduct(true);
    try {
      const { product } = await AiExtractionService.buildProductFromExtractedData(extractedData, 'PRO TECK Admin');
      onAddProduct(product);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Confidence Badge Renderer
  const renderConfidenceBadge = (status: 'green' | 'yellow' | 'red', confidence: number, note?: string) => {
    if (status === 'green') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          title={note}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>مؤكد {confidence}%</span>
        </span>
      );
    }
    if (status === 'yellow') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
          title={note}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>مراجعة {confidence}%</span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
        title={note}
      >
        <HelpCircle className="w-3 h-3" />
        <span>مفقود / غير محدد</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 dir-rtl text-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">تحليل بيانات الجهاز بالذكاء الاصطناعي</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  AI Intake Engine v2.0
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                استخراج فوري للماركة، التكلفة، الضمان والمواصفات من أي نص حر غير منتظم مع مراجعة كاملة قبل الحفظ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 underline font-bold">
                تجاهل
              </button>
            </div>
          )}

          {/* STEP 1: TEXT AREA & IMAGE ASSIST FOUNDATION */}
          {!extractedData && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>الصق هنا أي معلومات عن الجهاز (Raw Unstructured Text):</span>
                  </label>

                  <button
                    onClick={handleLoadSampleText}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تجربة نص توضيحي (Sample Message)</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`الصق هنا أي معلومات عن الجهاز...

يمكن أن تكون:
• رسالة واتساب من مورد أو بائع
• إعلان فيسبوك أو موقع أوليكس
• مواصفات وتقييم من موقع الشركة المصنعة
• كتالوج فني أو تقرير صيانة
• وصف حر مكتوب باللغة العربية أو الإنجليزية`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans leading-relaxed custom-scrollbar shadow-inner"
                />

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>يدعم المحرك اللغة العربية والإنجليزية بجميع اللهجات والمصطلحات التجارية</span>
                  <span>عدد الحروف: {rawText.length}</span>
                </div>
              </div>

              {/* STEP 5: IMAGE ASSIST FOUNDATION */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-slate-200">محرك فحص الصور المستقبلي (STEP 5: Image Assist Foundation)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                    معمارية جاهزة للتوسع
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  يمكنك رفع صور الجهاز لاكتشاف الماركة، بطاقة الضمان، اللون، الملحقات والخدوش مستقبلياً:
                </p>

                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-2 transition-all">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>اختيار صور للجهاز</span>
                    <input type="file" multiple accept="image/*" onChange={handleSimulateImageUpload} className="hidden" />
                  </label>

                  {isSimulatingVision && (
                    <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري معالجة ملامح الصور...</span>
                    </span>
                  )}

                  {uploadedImageNames.length > 0 && !isSimulatingVision && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم ربط {uploadedImageNames.length} صورة بالمعالجة</span>
                    </span>
                  )}
                </div>
              </div>

              {/* ANALYZE BUTTON & PROGRESS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>

                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-indigo-300 font-bold flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>{analyzeProgress}</span>
                    </span>

                    <button
                      onClick={handleCancelAnalysis}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold cursor-pointer transition-all"
                    >
                      إلغاء التحليل
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAnalyze}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تحليل بالذكاء الاصطناعي (Analyze with AI)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW SCREEN (NEVER SAVE AUTOMATICALLY) */}
          {extractedData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Review Bar Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">شاشة مراجعة البيانات المستخرجة (Review Screen)</h3>
                    <p className="text-[11px] text-slate-400">
                      راجِع وتأكّد من صحة الحقول المستخرجة. لا يتم الحفظ تلقائياً أبداً قبل موافقتك الصريحة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة التحليل</span>
                  </button>

                  <button
                    onClick={handleApproveAndCreate}
                    disabled={isCreatingProduct}
                    className={`px-6 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all ${
                      isCreatingProduct
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:bg-emerald-500 hover:scale-105 cursor-pointer'
                    }`}
                  >
                    {isCreatingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>جاري الإنشاء...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>اعتماد وإنشاء الجهاز بالنظام</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Review Section 1: General & Brand */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-xs text-indigo-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>1. البيانات العامة والماركة (General & Brand Info)</span>
                  </span>
                  {renderConfidenceBadge(extractedData.title.status, extractedData.title.confidence, extractedData.title.note)}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 block">عنوان وتسمية الجهاز بالمعرض *:</label>
                      {renderConfidenceBadge(extractedData.title.status, extractedData.title.confidence)}
                    </div>
                    <input
                      type="text"
                      value={extractedData.title.value}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 block">الماركة (Brand) *:</label>
                      {renderConfidenceBadge(extractedData.brand.status, extractedData.brand.confidence)}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={extractedData.brand.value}
                        onChange={(e) => updateField('brand', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                      />

                      {!extractedData.brandExists && (
                        <button
                          onClick={() => setShowAddBrandInline(true)}
                          className="px-2.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold shrink-0 cursor-pointer text-[11px]"
                          title="إضافة هذه الماركة لقاعدة البيانات"
                        >
                          + إضافة كماركة جديدة
                        </button>
                      )}
                    </div>

                    {showAddBrandInline && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2 mt-2">
                        <span className="font-bold text-amber-300 block">إضافة ماركة جديدة لقاعدة البيانات:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="اسم الماركة بالإنجليزية"
                            value={newBrandName || extractedData.brand.value}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <button
                            onClick={handleInlineAddBrand}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
                          >
                            حفظ الماركة
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 block">القسم (Category) *:</label>
                      {renderConfidenceBadge(extractedData.categoryName.status, extractedData.categoryName.confidence)}
                    </div>
                    <select
                      value={extractedData.categoryId.value}
                      onChange={(e) => {
                        const sel = categories.find((c) => c.id === e.target.value);
                        updateField('categoryId', e.target.value);
                        if (sel) updateField('categoryName', sel.name);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 block">رقم الموديل (Model):</label>
                      {renderConfidenceBadge(extractedData.model.status, extractedData.model.confidence)}
                    </div>
                    <input
                      type="text"
                      value={extractedData.model.value}
                      onChange={(e) => updateField('model', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 block">اللون (Color):</label>
                      {renderConfidenceBadge(extractedData.color.status, extractedData.color.confidence)}
                    </div>
                    <input
                      type="text"
                      value={extractedData.color.value}
                      onChange={(e) => updateField('color', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Review Section 2: Financials & Costs */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-xs text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>2. عناصر التكلفة الشاملة وسعر البيع (Financial Extraction & Pricing)</span>
                  </span>
                  {renderConfidenceBadge(extractedData.sellingPrice.status, extractedData.sellingPrice.confidence)}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">تكلفة الشراء:</label>
                    <input
                      type="number"
                      value={extractedData.purchaseCost.value}
                      onChange={(e) => updateField('purchaseCost', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">مصاريف الشحن/النقل:</label>
                    <input
                      type="number"
                      value={extractedData.transportationCost.value}
                      onChange={(e) => updateField('transportationCost', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">الصيانة وقطع الغيار:</label>
                    <input
                      type="number"
                      value={extractedData.maintenanceCost.value}
                      onChange={(e) => updateField('maintenanceCost', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">التنظيف والتعقيم:</label>
                    <input
                      type="number"
                      value={extractedData.cleaningCost.value}
                      onChange={(e) => updateField('cleaningCost', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-bold block">إجمالي التكلفة الشاملة (Total Cost):</span>
                      <span className="text-xs text-slate-400">محسوبة تلقائياً من كافة عناصر التكلفة</span>
                    </div>
                    <span className="text-base font-extrabold text-white font-mono">
                      {(
                        extractedData.purchaseCost.value +
                        extractedData.transportationCost.value +
                        extractedData.maintenanceCost.value +
                        extractedData.cleaningCost.value +
                        extractedData.accessoriesCost.value +
                        extractedData.otherCosts.value
                      ).toLocaleString()}{' '}
                      ج.م
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-300 font-bold block">سعر البيع المعلن بالمعرض *:</span>
                      <span className="text-[11px] text-emerald-400/80">المقترح أو المعروض للعميل</span>
                    </div>
                    <input
                      type="number"
                      value={extractedData.sellingPrice.value}
                      onChange={(e) => updateField('sellingPrice', Number(e.target.value))}
                      className="w-36 bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm text-emerald-400 font-extrabold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Review Section 3: Supplier & Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier Matching */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-blue-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>3. ربط المورد (Supplier Detection)</span>
                    </span>
                    {renderConfidenceBadge(extractedData.supplierName.status, extractedData.supplierName.confidence)}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={extractedData.supplierName.value}
                        onChange={(e) => updateField('supplierName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                      />

                      {!extractedData.supplierExists && (
                        <button
                          onClick={() => setShowAddSupplierInline(true)}
                          className="px-2.5 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 font-bold shrink-0 cursor-pointer text-[11px]"
                        >
                          + إنشاء مورد جديد
                        </button>
                      )}
                    </div>

                    {showAddSupplierInline && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2">
                        <span className="font-bold text-blue-300 block">إضافة هذا المورد لسجل الموردين:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="اسم الشركة أو المورد"
                            value={newSupplierName || extractedData.supplierName.value}
                            onChange={(e) => setNewSupplierName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <button
                            onClick={handleInlineAddSupplier}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                          >
                            حفظ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warranty Detection */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-xs text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>4. حالة بطاقة الضمان (Warranty Detection)</span>
                    </span>
                    {renderConfidenceBadge(extractedData.warrantyCardAvailable.status, extractedData.warrantyCardAvailable.confidence)}
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extractedData.warrantyCardAvailable.value}
                        onChange={(e) => updateField('warrantyCardAvailable', e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span className="font-bold text-white">بطاقة الضمان متوفرة ومرفقة بالجهاز</span>
                    </label>


                  </div>
                </div>
              </div>

              {/* Review Section 4: Dynamic Technical Specifications */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-xs text-purple-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span>5. المواصفات الفنية المكتشفة ديناميكياً (Dynamic Technical Specifications)</span>
                  </span>
                  <span className="text-slate-400 text-[11px] font-normal">{extractedData.specs.length} مواصفة مستخرجة</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {extractedData.specs.map((spec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const newSpecs = [...extractedData.specs];
                          newSpecs[idx].label = e.target.value;
                          setExtractedData({ ...extractedData, specs: newSpecs });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-bold"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...extractedData.specs];
                          newSpecs[idx].value = e.target.value;
                          setExtractedData({ ...extractedData, specs: newSpecs });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Section 5: Description & Search Keywords */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-extrabold text-xs text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>6. الوصف التسويقي التلقائي وكلمات البحث (Generated Content & Keywords)</span>
                </h4>

                <div className="space-y-2">
                  <label className="font-bold text-slate-300 block">الوصف التسويقي المولّد للعميل (Customer Description):</label>
                  <textarea
                    rows={3}
                    value={extractedData.generatedDescription.value}
                    onChange={(e) => updateField('generatedDescription', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-300 block">كلمات البحث الداخلي (Search Keywords):</label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {extractedData.searchKeywords.value.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-bold flex items-center gap-1"
                      >
                        <span>#{kw}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                >
                  إلغاء المراجعة
                </button>

                <button
                  onClick={handleApproveAndCreate}
                  disabled={isCreatingProduct}
                  className={`px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all ${
                    isCreatingProduct
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:from-emerald-500 hover:to-teal-500 hover:scale-105 cursor-pointer'
                  }`}
                >
                  {isCreatingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>اعتماد وإضافة الجهاز لقاعدة البيانات المعرض</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
