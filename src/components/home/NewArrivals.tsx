import React from 'react';
import { Sparkles, Eye, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';

interface NewArrivalsProps {
  onQuickView: (product: Product) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onQuickView }) => {
  const { products, isLoadingProducts, navigateTo, addToCart } = useShowroom();

  // Get products sorted by createdAt descending
  const newArrivals = [...products]
    .filter(p => p.status === 'available' || p.availabilityStatus === 'available')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>وصل حديثاً لمعرض المعادي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            أحدث الأجهزة المضافة
          </h2>
        </div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>تصفح الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of New Arrivals with animated cards */}
      {isLoadingProducts && newArrivals.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/50 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 flex flex-col justify-between"
          >
            {/* New Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs">
                جديد المعرض ✨
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                product.condition === 'new'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                {product.condition === 'new' ? 'زيرو بالكرتونة' : `مستعمل ${product.conditionRating ? `${product.conditionRating}/10` : 'كالجديد'}`}
              </span>
            </div>

            {/* Image Container */}
            <div
              onClick={() => navigateTo('product-detail', { productId: product.id })}
              className="relative w-full h-48 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4 cursor-pointer"
            >
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'}
                alt={product.title}
                className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {product.brand}
              </span>

              <h3
                onClick={() => navigateTo('product-detail', { productId: product.id })}
                className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer min-h-[40px]"
              >
                {product.title}
              </h3>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {(product.price || 0).toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  متاح بفرع المعادي
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onQuickView(product)}
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(product);
                    navigateTo('reservation');
                  }}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>حجز</span>
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
