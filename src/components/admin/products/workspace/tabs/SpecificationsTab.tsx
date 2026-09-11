import React, { useState } from 'react';
import { EnrichedProduct } from '../../../../../types/productStudio';
import { INITIAL_SPEC_TEMPLATES } from '../../../../../utils/productStudioStorage';
import { ProductSpec } from '../../../../../types';
import { Sliders, Plus, Trash2, CheckCircle2, Save, FileSpreadsheet, Settings2 } from 'lucide-react';

interface SpecificationsTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
  categoryNameMap: Record<string, string>;
}

export const SpecificationsTab: React.FC<SpecificationsTabProps> = ({
  product,
  onUpdateProduct,
  categoryNameMap,
}) => {
  const [specs, setSpecs] = useState<ProductSpec[]>(product.specs || []);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  // Find matching template for current category
  const matchingTemplate = INITIAL_SPEC_TEMPLATES.find((t) => t.categoryId === product.categoryId);

  const handleSaveSpecs = () => {
    onUpdateProduct({
      specs,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSpecChange = (index: number, val: string) => {
    const updated = [...specs];
    updated[index].value = val;
    setSpecs(updated);
  };

  const handleAddCustomSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newValue) return;
    setSpecs([...specs, { label: newLabel, value: newValue }]);
    setNewLabel('');
    setNewValue('');
  };

  const handleDeleteSpec = (index: number) => {
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  const handleApplyTemplate = () => {
    if (!matchingTemplate) return;
    const templateSpecs: ProductSpec[] = matchingTemplate.fields.map((f) => {
      const existing = specs.find((s) => s.label === f.labelArabic);
      return {
        label: f.labelArabic,
        value: existing ? existing.value : String(f.defaultValue || f.options?.[0] || 'غير محدد'),
      };
    });
    setSpecs(templateSpecs);
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Category Template Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              محرك المواصفات الديناميكية حسب القسم ({categoryNameMap[product.categoryId] || product.categoryId})
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              تتغير حقول المواصفات أوتوماتيكياً حسب نوع الجهاز لتقديم أفضل تجربة للعميل
            </p>
          </div>
        </div>

        {matchingTemplate && (
          <button
            onClick={handleApplyTemplate}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تطبيق القالب المعتمد للقسم</span>
          </button>
        )}
      </div>

      {/* Specifications Editor List */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-white">قائمة المواصفات الحالية ({specs.length})</h3>
          <button
            onClick={handleSaveSpecs}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ المواصفات</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {specs.map((sp, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="w-1/3">
                <span className="font-bold text-slate-300 block truncate">{sp.label}</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={sp.value}
                  onChange={(e) => handleSpecChange(idx, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => handleDeleteSpec(idx)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                title="حذف الخاصية"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Spec Form */}
      <form onSubmit={handleAddCustomSpec} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="عنوان الخاصية (مثال: نوع غاز التبريد)..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="القيمة (مثال: R600a صديق البيئة)..."
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خاصية</span>
        </button>
      </form>
    </div>
  );
};
