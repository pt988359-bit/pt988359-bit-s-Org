import React from 'react';
import { Sparkles, ShieldCheck, Tag, Eye, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';

interface FeaturedHeroProps {
  onQuickView: (product: Product) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({ onQuickView }) => {
  const { products, isLoadingProducts, navigateTo } = useShowroom();
  
  // Get featured products or fall back to available products
  const featuredProducts = products.filter(p => p.isFeatured || p.status === 'available').slice(0, 4);

  return (
    <section className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>معرض الأجهزة الفاخرة الموصى بها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            الأجهزة المميزة بالمعرض
          </h2>
        </div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>عرض كافة الأجهزة ({products.filter(p => p.status === 'available').length})</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Premium Featured Products Carousel / Grid */}
      {isLoadingProducts && featuredProducts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/50 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Badges Overlay */}
            <div className="flex items-center justify-between gap-2 z-10 mb-3">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs ${
                product.condition === 'new'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {product.condition === 'new' ? 'جديد بالضمان' : `مستعمل بحالة ${product.conditionRating ? `${product.conditionRating}/10` : 'ممتازة'}`}
              </span>

              <div className="flex items-center gap-1">
                {product.isNegotiable && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    قابل للتفاوض
                  </span>
                )}
                {product.warranty && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>ضمان معتمد</span>
                  </span>
                )}
              </div>
            </div>

            {/* Product Image Container */}
            <div 
              onClick={() => navigateTo('product-detail', { productId: product.id })}
              className="relative w-full h-52 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4 cursor-pointer group-hover:bg-slate-100/80 dark:group-hover:bg-slate-900/80 transition-colors"
            >
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'}
                alt={product.title}
                className="max-h-44 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
              />

              {/* Quick View Floating Button on Hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة سريعة</span>
              </button>
            </div>

            {/* Content & Information */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {product.brand}
              </span>

              <h3 
                onClick={() => navigateTo('product-detail', { productId: product.id })}
                className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer min-h-[40px]"
              >
                {product.title}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {(product.price || 0).toLocaleString('ar-EG')} ج.م
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    {product.originalPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                )}
              </div>

              {/* Quick View Bottom Action */}
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onQuickView(product)}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة سريعة</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
  );
};
