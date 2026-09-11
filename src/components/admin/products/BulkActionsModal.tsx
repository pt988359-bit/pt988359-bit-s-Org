import React, { useState } from 'react';
import { BulkActionType, ProductLifecycleStage } from '../../../types/productStudio';
import { Category } from '../../../types';
import { Layers, X, Save, AlertTriangle, ShieldCheck, Tag, Percent } from 'lucide-react';

interface BulkActionsModalProps {
  action: BulkActionType;
  selectedCount: number;
  onClose: () => void;
  onExecute: (action: BulkActionType, payload?: any) => void;
  categories: Category[];
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  action,
  selectedCount,
  onClose,
  onExecute,
  categories,
}) => {
  const [selectedStage, setSelectedStage] = useState<ProductLifecycleStage>('published');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'refrigerators');
  const [selectedWarrantyMonths, setSelectedWarrantyMonths] = useState(120);
  const [discountPercent, setDiscountPercent] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (action === 'change_stage') {
      onExecute('change_stage', { stage: selectedStage });
    } else if (action === 'change_category') {
      onExecute('change_category', { category: selectedCategory });
    } else if (action === 'change_warranty') {
      onExecute('change_warranty', { months: selectedWarrantyMonths });
    } else if (action === 'apply_discount') {
      onExecute('apply_discount', { discountPercent });
    } else {
      onExecute(action);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">إجراء جماعي على ({selectedCount}) جهاز</h2>
              <p className="text-slate-400 text-[11px]">
                سيتم تطبيق هذا التغيير فوراً على الأجهزة المحددة
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {action === 'archive' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>تأكيد نقل الأجهزة المختارة للأرشيف (Soft Delete)</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                هل أنت متأكد من نقل {selectedCount} جهاز إلى أجهزة الأرشيف والسلة؟ يمكن استعادتهم لاحقاً بنقرة واحدة.
              </p>
            </div>
          )}

          {action === 'change_stage' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">اختر مرحلة دورة الحياة الجديدة:</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="draft">1. مسودة (Draft)</option>
                <option value="purchased">2. تم الشراء (Purchased)</option>
                <option value="pending_inspection">3. قيد الفحص (Pending Inspection)</option>
                <option value="cleaning">4. التنظيف والتعقيم (Cleaning)</option>
                <option value="maintenance">5. الصيانة والتجهيز (Maintenance)</option>
                <option value="photography">6. التصوير الفوتوغرافي (Photography)</option>
                <option value="pending_review">7. المراجعة الفنية (Pending Review)</option>
                <option value="published">8. منشور بالمعرض والموقع (Published)</option>
                <option value="reserved">9. محجوز بعربون (Reserved)</option>
                <option value="sold">10. تم البيع والتسليم (Sold)</option>
                <option value="archived">11. مؤرشف للسلة (Archived)</option>
              </select>
            </div>
          )}

          {action === 'change_category' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">اختر القسم الجديد:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'change_warranty' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">اختر فترة الضمان المعتمدة:</label>
              <select
                value={selectedWarrantyMonths}
                onChange={(e) => setSelectedWarrantyMonths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={120}>10 سنوات (ضمان المعرض الذهبي)</option>
                <option value={60}>5 سنوات</option>
                <option value={24}>سنتان</option>
                <option value={12}>سنة واحدة</option>
                <option value={0}>بدون ضمان</option>
              </select>
            </div>
          )}

          {action === 'apply_discount' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">نسبة الخصم المئوية (%):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {action === 'toggle_negotiable' && (
            <p className="text-slate-300">
              سيتم تبديل حالة القابلية للتفاوض (Negotiable) على كافة الأجهزة المحددة ({selectedCount}).
            </p>
          )}

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
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>تنفيذ الإجراء الجماعي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
