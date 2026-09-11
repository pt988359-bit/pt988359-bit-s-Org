import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Signal } from 'lucide-react';
import { Button } from '../ui/Button';

export const OfflinePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 dir-rtl animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-slate-900/95 border border-rose-500/30 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">انقطع الاتصال بالإنترنت</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">يرجى التأكد من اتصالك بالشبكة لإعادة الاتصال بالمعرض</p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="تحديث"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
