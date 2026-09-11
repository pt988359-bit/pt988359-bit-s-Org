import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Star,
  ShoppingBag,
  Calendar,
  FileText,
} from 'lucide-react';
import { SupplierRecord } from '../../../types/adminFinance';

interface SupplierDirectoryTabProps {
  suppliers: SupplierRecord[];
  onAddSupplier: (supplier: Omit<SupplierRecord, 'id' | 'supplierNumber' | 'purchaseCount' | 'totalSpent' | 'isArchived'>) => void;
}

export const SupplierDirectoryTab: React.FC<SupplierDirectoryTabProps> = ({
  suppliers,
  onAddSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'individual'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    area: 'المعادي - القاهرة',
    type: 'company' as 'company' | 'individual',
    preferredCategories: 'ثلاجات, غسالات',
    notes: '',
    rating: 5,
  });

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (filterType !== 'all' && supplier.type !== filterType) return false;
    if (
      searchTerm &&
      !supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !supplier.phone.includes(searchTerm) &&
      !supplier.area.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !supplier.supplierNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const categoriesArray = formData.preferredCategories.split(',').map((c) => c.trim()).filter(Boolean);

    onAddSupplier({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      area: formData.area,
      type: formData.type,
      preferredCategories: categoriesArray,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      notes: formData.notes || undefined,
      rating: formData.rating,
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      area: 'المعادي - القاهرة',
      type: 'company',
      preferredCategories: 'ثلاجات, غسالات',
      notes: '',
      rating: 5,
    });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            دليل الموردين والتجّار (Supplier Directory)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة بيانات الموردين (شركات وأفراد) ومتابعة حجم التعاملات والتواصل المباشر برقم (SUP-2026).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل مورد جديد
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="البحث بالاسم، رقم التليفون، المنطقة، أو الكود (SUP-2026)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الكل ({suppliers.length})
          </button>
          <button
            onClick={() => setFilterType('company')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'company'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            شركات ومراكز
          </button>
          <button
            onClick={() => setFilterType('individual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'individual'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            أفراد وفنيين
          </button>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">لا يوجد موردون مسجلون حتى الآن</h3>
          <p className="text-xs text-slate-400">يمكنك الضغط على زر "تسجيل مورد جديد" لإضافة مورد أو شركة توريد جديدة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                      sup.type === 'company' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {sup.type === 'company' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">{sup.supplierNumber}</span>
                      <h3 className="text-sm font-black text-white leading-tight">{sup.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                {/* Area & Categories */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>المنطقة: {sup.area}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {sup.preferredCategories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Volume Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block">عدد التوريدات</span>
                    <span className="text-sm font-black text-blue-400">{sup.purchaseCount || 0} عملية</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block">إجمالي التعاملات</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {(sup.totalSpent || 0).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    ملاحظة: {sup.notes}
                  </p>
                )}
              </div>

              {/* Quick Phone & WhatsApp Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${sup.phone}`}
                  className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  إتصال
                </a>

                <a
                  href={`https://wa.me/${(sup.whatsapp || sup.phone || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  واتساب
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                إضافة مورد / تاجر جديد (SUP-2026)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المورد أو الشركة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الشركة المصرية لتوريد قطع الغيار"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع المورد</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'company' | 'individual' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="company">شركة / مركز صيانة</option>
                    <option value="individual">فرد / فني تجميع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المنطقة</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    placeholder="010XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الواتساب</label>
                  <input
                    type="text"
                    placeholder="2010XXXXXXXX"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">التصنيفات الموردة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="ثلاجات, غسالات, قطع غيار..."
                  value={formData.preferredCategories}
                  onChange={(e) => setFormData({ ...formData, preferredCategories: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات وتقييم المورد</label>
                <textarea
                  rows={2}
                  placeholder="شروط الضمان وسرعة التوريد..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  حفظ وتسجيل المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
