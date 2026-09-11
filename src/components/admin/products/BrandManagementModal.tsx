import React, { useState } from 'react';
import { useShowroom } from '../../../context/ShowroomContext';
import { Brand } from '../../../types';
import { Plus, X, Edit2, Trash2, CheckCircle2, XCircle, ShieldCheck, Tag, Power } from 'lucide-react';

interface BrandManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandManagementModal: React.FC<BrandManagementModalProps> = ({ isOpen, onClose }) => {
  const { brands, addBrand, updateBrand, deleteBrand, toggleBrand, products } = useShowroom();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setName('');
    setArabicName('');
    setLogoUrl('');
    setIsActive(true);
    setEditingBrand(null);
    setIsAdding(true);
  };

  const handleStartEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setArabicName(b.arabicName || '');
    setLogoUrl(b.logoUrl || '');
    setIsActive(b.isActive);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: name.trim(),
        arabicName: arabicName.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        isActive,
      });
      setEditingBrand(null);
    } else {
      addBrand({
        name: name.trim(),
        arabicName: arabicName.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        isActive,
      });
      setIsAdding(false);
    }
  };

  const handleDelete = (b: Brand) => {
    const productsWithBrand = products.filter((p) => p.brand.toLowerCase() === b.name.toLowerCase());
    if (productsWithBrand.length > 0) {
      alert(`لا يمكن حذف الماركة "${b.name}" لأن هناك ${productsWithBrand.length} أجهزة مرتبطة بها. يمكنك تعطيلها بدلاً من ذلك.`);
      return;
    }
    if (confirm(`هل أنت تأكد من حذف الماركة "${b.name}" نهائياً؟`)) {
      deleteBrand(b.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">إدارة الماركات والعلامات التجارية (Brands)</h2>
              <p className="text-slate-400 text-[11px]">إضافة، تعديل، تعطيل، وحذف الماركات الديناميكية لجميع استمارات الأجهزة</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Controls: Add Button */}
          {!isAdding && !editingBrand && (
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-300 font-bold">إجمالي الماركات المسجلة: {brands.length}</span>
              <button
                onClick={handleStartAdd}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة ماركة جديدة</span>
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {(isAdding || editingBrand) && (
            <form onSubmit={handleSave} className="p-5 rounded-2xl bg-slate-800/80 border border-blue-500/30 space-y-4 animate-fadeIn">
              <h3 className="font-black text-sm text-blue-400 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{editingBrand ? `تعديل الماركة (${editingBrand.name})` : 'إضافة ماركة جديدة للنظام'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">اسم الماركة (بالإنجليزية)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: LG, Samsung, Sharp, Midea"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">الاسم بالعربية (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: إل جي, سامسونج, شارب"
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-bold block mb-1">رابط الشعار (اختياري)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-slate-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>مفعلة وتظهر في استمارات إضافة الأجهزة والفلترة</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingBrand(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{editingBrand ? 'حفظ التعديلات' : 'إضافة الماركة'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Brands List Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/40">
            <table className="w-full text-right">
              <thead className="bg-slate-800/80 text-slate-400 font-bold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">الماركة</th>
                  <th className="p-3">الاسم بالعربية</th>
                  <th className="p-3">الأجهزة المرتبطة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {brands.map((b) => {
                  const associatedCount = products.filter(
                    (p) => p.brand.toLowerCase() === b.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-white flex items-center gap-2">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt={b.name} className="w-6 h-6 object-contain rounded" />
                        ) : (
                          <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                            {b.name.charAt(0)}
                          </span>
                        )}
                        <span>{b.name}</span>
                      </td>
                      <td className="p-3 text-slate-300 font-bold">{b.arabicName || '-'}</td>
                      <td className="p-3 text-slate-400 font-mono">{associatedCount} جهاز</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleBrand(b.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 transition-all cursor-pointer ${
                            b.isActive !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{b.isActive !== false ? 'مُفعلة' : 'معطلة'}</span>
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                            title="تعديل الماركة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="حذف الماركة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
