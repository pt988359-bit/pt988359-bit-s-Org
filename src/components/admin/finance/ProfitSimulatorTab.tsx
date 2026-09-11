import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
  RotateCcw,
  Lock,
  Unlock,
} from 'lucide-react';
import { ProductCostSheet } from '../../../types/adminFinance';
import { calculateProfitSimulation } from '../../../utils/adminFinanceStorage';

interface ProfitSimulatorTabProps {
  costSheets: ProductCostSheet[];
}

export const ProfitSimulatorTab: React.FC<ProfitSimulatorTabProps> = ({ costSheets }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    costSheets.length > 0 ? costSheets[0].productId : ''
  );

  const activeSheet = costSheets.find((s) => s.productId === selectedProductId) || costSheets[0];

  const [testPrice, setTestPrice] = useState<number>(activeSheet ? activeSheet.targetSellingPrice : 0);
  const [adminOverride, setAdminOverride] = useState<boolean>(false);

  // Update test price when product changes
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const sheet = costSheets.find((s) => s.productId === productId);
    if (sheet) {
      setTestPrice(sheet.targetSellingPrice);
      setAdminOverride(false);
    }
  };

  const simResult = activeSheet
    ? calculateProfitSimulation(activeSheet.totalCost, testPrice, activeSheet.minimumAcceptablePrice)
    : null;

  if (costSheets.length === 0 || !activeSheet || !simResult) {
    return (
      <div className="space-y-6 dir-rtl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            محاكي الأرباح وتحديد أمان الفصال (Profit & Negotiation Safety Simulator)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أداة محاكاة حية لاختبار سيناريوهات الخصومات أثناء فصال العملاء وحماية هامش الربح الأدنى بدون تخطي الخط الأحمر.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <Sliders className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد بطاقات تكلفة للأجهزة حالياً</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            سيتم تفعيل محاكي الربح وهامش الأمان تلقائياً فور إضافة أو تسجيل تكلفة جهاز في تبويب "تكاليف الأجهزة".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          محاكي الأرباح وتحديد أمان الفصال (Profit & Negotiation Safety Simulator)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          أداة محاكاة حية لاختبار سيناريوهات الخصومات أثناء فصال العملاء وحماية هامش الربح الأدنى بدون تخطي الخط الأحمر.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs & Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Select Product */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">اختر الجهاز للمحاكاة</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-bold"
            >
              {costSheets.map((sheet) => (
                <option key={sheet.productId} value={sheet.productId}>
                  {sheet.productTitle} - (التكلفة: {sheet.totalCost.toLocaleString('ar-EG')} ج.م)
                </option>
              ))}
            </select>
          </div>

          {activeSheet && (
            <>
              {/* Cost Summary Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>التكلفة الفعلية الكلية:</span>
                  <span className="text-emerald-400 font-mono">{activeSheet.totalCost.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>السعر المستهدف المعلن:</span>
                  <span className="text-blue-400 font-mono">{activeSheet.targetSellingPrice.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>الحد الأدنى المقبول للبيع:</span>
                  <span className="text-amber-400 font-mono">{activeSheet.minimumAcceptablePrice.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {/* Slider for proposed selling price */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">سعر البيع المقترح بعد الفصال</label>
                  <span className="text-lg font-black text-indigo-400 font-mono">
                    {testPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <input
                  type="range"
                  min={activeSheet.totalCost - 1000}
                  max={activeSheet.targetSellingPrice + 3000}
                  step={250}
                  value={testPrice}
                  onChange={(e) => setTestPrice(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                {/* Direct Numeric Input */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-bold">إدخال مباشر:</span>
                  <input
                    type="number"
                    step={100}
                    value={testPrice}
                    onChange={(e) => setTestPrice(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => setTestPrice(activeSheet.targetSellingPrice)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    title="إعادة للسعر المستهدف الاصلي"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admin Override Lock Checkbox */}
              {simResult && simResult.safetyZoneStatus === 'danger' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <ShieldAlert className="w-5 h-5" />
                    <span>تم تجاوز الحد الأدنى المقبول لقواعد العمل!</span>
                  </div>
                  <p className="text-[11px] text-rose-300 leading-relaxed">
                    قواعد العمل تمنع تخفيض السعر تحت {activeSheet.minimumAcceptablePrice.toLocaleString('ar-EG')} ج.م لمنع الخسارة التشغيلية.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                    <input
                      type="checkbox"
                      checked={adminOverride}
                      onChange={(e) => setAdminOverride(e.target.checked)}
                      className="rounded bg-slate-950 border-rose-500 text-rose-600 focus:ring-rose-500"
                    />
                    <span>تأكيد التجاوز الاستثنائي من الأدمن الرئيسي (Override)</span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Simulation Dashboard & Visual Meter (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <>
              {/* Visual Profit Meter */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    مؤشر أمان الربح (Visual Profit Meter)
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                      simResult.safetyZoneStatus === 'safe'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : simResult.safetyZoneStatus === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {simResult.safetyZoneStatus === 'safe' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {simResult.safetyZoneStatus === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {simResult.safetyZoneStatus === 'danger' && <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>
                      {simResult.safetyZoneStatus === 'safe' && 'منطقة أمان كاملة'}
                      {simResult.safetyZoneStatus === 'warning' && 'هامش ربح ضئيل'}
                      {simResult.safetyZoneStatus === 'danger' && 'منطقة خطرة (خسارة أو أقل من الحد)'}
                    </span>
                  </span>
                </div>

                {/* Progress Bar Gauge */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        simResult.safetyZoneStatus === 'safe'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                          : simResult.safetyZoneStatus === 'warning'
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-700 to-rose-500 animate-pulse'
                      }`}
                      style={{
                        width: `${Math.min(Math.max(simResult.profitMarginPercent * 3, 5), 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>التكلفة ({activeSheet.totalCost.toLocaleString('ar-EG')} ج.م)</span>
                    <span>الحد الأدنى ({activeSheet.minimumAcceptablePrice.toLocaleString('ar-EG')} ج.م)</span>
                    <span>المستهدف ({activeSheet.targetSellingPrice.toLocaleString('ar-EG')} ج.م)</span>
                  </div>
                </div>

                {/* KPI Result Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">مجمل الربح (Gross Profit)</span>
                    <span
                      className={`text-xl font-black ${
                        simResult.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simResult.grossProfit >= 0 ? '+' : ''}
                      {simResult.grossProfit.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">نسبة هامش الربح</span>
                    <span
                      className={`text-xl font-black ${
                        simResult.profitMarginPercent >= 20
                          ? 'text-emerald-400'
                          : simResult.profitMarginPercent >= 10
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simResult.profitMarginPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-bold text-slate-400 block">أقصى خصم مسموح به</span>
                    <span className="text-xl font-black text-blue-400">
                      {(activeSheet.targetSellingPrice - activeSheet.minimumAcceptablePrice).toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                </div>

                {/* Warning Banner if Low Profit */}
                {simResult.warningMessage && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-start gap-2 leading-relaxed">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                    <span>{simResult.warningMessage}</span>
                  </div>
                )}
              </div>

              {/* Scenario Comparison Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white">مقارنة سيناريوهات التفاوض (Scenario Comparison)</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="pb-3">السيناريو</th>
                        <th className="pb-3">سعر البيع</th>
                        <th className="pb-3">مجمل الربح</th>
                        <th className="pb-3">هامش الربح</th>
                        <th className="pb-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-bold">
                      <tr className="hover:bg-slate-950/40">
                        <td className="py-3 text-slate-200">1. السعر المعلن الكامل</td>
                        <td className="py-3 font-mono">{activeSheet.targetSellingPrice.toLocaleString('ar-EG')} ج.م</td>
                        <td className="py-3 text-emerald-400 font-mono">
                          +{(activeSheet.targetSellingPrice - activeSheet.totalCost).toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-3 text-emerald-400">
                          {(((activeSheet.targetSellingPrice - activeSheet.totalCost) / activeSheet.targetSellingPrice) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ربح ممتاز
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-950/40">
                        <td className="py-3 text-slate-200">2. خصم فصال عادي (5%)</td>
                        <td className="py-3 font-mono">{(activeSheet.targetSellingPrice * 0.95).toLocaleString('ar-EG')} ج.م</td>
                        <td className="py-3 text-blue-400 font-mono">
                          +{(activeSheet.targetSellingPrice * 0.95 - activeSheet.totalCost).toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-3 text-blue-400">
                          {(((activeSheet.targetSellingPrice * 0.95 - activeSheet.totalCost) / (activeSheet.targetSellingPrice * 0.95)) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            موصى به
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-950/40">
                        <td className="py-3 text-slate-200">3. الحد الأدنى للبيع (الخط الأحمر)</td>
                        <td className="py-3 font-mono text-amber-300">{activeSheet.minimumAcceptablePrice.toLocaleString('ar-EG')} ج.م</td>
                        <td className="py-3 text-amber-400 font-mono">
                          +{(activeSheet.minimumAcceptablePrice - activeSheet.totalCost).toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-3 text-amber-400">
                          {(((activeSheet.minimumAcceptablePrice - activeSheet.totalCost) / activeSheet.minimumAcceptablePrice) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            أدنى مقبول
                          </span>
                        </td>
                      </tr>

                      <tr className="bg-indigo-950/30 font-black">
                        <td className="py-3 text-indigo-300">4. السعر المختبر حالياً في المحاكاة</td>
                        <td className="py-3 font-mono text-indigo-300">{testPrice.toLocaleString('ar-EG')} ج.م</td>
                        <td className="py-3 font-mono text-indigo-300">
                          {simResult.grossProfit >= 0 ? '+' : ''}
                          {simResult.grossProfit.toLocaleString('ar-EG')} ج.م
                        </td>
                        <td className="py-3 text-indigo-300">{simResult.profitMarginPercent.toFixed(1)}%</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            النتيجة الحالية
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
