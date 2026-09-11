import React, { useState } from 'react';
import { EnrichedProduct, ExtendedProductAccessory } from '../../../../../types/productStudio';
import { PackageCheck, Plus, Trash2, CheckCircle2, AlertTriangle, Save, HelpCircle } from 'lucide-react';

interface AccessoriesStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const AccessoriesStudioTab: React.FC<AccessoriesStudioTabProps> = ({ product, onUpdateProduct }) => {
  const [accessories, setAccessories] = useState<ExtendedProductAccessory[]>(
    product.extendedAccessories || [
      { id: 'acc-1', name: 'أرفف زجاج بايركس أصلي', category: 'shelf', status: 'included' },
      { id: 'acc-2', name: 'قالب مكعبات الثلج المتحرك', category: 'other', status: 'included' },
      { id: 'acc-3', name: 'كتالوج التشغيل ودليل الضمان الأصلي', category: 'manual', status: 'included' },
      { id: 'acc-4', name: 'حوامل تثبيت الأرجل مانعة الاهتزاز', category: 'other', status: 'optional_addon', estimatedValue: 300 },
    ]
  );

  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<'included' | 'missing' | 'optional_addon' | 'damaged'>('included');

  const handleSaveAccessories = () => {
    onUpdateProduct({
      extendedAccessories: accessories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const item: ExtendedProductAccessory = {
      id: `acc-${Date.now()}`,
      name: newName,
      category: 'other',
      status: newStatus,
    };
    setAccessories([...accessories, item]);
    setNewName('');
  };

  const handleDeleteAccessory = (id: string) => {
    setAccessories(accessories.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">إدارة ملحقات وقطع الجهاز (Accessories Studio)</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                تأكيد الملحقات المرفقة مع الشحنة، الملحقات المفقودة، والإكسسوارات الإضافية الاختيارية
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAccessories}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الملحقات</span>
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAddAccessory} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="اسم الملحق (مثال: ريموت كنترول أصلي، خرطوم طرد...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="included">مرفق مع الجهاز (Included)</option>
            <option value="missing">ناقص / مفقود (Missing)</option>
            <option value="optional_addon">إضافة اختيارية بسعر إضافي (Optional)</option>
            <option value="damaged">تالف جاري استبداله (Damaged)</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ملحق</span>
          </button>
        </form>

        {/* Accessories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accessories.map((acc) => (
            <div key={acc.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {acc.status === 'included' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {acc.status === 'missing' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {acc.status === 'optional_addon' && <PackageCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                <div>
                  <span className="font-bold text-white block">{acc.name}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {acc.status === 'included'
                      ? 'مرفق وجاهز للتسليم'
                      : acc.status === 'missing'
                      ? 'غير متوفر مع الجهاز'
                      : 'إضافة اختيارية'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteAccessory(acc.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
