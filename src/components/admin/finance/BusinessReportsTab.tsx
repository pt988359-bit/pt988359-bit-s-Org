import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
  FileQuestion,
} from 'lucide-react';
import { exportFinancialReport } from '../../../utils/adminFinanceStorage';
import { ProductCostSheet, ExpenseItem } from '../../../types/adminFinance';

interface BusinessReportsTabProps {
  costSheets?: ProductCostSheet[];
  expenses?: ExpenseItem[];
}

export const BusinessReportsTab: React.FC<BusinessReportsTabProps> = ({
  costSheets = [],
  expenses = [],
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Compute actual profitable items dynamically
  const { topProfitable, lowestProfitable } = useMemo(() => {
    const validSheets = costSheets
      .filter((s) => s.targetSellingPrice > 0)
      .map((s) => {
        const profit = s.targetSellingPrice - s.totalCost;
        const marginPct = (profit / s.targetSellingPrice) * 100;
        return {
          title: s.productTitle,
          category: s.category || 'أجهزة منزلية',
          profit,
          margin: `${marginPct.toFixed(1)}%`,
          marginPct,
          reason: profit < 0 ? 'تكلفة الجهاز تتجاوز سعر البيع المستهدف' : 'هامش ربح أقل من المستهدف',
        };
      });

    const top = [...validSheets]
      .filter((s) => s.profit > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const lowest = [...validSheets]
      .filter((s) => s.marginPct < 20)
      .sort((a, b) => a.marginPct - b.marginPct)
      .slice(0, 5);

    return { topProfitable: top, lowestProfitable: lowest };
  }, [costSheets]);

  // Compute highest expenses dynamically
  const highestExpenses = useMemo(() => {
    const activeExpenses = expenses.filter((e) => !e.isArchived);
    const totalExp = activeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    if (totalExp === 0 || activeExpenses.length === 0) {
      return [];
    }

    const categoryMap: Record<string, number> = {};
    activeExpenses.forEach((e) => {
      const label = e.categoryLabelAr || e.category || 'أخرى';
      categoryMap[label] = (categoryMap[label] || 0) + (e.amount || 0);
    });

    return Object.entries(categoryMap)
      .map(([cat, amount]) => {
        const pctNumber = Math.round((amount / totalExp) * 100);
        return {
          category: cat,
          amount,
          percent: `${pctNumber}%`,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [expenses]);

  return (
    <div className="space-y-6 dir-rtl">
      {/* Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            تقارير وتوجيهات تشغيل المعرض (Business Reports & Intelligence)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تحليل المنتجات الأكثر والأقل ربحية، توزيع المصروفات التشغيلية، واتجاهات الشراء والتصدير الفوري.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportFinancialReport('csv', period)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            تصدير CSV
          </button>
          <button
            onClick={() => exportFinancialReport('excel', period)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            تصدير Excel
          </button>
          <button
            onClick={() => exportFinancialReport('pdf', period)}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            تقرير PDF
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center justify-center sm:justify-start gap-2 max-w-md">
        <button
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          تقرير يومي
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          أسبوعي
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setPeriod('yearly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            period === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          سنوي
        </button>
      </div>

      {/* Top vs Lowest Profit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Profitable Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              الأجهزة الأكثر ربحية (Top Profitable Products)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              أعلى هامش
            </span>
          </div>

          <div className="space-y-3">
            {topProfitable.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <FileQuestion className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">لا توجد بيانات ربحية مسجلة حتى الآن</p>
                <p className="text-[11px] text-slate-500">يتم احتساب الأجهزة تلقائياً عند تسجيل تكلفة الأجهزة وسعر البيع المستهدف</p>
              </div>
            ) : (
              topProfitable.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{item.title}</span>
                    <span className="text-[10px] text-slate-400 block font-bold">{item.category}</span>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-emerald-400 block">+{item.profit.toLocaleString('ar-EG')} ج.م</span>
                    <span className="text-[10px] text-slate-400 block font-bold">هامش: {item.margin}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lowest Profit Products & Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              الأجهزة الأقل ربحية (Lowest Profit Items)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              تتطلب مراجعة
            </span>
          </div>

          <div className="space-y-3">
            {lowestProfitable.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                <TrendingUp className="w-8 h-8 text-emerald-500/50 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">لا توجد أجهزة بهامش ربح ضعيف أو سلبي</p>
                <p className="text-[11px] text-slate-500">كافة المنتجات المسجلة تحقق هامش الأمان أو لم تسجل تكاليفها بعد</p>
              </div>
            ) : (
              lowestProfitable.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{item.title}</span>
                    <span className="text-[10px] text-amber-400 block font-bold">تنبيه: {item.reason}</span>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-amber-400 block">+{item.profit.toLocaleString('ar-EG')} ج.م</span>
                    <span className="text-[10px] text-slate-400 block font-bold">هامش: {item.margin}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Highest Expenses Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-rose-400" />
          توزيع البنود الأكثر استهلاكاً للمصروفات (Highest Expenses Breakdown)
        </h3>

        {highestExpenses.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
            <PieChart className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">لا توجد مصروفات مسجلة حتى الآن (0 ج.م)</p>
            <p className="text-[11px] text-slate-500">يتم إظهار نسب وتوزيع المصروفات تلقائياً فور تسجيل المصروفات التشغيلية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {highestExpenses.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{exp.category}</span>
                  <span className="text-rose-400">{exp.percent}</span>
                </div>
                <div className="text-lg font-black text-white font-mono">
                  {exp.amount.toLocaleString('ar-EG')} ج.م
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: exp.percent }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
