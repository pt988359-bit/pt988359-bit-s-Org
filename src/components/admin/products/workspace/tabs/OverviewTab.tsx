import React from 'react';
import { EnrichedProduct, ProductLifecycleStage } from '../../../../../types/productStudio';
import { ProductCondition } from '../../../../../types';
import { defaultProductRepository } from '../../../../../core/repositories/ProductRepository';
import { LIFECYCLE_STAGE_LABELS, normalizeLifecycleState } from '../../../../../utils/productStudioStorage';
import {
  Package,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Tag,
  MapPin,
  Calendar,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

interface OverviewTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
  categoryNameMap: Record<string, string>;
  onNavigateToTab: (tabKey: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  product,
  onUpdateProduct,
  categoryNameMap,
  onNavigateToTab,
}) => {
  const currentStageInfo = LIFECYCLE_STAGE_LABELS[product.lifecycleStage] || LIFECYCLE_STAGE_LABELS.published;

  const handleStageChange = (newStage: ProductLifecycleStage) => {
    const normState = normalizeLifecycleState(newStage);
    const newLog = {
      id: `audit-${Date.now()}`,
      date: new Date().toLocaleString('ar-EG'),
      adminName: 'PRO TECK Admin',
      adminRole: 'Super Admin',
      action: 'تحديث مرحلة دورة حياة الجهاز',
      fieldChanged: 'lifecycleStage',
      previousValue: product.lifecycleStage,
      newValue: newStage,
      reason: 'تغيير يدوي من لوحة تحكم الاستوديو',
    };

    onUpdateProduct({
      ...normState,
      auditRecords: [newLog, ...(product.auditRecords || [])],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleVisibilityChange = (newStatus: any) => {
    const normState = normalizeLifecycleState(newStatus);
    onUpdateProduct({
      ...normState,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleConditionChange = (newCondition: ProductCondition) => {
    const newLog = {
      id: `audit-${Date.now()}`,
      date: new Date().toLocaleString('ar-EG'),
      adminName: 'PRO TECK Admin',
      adminRole: 'Super Admin',
      action: 'تحديث حالة فرز الجهاز',
      fieldChanged: 'condition',
      previousValue: product.condition,
      newValue: newCondition,
      reason: 'تعديل يدوي من لوحة تحكم الاستوديو',
    };

    try {
      defaultProductRepository.update(product.id, { condition: newCondition });
    } catch {
      // Safe fallback
    }

    onUpdateProduct({
      condition: newCondition,
      auditRecords: [newLog, ...(product.auditRecords || [])],
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">الحجوزات الرقمية</span>
            <span className="font-mono text-base font-extrabold text-amber-400">{product.reservationsCount || 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">نسبة الربح المتوقعة</span>
            <span className="font-mono text-base font-extrabold text-emerald-400">
              {product.pricingBreakdown?.profitMarginPercent ? `${product.pricingBreakdown.profitMarginPercent}%` : '25%'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">درجة جاهزية الفحص</span>
            <span className="font-mono text-base font-extrabold text-indigo-300">
              {product.healthScores?.overallScore ? `${product.healthScores.overallScore}%` : '95%'}
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Stage & Visibility Control Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              مرحلة دورة حياة الجهاز والظهور للجمهور
            </h3>
            <p className="text-[11px] text-slate-400">
              تحديد المسار الفني والتشغيلي للجهاز من لحظة الشراء وحتى التسليم للعميل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">الحالة الحالية:</span>
            <span className={`px-3 py-1 rounded-full font-extrabold text-xs border ${currentStageInfo.bg} ${currentStageInfo.text} ${currentStageInfo.border}`}>
              {currentStageInfo.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Stage Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">تغيير مرحلة دورة الحياة:</label>
            <select
              value={product.lifecycleStage}
              onChange={(e) => handleStageChange(e.target.value as ProductLifecycleStage)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="draft">1. مسودة (جاري التجهيز)</option>
              <option value="purchased">2. تم الشراء حديثاً</option>
              <option value="pending_inspection">3. قيد الفحص والتجربة</option>
              <option value="cleaning">4. التنظيف والتعقيم</option>
              <option value="maintenance">5. الصيانة والتجهيز</option>
              <option value="photography">6. التصوير الفوتوغرافي</option>
              <option value="pending_review">7. المراجعة الفنية</option>
              <option value="published">8. منشور بالمعرض والموقع</option>
              <option value="sold">9. تم البيع والتسليم</option>
              <option value="archived">10. مؤرشف للسلة</option>
            </select>
          </div>

          {/* Availability Status Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">رؤية العرض بالموقع:</label>
            <select
              value={product.status}
              onChange={(e) => handleVisibilityChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="available">متاح للعرض الشفاف والشراء (Available)</option>
              <option value="sold">مباع - للتوضيح بالأرشيف (Sold)</option>
              <option value="maintenance">في الصيانة - غير متاح للبيع (Maintenance)</option>
              <option value="hidden">مخفي من المعرض والموقع (Hidden)</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">اختصارات فورية:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab('ai_assistant')}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحسين بالذكاء الاصطناعي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* General Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2">
            البيانات الأساسية للجهاز
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block text-[11px]">كود الجهاز الداخلي:</span>
              <span className="font-mono font-extrabold text-blue-400 text-xs">{product.internalCode || product.id}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">القسم:</span>
              <span className="font-bold text-white text-xs">{categoryNameMap[product.categoryId] || product.categoryId}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">الماركة والموديل:</span>
              <span className="font-bold text-white text-xs">{product.brand} - {product.model || 'N/A'}</span>
            </div>

            <div>
              <label htmlFor="product-condition-select" className="text-slate-500 block text-[11px] font-bold mb-1">
                حالة الفرز:
              </label>
              <select
                id="product-condition-select"
                value={
                  product.condition === 'new'
                    ? 'new'
                    : product.condition === 'used_warranty' || product.condition === 'refurbished'
                    ? 'used_warranty'
                    : 'used_no_warranty'
                }
                onChange={(e) => handleConditionChange(e.target.value as ProductCondition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer transition-colors"
              >
                <option value="new">جديد</option>
                <option value="used_warranty">مستعمل بضمان الشركة</option>
                <option value="used_no_warranty">مستعمل بدون ضمان</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">موقع المعاينة بالفرع:</span>
              <span className="font-bold text-slate-300 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                {product.showroomLocation || 'فرع المعادي شارع 68'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">تاريخ الوصول للمعرض:</span>
              <span className="font-mono text-slate-300 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                {product.arrivalDate || new Date(product.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>

          <div className="space-y-1 border-t border-slate-800/80 pt-3">
            <span className="text-slate-400 font-bold block">الوصف المعلن للجمهور:</span>
            <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {product.publicDescription || product.description}
            </p>
          </div>
        </div>

        {/* Pricing & Warranty Overview Side Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-2">
            الملخص المالي والضمان
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">سعر العرض للجمهور:</span>
              <span className="font-extrabold text-emerald-400 text-sm">{product.price.toLocaleString()} ج.م</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">إجمالي التكلفة الشاملة:</span>
              <span className="font-mono font-bold text-slate-300">
                {product.pricingBreakdown?.totalCost ? `${product.pricingBreakdown.totalCost.toLocaleString()} ج.م` : 'غير محدد'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">الضمان المعتمد:</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {product.warranty ? 'ضمان معتمد' : 'بدون ضمان'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('pricing')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>عرض تحليل التكلفة والتسعير الشامل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
