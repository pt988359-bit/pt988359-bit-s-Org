import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
    <Skeleton className="w-full h-48 rounded-xl" />
    <div className="flex items-center justify-between">
      <Skeleton className="w-20 h-5" />
      <Skeleton className="w-16 h-5" />
    </div>
    <Skeleton className="w-3/4 h-6" />
    <Skeleton className="w-1/2 h-4" />
    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-20 h-9 rounded-xl" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <Skeleton className="w-1/3 h-5" />
        <Skeleton className="w-1/4 h-5" />
        <Skeleton className="w-1/6 h-5" />
        <Skeleton className="w-20 h-8 rounded-lg mr-auto" />
      </div>
    ))}
  </div>
);
