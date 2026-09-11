import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { BarChart3, TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';

export const AdminAnalyticsView: React.FC = () => {
  const { analytics, products, reservations } = useShowroom();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            تقارير الأداء والمبيعات للمعرض
          </h2>
          <p className="text-xs text-slate-400 mt-1">مؤشرات الأداء الرئيسية ومبيعات الأقسام بفرع المعادي</p>
        </CardHeader>

        <CardBody className="p-6 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400">إجمالي المبيعات المحققة</span>
              <span className="text-2xl font-black text-emerald-400">1,845,000 ج.م</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400">عدد الأجهزة المباعة مؤخراً</span>
              <span className="text-2xl font-black text-blue-400">128 جهاز</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400">متوسط قيمة جهاز العربون</span>
              <span className="text-2xl font-black text-amber-400">1,000 ج.م</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-300">الأقسام الأكثر مبيعاً وإقبالاً بالمعرض:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.topCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold"
                >
                  <span className="text-white">{cat.categoryName}</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {cat.count} جهاز مسجل
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
