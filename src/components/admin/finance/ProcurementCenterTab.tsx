import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Tag,
  AlertCircle,
  Phone,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { ProcurementItem, ProcurementStatus, ProcurementPriority } from '../../../types/adminFinance';

interface ProcurementCenterTabProps {
  procurementItems: ProcurementItem[];
  onAddProcurement: (item: Omit<ProcurementItem, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  onUpdateStatus: (id: string, status: ProcurementStatus) => void;
}

const STATUS_BADGES: Record<ProcurementStatus, { labelAr: string; color: string }> = {
  open: { labelAr: 'مفتوح للبحث', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  searching: { labelAr: 'قيد البحث والمعاينة', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  found: { labelAr: 'تم العثور عليه', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  purchased: { labelAr: 'تم الشراء والتوريد', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { labelAr: 'ملغي', color: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export const ProcurementCenterTab: React.FC<ProcurementCenterTabProps> = ({
  procurementItems,
  onAddProcurement,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    applianceType: 'ثلاجات',
    brand: 'توشيبا (Toshiba)',
    preferredModels: '',
    targetPurchasePrice: '',
    maximumPurchasePrice: '',
    priority: 'medium' as ProcurementPriority,
    notes: '',
  });

  const filteredItems = procurementItems.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (
      searchTerm &&
      !item.applianceType.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.brand.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.preferredModels.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applianceType || !formData.targetPurchasePrice) return;

    onAddProcurement({
      applianceType: formData.applianceType,
      brand: formData.brand,
      preferredModels: formData.preferredModels || 'أي موديل بحالة الفرز الأول',
      targetPurchasePrice: parseFloat(formData.targetPurchasePrice),
      maximumPurchasePrice: parseFloat(formData.maximumPurchasePrice || formData.targetPurchasePrice),
      priority: formData.priority,
      notes: formData.notes || undefined,
      status: 'open',
    });

    setIsModalOpen(false);
    setFormData({
      applianceType: 'ثلاجات',
      brand: 'توشيبا (Toshiba)',
      preferredModels: '',
      targetPurchasePrice: '',
      maximumPurchasePrice: '',
      priority: 'medium',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            مركز المشتريات وقائمة الطلبات (Procurement Center & Market Watch)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل قائمة طلبات الشراء المطلوبة للمعرض (Shopping List) ومتابعة عروض البيع المقدمة من العملاء تلقائياً.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة جهاز مطلوب للشراء
        </button>
      </div>

      {/* Market Watch Architecture Highlight Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-black text-white">معمارية المطابقة الذكية (Market Watch Architecture)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            عند إرسال أي عميل لطلب بيع جهاز عبر الموقع ينطبق مع المواصفات المطلوب شراؤها هنا، يبرز النظام التطابق فوراً للتواصل السريع.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold shrink-0">
          Architecture Active (No Automation Yet)
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="البحث بالرقم المرجعي (PROC-2026)، نوع الجهاز، أو الماركة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الكل ({procurementItems.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            مفتوح
          </button>
          <button
            onClick={() => setFilterStatus('searching')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'searching'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            جاري البحث
          </button>
          <button
            onClick={() => setFilterStatus('found')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'found'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            تم العثور
          </button>
        </div>
      </div>

      {/* Procurement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const statusConfig = STATUS_BADGES[item.status];
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-mono font-bold">
                    {item.referenceNumber}
                  </span>
                  <span className="text-xs font-black text-white">{item.applianceType}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusConfig.color}`}>
                  {statusConfig.labelAr}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-100">{item.brand}</h4>
                <p className="text-xs text-slate-300 font-bold leading-relaxed">
                  الموديلات والمدى الفني: {item.preferredModels}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold">السعر المستهدف</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {item.targetPurchasePrice.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold">أقصى سعر شراء</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {item.maximumPurchasePrice.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    ملاحظات: {item.notes}
                  </p>
                )}
              </div>

              {/* Market Watch Automatic Match Highlight Box */}
              {item.matchedSellRequestInfo && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 animate-bounce" />
                      تطابق تلقائي مع طلب بيع من عميل!
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                      طلب بيع رقم SR-901
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-bold space-y-1">
                    <div className="flex justify-between">
                      <span>العميل: {item.matchedSellRequestInfo.customerName}</span>
                      <span className="text-emerald-300 font-mono">
                        السعر المطلـوب: {item.matchedSellRequestInfo.askingPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>الموديل المعروض: {item.matchedSellRequestInfo.applianceModel}</span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <Phone className="w-3 h-3" /> {item.matchedSellRequestInfo.phone}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons to update status */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-bold">تغيير الحالة:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateStatus(item.id, 'searching')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-slate-800 cursor-pointer"
                  >
                    جاري البحث
                  </button>
                  <button
                    onClick={() => onUpdateStatus(item.id, 'found')}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-slate-800 cursor-pointer"
                  >
                    تم العثور
                  </button>
                  <button
                    onClick={() => onUpdateStatus(item.id, 'purchased')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer shadow-md"
                  >
                    شراء
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Procurement Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                إضافة طلب شراء جديد (PROC-2026)
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع الجهاز</label>
                <select
                  value={formData.applianceType}
                  onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="ثلاجات">ثلاجات</option>
                  <option value="غسالات ملابس">غسالات ملابس</option>
                  <option value="ديب فريزر">ديب فريزر</option>
                  <option value="شاشات">شاشات</option>
                  <option value="بوتاجازات">بوتاجازات</option>
                  <option value="تكييفات">تكييفات</option>
                  <option value="ميكروويف">ميكروويف</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الماركة المستهدفة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: توشيبا، سامسونج، إل جي..."
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الموديلات والمدى الفني المفضّل</label>
                <input
                  type="text"
                  placeholder="مثال: نوفروست 14 أو 16 قدم ديجيتال..."
                  value={formData.preferredModels}
                  onChange={(e) => setFormData({ ...formData, preferredModels: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">سعر الشراء المستهدف</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 11000"
                    value={formData.targetPurchasePrice}
                    onChange={(e) => setFormData({ ...formData, targetPurchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">أقصى سعر شراء مقبول</label>
                  <input
                    type="number"
                    placeholder="مثال: 13000"
                    value={formData.maximumPurchasePrice}
                    onChange={(e) => setFormData({ ...formData, maximumPurchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">درجة الأولوية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProcurementPriority })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="low">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عاجلة جداً (طلب عميل معلق)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="شروط الضمان أو النقل..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-black hover:bg-purple-500 shadow-lg shadow-purple-600/20 cursor-pointer"
                >
                  حفظ إضافة الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
