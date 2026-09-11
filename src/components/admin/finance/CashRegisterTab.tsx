import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpLeft,
  ArrowDownRight,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Calendar,
  User,
  Hash,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { CashLedgerEntry } from '../../../types/adminFinance';

interface CashRegisterTabProps {
  ledger: CashLedgerEntry[];
  onAddEntry: (entry: {
    type: 'money_in' | 'money_out';
    category: string;
    amount: number;
    description: string;
    relatedReference?: string;
    createdBy: string;
  }) => void;
}

export const CashRegisterTab: React.FC<CashRegisterTabProps> = ({ ledger, onAddEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'money_in' | 'money_out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: 'money_in' as 'money_in' | 'money_out',
    category: 'تحصيل كاش',
    amount: '',
    description: '',
    relatedReference: '',
    createdBy: 'PRO TECK Admin',
  });

  const currentRunningBalance = ledger.length > 0 ? (ledger[0].runningBalance ?? 0) : 0;

  // Calculate today's totals
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = ledger.filter((l) => l.timestamp.startsWith(todayStr));

  const todayIn = todayEntries.filter((e) => e.type === 'money_in').reduce((sum, e) => sum + e.amount, 0);
  const todayOut = todayEntries.filter((e) => e.type === 'money_out').reduce((sum, e) => sum + e.amount, 0);
  const todayNet = todayIn - todayOut;

  const filteredLedger = ledger.filter((entry) => {
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (
      searchTerm &&
      !entry.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !entry.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !entry.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    onAddEntry({
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      relatedReference: formData.relatedReference || undefined,
      createdBy: formData.createdBy,
    });

    setIsModalOpen(false);
    setFormData({
      type: 'money_in',
      category: 'تحصيل كاش',
      amount: '',
      description: '',
      relatedReference: '',
      createdBy: 'PRO TECK Admin',
    });
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            دفتر الخزينة والسيولة اليومية (Cash Register Ledger)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل حركة المقبوضات والمدفوعات النقدية والتحويلات برقم مرجعي موحد (FIN-2026) وحساب الرصيد الجاري فوراً.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة حركة خزينة جديدة
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Running Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <span className="text-xs font-bold text-slate-400 block">الرصيد الجاري الحالي بالخزينة</span>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {currentRunningBalance.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-500 font-bold block">محدث تلقائياً مع كل حركة مقبوضات أو مدفوعات</span>
        </div>

        {/* Today's Money In */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">مقبوضات اليوم (Money In)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            +{todayIn.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block">تحصيلات مبيعات وعرابين اليوم</span>
        </div>

        {/* Today's Money Out */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">مدفوعات اليوم (Money Out)</span>
            <ArrowUpLeft className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            -{todayOut.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
          <span className="text-[11px] text-rose-400 font-bold block">نولون ونثريات وصيانة اليوم</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="البحث بالرقم المرجعي (FIN-2026)، البيان، أو الفئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
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
            جميع الحركات
          </button>
          <button
            onClick={() => setFilterType('money_in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'money_in'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            مقبوضات (+)
          </button>
          <button
            onClick={() => setFilterType('money_out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'money_out'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            مدفوعات (-)
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                <th className="p-4">الرقم المرجعي</th>
                <th className="p-4">نوع الحركة</th>
                <th className="p-4">الفئة والتصنيف</th>
                <th className="p-4">البيان والسبب</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">الرصيد الجاري</th>
                <th className="p-4">المُسجّل والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">لا توجد حركات خزينة مسجلة حتى الآن (الرصيد: 0 ج.م)</p>
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{entry.referenceNumber}</td>
                    <td className="p-4">
                      {entry.type === 'money_in' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px] inline-flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3" /> مقبوضات (+I)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[11px] inline-flex items-center gap-1">
                          <ArrowUpLeft className="w-3 h-3" /> مدفوعات (-O)
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-300">{entry.category}</td>
                    <td className="p-4 font-bold text-white max-w-xs">{entry.description}</td>
                    <td className="p-4 font-mono font-black text-sm">
                      <span className={entry.type === 'money_in' ? 'text-emerald-400' : 'text-rose-400'}>
                        {entry.type === 'money_in' ? '+' : '-'}
                        {entry.amount.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {entry.runningBalance.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-4 text-slate-400 space-y-0.5">
                      <span className="block font-bold text-slate-300">{entry.createdBy}</span>
                      <span className="block text-[10px]">{new Date(entry.timestamp).toLocaleString('ar-EG')}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal New Cash Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                تسجيل حركة خزينة جديدة (FIN-2026)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'money_in', category: 'تحصيل كاش' })}
                  className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
                    formData.type === 'money_in'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> مقبوضات (إدخال سيولة)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'money_out', category: 'صرف نثريات' })}
                  className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer ${
                    formData.type === 'money_out'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <ArrowUpLeft className="w-4 h-4" /> مدفوعات (خروج سيولة)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">فئة التصنيف</label>
                <input
                  type="text"
                  placeholder="مثال: عربون حجز، تحصيل فاتورة، نولون سائق..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ (جنية مصري)</label>
                <input
                  type="number"
                  required
                  placeholder="المبلغ بالجنيه"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البيان والتفاصيل</label>
                <textarea
                  required
                  rows={2}
                  placeholder="سبب الحركة والجهة المتعامل معها..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مرجع إضافي (اختياري)</label>
                  <input
                    type="text"
                    placeholder="رقم الفاتورة أو الحجز"
                    value={formData.relatedReference}
                    onChange={(e) => setFormData({ ...formData, relatedReference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المُسجّل</label>
                  <input
                    type="text"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  تسجيل بالخزينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
