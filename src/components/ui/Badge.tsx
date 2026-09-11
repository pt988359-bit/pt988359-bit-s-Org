import React from 'react';
import { ProductCondition, ProductStatus } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'new' | 'used' | 'available' | 'reserved' | 'sold' | 'info' | 'success' | 'warning' | 'danger';
  condition?: ProductCondition;
  status?: ProductStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  condition,
  status,
  size = 'md',
  className = '',
}) => {
  // Determine computed variant if condition or status passed
  let activeVariant = variant || 'info';

  if (condition === 'new') activeVariant = 'new';
  if (condition === 'used') activeVariant = 'used';

  if (status === 'available') activeVariant = 'available';
  if (status === 'reserved') activeVariant = 'reserved';
  if (status === 'sold') activeVariant = 'sold';

  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    new: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    used: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    available: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    reserved: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
    sold: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30 line-through',
    info: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
  };

  // Default labels if children not explicitly provided
  let label = children;
  if (!label) {
    if (condition === 'new') label = 'جديد بالضمان';
    else if (condition === 'used') label = 'مستعمل ممتاز';
    else if (status === 'available') label = 'متاح بالمعرض';
    else if (status === 'reserved') label = 'محجوز';
    else if (status === 'sold') label = 'تم البيع';
  }

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[activeVariant]} ${className}`}>
      {label}
    </span>
  );
};
