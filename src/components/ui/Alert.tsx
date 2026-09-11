import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-bold mb-1">{title}</h5>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
    </div>
  );
};
