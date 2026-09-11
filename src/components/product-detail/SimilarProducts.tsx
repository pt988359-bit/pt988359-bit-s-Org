import React from 'react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';
import { Badge } from '../ui/Badge';
import { ArrowLeft, Eye } from 'lucide-react';

interface SimilarProductsProps {
  currentProduct: Product;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct }) => {
  const { products, navigateTo, settings } = useShowroom();

  // Price range calculation (+/- 20%)
  const minPrice = currentProduct.price * 0.8;
  const maxPrice = currentProduct.price * 1.2;

  // 1. Strict match: available status AND same category AND same brand AND price +/- 20%
  let matchedItems = products.filter(
    (p) =>
      p.status === 'available' &&
      p.id !== currentProduct.id &&
      p.categoryId === currentProduct.categoryId &&
      p.brand === currentProduct.brand &&
      p.price >= minPrice &&
      p.price <= maxPrice
  );

  // 2. If less than 6, add available items with same category AND price +/- 20%
  if (matchedItems.length < 6) {
    const additionalByCategoryPrice = products.filter(
      (p) =>
        p.status === 'available' &&
        p.id !== currentProduct.id &&
        !matchedItems.some((m) => m.id === p.id) &&
        p.categoryId === currentProduct.categoryId &&
        p.price >= minPrice &&
        p.price <= maxPrice
    );
    matchedItems = [...matchedItems, ...additionalByCategoryPrice];
  }

  // 3. Fallback: latest available products in same category
  if (matchedItems.length < 6) {
    const fallbackCategory = products.filter(
      (p) =>
        p.status === 'available' &&
        p.id !== currentProduct.id &&
        !matchedItems.some((m) => m.id === p.id) &&
        p.categoryId === currentProduct.categoryId
    );
    matchedItems = [...matchedItems, ...fallbackCategory];
  }

  const finalItems = matchedItems.slice(0, 6);

  if (finalItems.length === 0) return null;

  return (
    <section className="space-y-4 pt-4 dir-rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">أجهزة مقترحة ذات صلة</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ترشيحات ذكية بناءً على الفئة، الماركة، والنطاق السعري المقارب
          </p>
        </div>

        <button
          onClick={() => navigateTo('products')}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>عرض كافة الأجهزة</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {finalItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigateTo('product-detail', { productId: item.id })}
            className="group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={item.images?.[0] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <Badge condition={item.condition} size="sm" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-blue-500 font-bold block">{item.brand}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {item.price.toLocaleString()} {settings.currencySymbol}
              </span>
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
