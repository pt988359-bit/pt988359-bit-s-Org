import React from 'react';
import { PackageX, RefreshCw, PlusCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 dir-rtl my-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-sm animate-pulse">
        {icon || <PackageX className="w-8 h-8" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button
            variant="electric"
            size="sm"
            onClick={onAction}
            leftIcon={actionIcon || <PlusCircle className="w-4 h-4" />}
          >
            {actionLabel}
          </Button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onSecondaryAction}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
