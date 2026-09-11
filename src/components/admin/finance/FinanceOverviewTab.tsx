import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PiggyBank,
  Wallet,
  Clock,
  AlertCircle,
  PackageCheck,
  PackagePlus,
  BookmarkCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { BusinessOverviewMetrics } from '../../../types/adminFinance';

interface FinanceOverviewTabProps {
  metrics: BusinessOverviewMetrics;
  onNavigateTab: (tabId: string) => void;
  onOpenAiAssistant: () => void;
}

export const FinanceOverviewTab: React.FC<FinanceOverviewTabProps> = ({
  metrics,
  onNavigateTab,
  onOpenAiAssistant,
}) => {
  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Banner & Quick AI Insight Trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-extrabold uppercase tracking-wide">
              نظرة عامة على التشغيل والمالية
            </span>
            <span className="text-xs text-slate-400">فرع المعادي شارع 68</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ملخص الأداء المالي والسيولة اليومية
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            متابعة دقيقة للإيرادات، المصروفات التشغيلية، تكاليف الصيانة والنقل، وصافي الربح المتوقع بدون تعقيدات محاسبية.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAiAssistant}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            توليد ملخص مالى بالذكاء الاصطناعي
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Today & Monthly Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إيرادات اليوم (المقبوضات)</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics.todayRevenue.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>مبيعات وعرابين اليوم</span>
            </div>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">مصروفات اليوم التشغيلية</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics.todayExpenses.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>نقل، صيانة، ونثريات اليوم</span>
            </div>
          </div>
        </div>

        {/* Estimated Today Profit */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">صافي الربح التقديري اليوم</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              +{metrics.estimatedTodayProfit.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-1">
              بعد خصم تكلفة البضائع المبيعة
            </div>
          </div>
        </div>

        {/* Monthly Profit */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">صافي أرباح الشهر الحالي</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {metrics.monthlyProfit.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">ج.م</span>
            </div>
            <div className="text-[11px] font-bold text-purple-400 mt-1">
              من إجمالي إيراد {metrics.monthlyRevenue.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Operational Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables & Outstanding Balances */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              المستحقات والمبيعات الآجلة
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              متابعة
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">متبقي مبيعات تحت التحصيل</span>
              <span className="text-sm font-black text-rose-400">
                {metrics.outstandingBalances.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('cash-register')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            فتح دفتر الخزينة والسيولة &larr;
          </button>
        </div>

        {/* Physical Stock Movement Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-blue-400" />
              حركة الأجهزة هذا الشهر
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              الشهر الحالي
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">أجهزة مباعة</span>
              <span className="text-lg font-black text-emerald-400">{metrics.productsSoldMonth}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">أجهزة مشتراة</span>
              <span className="text-lg font-black text-blue-400">{metrics.productsPurchasedMonth}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">أجهزة محجوزة</span>
              <span className="text-lg font-black text-purple-400">{metrics.productsReservedActive}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('procurement')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            استعراض مركز المشتريات والطلبات &larr;
          </button>
        </div>

        {/* Quick Operational Control Shortcuts */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              اختصارات العمليات التشغيلية
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              وصول سريع لأهم الأدوات اليومية لإدارة الأرباح والمصروفات
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigateTab('expense-center')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right space-y-1 cursor-pointer transition-all"
            >
              <span className="text-xs font-bold text-white block">تسجيل مصروف</span>
              <span className="text-[10px] text-slate-400 block">نقل، صيانة، نثريات</span>
            </button>

            <button
              onClick={() => onNavigateTab('profit-simulator')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right space-y-1 cursor-pointer transition-all"
            >
              <span className="text-xs font-bold text-emerald-400 block">محاكي الربح</span>
              <span className="text-[10px] text-slate-400 block">اختبار سعر البيع</span>
            </button>

            <button
              onClick={() => onNavigateTab('cost-center')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right space-y-1 cursor-pointer transition-all"
            >
              <span className="text-xs font-bold text-blue-400 block">تكلُفة الأجهزة</span>
              <span className="text-[10px] text-slate-400 block">شراء + صيانة + شحن</span>
            </button>

            <button
              onClick={() => onNavigateTab('suppliers')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right space-y-1 cursor-pointer transition-all"
            >
              <span className="text-xs font-bold text-purple-400 block">دليل الموردين</span>
              <span className="text-[10px] text-slate-400 block">شركات وأفراد</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
