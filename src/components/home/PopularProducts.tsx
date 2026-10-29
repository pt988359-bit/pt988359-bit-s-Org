import React from 'react';
import { Eye, Flame, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../../constants/placeholders';

interface PopularProductsProps {
  onQuickView: (product: Product) => void;
}

export const PopularProducts: React.FC<PopularProductsProps> = ({ onQuickView }) => {
  const { products, isLoadingProducts, navigateTo } = useShowroom();

  // Sort by isFeatured first, then newest (createdAt descending)
  const popularProducts = [...products]
    .filter(p => p.status === 'available' || p.availabilityStatus === 'available')
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>الأكثر طلباً ومشاهدة هذا الأسبوع</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            الأجهزة الأكثر شعبية
          </h2>
        </div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>شاهد كل المنتجات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      {isLoadingProducts && popularProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/50 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Product Badges */}
            <div className="flex items-center justify-end mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                product.condition === 'new'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : product.condition === 'used_warranty' || product.condition === 'refurbished'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                {product.condition === 'new'
                  ? 'جديد'
                  : product.condition === 'used_warranty' || product.condition === 'refurbished'
                  ? 'مستعمل بضمان الشركة'
                  : 'مستعمل بدون ضمان'}
              </span>
            </div>

            {/* Product Image */}
            <div
              onClick={() => navigateTo('product-detail', { productId: product.id })}
              className="relative w-full h-48 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4 cursor-pointer"
            >
              <img
                src={product.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER}
                alt={product.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                }}
                className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
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
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {(product.price || 0).toLocaleString('ar-EG')} ج.م
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {product.originalPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                )}
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
                  onClick={() => navigateTo('product-detail', { productId: product.id })}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>التفاصيل</span>
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
