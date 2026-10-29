import React from 'react';
import { 
  Refrigerator, 
  WashingMachine, 
  Tv, 
  Flame, 
  Wind, 
  Microwave, 
  Layers, 
  ArrowLeft,
  Grid
} from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { Category } from '../../types';
import { getCategoryCover, generateCategoryCoverSvg } from '../../utils/categoryVisuals';

export const CategoryGrid: React.FC = () => {
  const { categories, products, navigateTo } = useShowroom();

  // Helper function to render Category Icon dynamically
  const renderCategoryIcon = (iconName: string) => {
    const props = { className: "w-8 h-8 text-blue-600 dark:text-blue-400" };
    switch (iconName.toLowerCase()) {
      case 'refrigerator':
        return <Refrigerator {...props} />;
      case 'washingmachine':
        return <WashingMachine {...props} />;
      case 'tv':
        return <Tv {...props} />;
      case 'flame':
        return <Flame {...props} />;
      case 'wind':
        return <Wind {...props} />;
      case 'microwave':
        return <Microwave {...props} />;
      default:
        return <Layers {...props} />;
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <Grid className="w-4 h-4" />
            <span>تصنيفات المعرض الرئيسية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            أقسام الأجهزة المتاحة
          </h2>
        </div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>عرض كافة التصنيفات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          // Compute number of available products dynamically
          const availableCount = products.filter(
            p => p.categoryId === category.id && p.status === 'available'
          ).length;

          return (
            <div
              key={category.id}
              onClick={() => navigateTo('products', { categoryId: category.id })}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Category Cover Image with Gradient Overlay */}
              <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img
                  src={getCategoryCover(category)}
                  alt={category.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateCategoryCoverSvg(
                      category.iconName,
                      category.name,
                      category.slug
                    );
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 dark:brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                {/* Number of Available Products Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700 shadow-md">
                  {availableCount > 0 ? `${availableCount} أجهزة متوفرة` : 'جديد بالمعرض'}
                </div>

                {/* Floating Large Icon */}
                <div className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {renderCategoryIcon(category.iconName)}
                </div>
              </div>

              {/* Category Text Content */}
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{category.name}</span>
                  <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
