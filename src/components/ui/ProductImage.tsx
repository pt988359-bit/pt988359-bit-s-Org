import React, { useState } from 'react';
import { ImageOff, Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspect?: 'square' | 'video' | '4/3' | 'auto';
  showNoImageText?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'جهاز PRO TECK',
  className = 'w-full h-full object-cover',
  containerClassName = '',
  aspect = 'auto',
  showNoImageText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const getAspectClass = () => {
    switch (aspect) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  if (!src || imageError) {
    return (
      <div
        className={`w-full h-full min-h-[140px] bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-4 text-center border border-slate-200/60 dark:border-slate-700/60 select-none ${getAspectClass()} ${containerClassName}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
          {imageError ? <ImageOff className="w-5 h-5" /> : <Package className="w-5 h-5" />}
        </div>
        {showNoImageText && (
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            لا توجد صورة متاحة
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${getAspectClass()} ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};
