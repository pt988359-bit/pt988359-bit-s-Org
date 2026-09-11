import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Archive,
  Paperclip,
  CheckCircle2,
  Tag,
  DollarSign,
  User,
  Calendar,
  Layers,
  Building,
  Wrench,
  Truck,
  Sparkles,
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory } from '../../../types/adminFinance';

interface ExpenseCenterTabProps {
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'referenceNumber' | 'isArchived'>) => void;
  onArchiveExpense: (id: string) => void;
}

const CATEGORIES_CONFIG: { id: ExpenseCategory; labelAr: string; icon: string }[] = [
  { id: 'transportation', labelAr: 'نقل وشحن', icon: '🚚' },
  { id: 'repair', labelAr: 'صيانة وفحص', icon: '🔧' },
  { id: 'cleaning', labelAr: 'تنظيف وتعقيم', icon: '✨' },
  { id: 'replacement_parts', labelAr: 'قطع غيار واستبدال', icon: '⚙️' },
  { id: 'accessories', labelAr: 'إكسسوارات وكابلات', icon: '🔌' },
  { id: 'packaging', labelAr: 'تغليف وحماية', icon: '📦' },
  { id: 'maintenance', labelAr: 'صيانة مقر المعرض', icon: '🛠️' },
  { id: 'utilities', labelAr: 'مرافق (كهرباء ومياه)', icon: '💡' },
  { id: 'marketing', labelAr: 'تسويق وإعلانات', icon: '📢' },
  { id: 'rent', labelAr: 'إيجار فرع المعادي', icon: '🏢' },
  { id: 'salaries', labelAr: 'رواتب ونسب الفنيين', icon: '💼' },
  { id: 'miscellaneous', labelAr: 'مصروفات نثرية متنوعة', icon: '📝' },
];

export const ExpenseCenterTab: React.FC<ExpenseCenterTabProps> = ({
  expenses,
  onAddExpense,
  onArchiveExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new expense
  const [formData, setFormData] = useState({
    category: 'transportation' as ExpenseCategory,
    amount: '',
    description: '',
    relatedProductTitle: '',
    supplierName: '',
    createdBy: 'PRO TECK Admin',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredExpenses = expenses.filter((e) => {
    if (e.isArchived !== showArchived) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (
      searchTerm &&
      !e.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !e.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(e.relatedProductTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const catObj = CATEGORIES_CONFIG.find((c) => c.id === formData.category);

    onAddExpense({
      category: formData.category,
      categoryLabelAr: catObj ? catObj.labelAr : 'مصروف',
      amount: parseFloat(formData.amount),
      description: formData.description,
      relatedProductTitle: formData.relatedProductTitle || undefined,
      supplierName: formData.supplierName || undefined,
      createdBy: formData.createdBy,
      date: formData.date,
      notes: formData.notes || undefined,
    });

    setIsModalOpen(false);
    setFormData({
      category: 'transportation',
      amount: '',
      description: '',
      relatedProductTitle: '',
      supplierName: '',
      createdBy: 'PRO TECK Admin',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            مركز المصروفات التشغيلية
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل وأرشفة كافة مصروفات النقل، الصيانة، قطع الغيار، والنثريات برقم مرجعي موحد (EXP-2026)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تسجيل مصروف جديد
        </button>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="البحث بالرقم المرجعي (EXP-2026)، الوصف، أو اسم الجهاز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Archive Toggle & Summary */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                showArchived
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>{showArchived ? 'عرض الحالية' : 'المستندات المؤرشفة'}</span>
            </button>

            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-emerald-400">
              إجمالي المعروض: {totalFilteredAmount.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
        </div>

        {/* Categories Horizontal Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            الكل ({expenses.length})
          </button>
          {CATEGORIES_CONFIG.map((cat) => {
            const count = expenses.filter((e) => e.category === cat.id && !e.isArchived).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.labelAr}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">لا توجد سجلات مصروفات مطابقة للبحث</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredExpenses.map((expense) => {
              const catObj = CATEGORIES_CONFIG.find((c) => c.id === expense.category);
              return (
                <div
                  key={expense.id}
                  className="p-4 sm:p-5 hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono font-bold">
                        {expense.referenceNumber}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1">
                        <span>{catObj?.icon}</span>
                        <span>{expense.categoryLabelAr}</span>
                      </span>

                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {expense.date}
                      </span>

                      <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        بواسطة: {expense.createdBy}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-100 leading-relaxed">
                      {expense.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      {expense.relatedProductTitle && (
                        <span className="text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-blue-400" />
                          الجهاز المرتبط: {expense.relatedProductTitle}
                        </span>
                      )}

                      {expense.supplierName && (
                        <span className="text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-purple-400" />
                          المورد: {expense.supplierName}
                        </span>
                      )}

                      {expense.notes && (
                        <span className="text-slate-400 italic text-[11px]">
                          ملاحظة: {expense.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-bold">المبلغ المدفوع</span>
                      <span className="text-lg font-black text-rose-400 tracking-tight">
                        {expense.amount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    {!expense.isArchived && (
                      <button
                        onClick={() => onArchiveExpense(expense.id)}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 border border-slate-800 transition-all cursor-pointer"
                        title="أرشفة السجل المالي (حفظ في الأرشيف)"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                تسجيل مصروف جديد برقم مرجعي
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تصنيف المصروف</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES_CONFIG.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ (جنية مصري)</label>
                <input
                  type="number"
                  required
                  placeholder="مثال: 450"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تفاصيل المصروف والسبب</label>
                <textarea
                  required
                  rows={2}
                  placeholder="اكتب بيان المصروف بدقة (مثال: نولون نقل ثلاجة توشيبا 14 قدم من العميل بالمعادي...)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الجهاز المرتبط (اختياري)</label>
                  <input
                    type="text"
                    placeholder="اسم الجهاز أو الكود"
                    value={formData.relatedProductTitle}
                    onChange={(e) => setFormData({ ...formData, relatedProductTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المورد (اختياري)</label>
                  <input
                    type="text"
                    placeholder="اسم الشركة أو الفني"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">التاريخ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مُسجّل المصروف</label>
                  <input
                    type="text"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="رقم الفاتورة، طريقة الدفع..."
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
                  حفظ وتسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
