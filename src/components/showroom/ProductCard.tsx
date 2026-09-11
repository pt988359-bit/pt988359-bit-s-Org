import React, { useState } from 'react';
import { ShieldCheck, Tag } from 'lucide-react';
import { ProductImage } from '../ui/ProductImage';

export interface ProductCardProps {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  brandLogoUrl?: string;
  category?: string;
  condition?: string;
  warrantyPeriod?: string;
  onSelect?: (id: string) => void;
}

/**
 * Brand Logo Component with Inline SVG / CSS Fallback
 * Never requests missing static assets like placeholder-brand.png
 */
export const BrandLogoFallback: React.FC<{ brandName?: string; logoUrl?: string; className?: string }> = ({
  brandName = 'PRO TECK',
  logoUrl,
  className = 'w-6 h-6',
}) => {
  const [imgError, setImgError] = useState(false);

  // Use inline SVG fallback if logoUrl is missing, invalid, or pointing to missing assets like placeholder-brand.png
  const isInvalidOrMissingAsset = !logoUrl || logoUrl.includes('placeholder-brand.png') || imgError;

  if (isInvalidOrMissingAsset) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-slate-600 dark:text-slate-300 ${className}`}
        title={brandName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={brandName}
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  brand,
  model,
  price,
  originalPrice,
  imageUrl,
  brandLogoUrl,
  category,
  condition,
  warrantyPeriod,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect?.(id)}
      className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
        <ProductImage src={imageUrl} alt={title} aspect="4/3" />

        {brand && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50">
            <BrandLogoFallback brandName={brand} logoUrl={brandLogoUrl} className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{brand}</span>
          </div>
        )}

        {condition && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {condition}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {category && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Tag className="w-3 h-3" />
              <span>{category}</span>
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          {model && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">{model}</p>}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            {price !== undefined && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {price.toLocaleString('ar-EG')}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
              </div>
            )}
            {originalPrice && originalPrice > (price || 0) && (
              <span className="text-xs text-slate-400 line-through">
                {originalPrice.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>

          {warrantyPeriod && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
              <ShieldCheck className="w-3 h-3" />
              <span>ضمان {warrantyPeriod}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
