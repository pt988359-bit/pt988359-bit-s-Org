import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Card, CardBody } from '../ui/Card';
import { getCategoryCover, generateCategoryCoverSvg } from '../../utils/categoryVisuals';
import {
  Refrigerator,
  WashingMachine,
  Tv,
  Wind,
  Flame,
  Coffee,
  Microwave,
  Package,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Refrigerator: <Refrigerator className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
  WashingMachine: <WashingMachine className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
  Tv: <Tv className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
  Wind: <Wind className="w-8 h-8 text-sky-600 dark:text-sky-400" />,
  Flame: <Flame className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
  Coffee: <Coffee className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
  Microwave: <Microwave className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
};

export const CategoriesPage: React.FC = () => {
  const { categories, products, navigateTo, setSelectedCategory } = useShowroom();

  const handleCategoryClick = (catId: string) => {
    if (typeof setSelectedCategory === 'function') {
      setSelectedCategory(catId);
    }
    navigateTo('products', { categoryId: catId });
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3 py-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-4 py-1.5 rounded-full">
          أقسام المعرض الرئيسية
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          تصفح أجهزة معرض PRO TECK حسب القسم
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          نقدم لكم أحدث الأجهزة المنزلية بفرع المعادي شارع 68، مفحوصة بالكامل مع ضمان معتمد وخيارات طلب الشراء أونلاين.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          const icon = iconMap[cat.iconName] || <Package className="w-8 h-8 text-blue-600" />;

          return (
            <Card
              key={cat.id}
              className="group hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={getCategoryCover(cat)}
                  alt={cat.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateCategoryCoverSvg(
                      cat.iconName,
                      cat.name,
                      cat.slug
                    );
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    {icon}
                  </div>
                  <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full shadow-md">
                    {catProducts.length} جهاز متاح
                  </span>
                </div>
              </div>

              <CardBody className="p-6 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    شامل الفحص والضمان
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                    استعرض الأجهزة
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
