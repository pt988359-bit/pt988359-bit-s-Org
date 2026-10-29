import React from 'react';
import { X, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { useShowroom } from '../../context/ShowroomContext';
import { Button } from '../ui/Button';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../../constants/placeholders';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { navigateTo } = useShowroom();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center relative min-h-[260px]">
          <img
            src={product.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER}
            alt={product.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
            }}
            className="max-h-72 object-contain rounded-2xl drop-shadow-md"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              product.condition === 'new'
                ? 'bg-emerald-500 text-white'
                : product.condition === 'used_warranty' || product.condition === 'refurbished'
                ? 'bg-blue-600 text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {product.condition === 'new'
                ? 'جديد بالضمان'
                : product.condition === 'used_warranty' || product.condition === 'refurbished'
                ? `مستعمل بضمان الشركة (${product.conditionRating ? `${product.conditionRating}/10` : 'كالجديد'})`
                : `مستعمل بدون ضمان (${product.conditionRating ? `${product.conditionRating}/10` : 'كالجديد'})`}
            </span>
            {product.isNegotiable && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                قابل للتفاوض
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              <span>{product.brand}</span>
              {product.model && <span>• {product.model}</span>}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {product.title}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {(product.price || 0).toLocaleString('ar-EG')} ج.م
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through font-medium">
                  {product.originalPrice.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Warranty & Location badges */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ضمان: {product.warranty ? 'ضمان المعرض المعتمد' : 'بدون ضمان'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="line-clamp-1">{product.showroomLocation}</span>
              </div>
            </div>

            {/* Highlights Specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {product.specs.slice(0, 4).map((spec, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl text-[11px]">
                    <span className="block text-slate-400 text-[10px]">{spec.label}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 mt-4">
            <Button
              variant="electric"
              size="md"
              className="w-full"
              rightIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => {
                onClose();
                navigateTo('product-detail', { productId: product.id });
              }}
            >
              عرض التفاصيل الكاملة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
