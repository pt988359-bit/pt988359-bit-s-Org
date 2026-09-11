import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmationOptions } from '../types';
import { AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoggerService } from '../core/services/LoggerService';

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOptions, setActiveOptions] = useState<ConfirmationOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmationOptions) => {
    setActiveOptions(options);
  }, []);

  const handleConfirm = async () => {
    if (!activeOptions) return;
    setLoading(true);
    try {
      await activeOptions.onConfirm();
      setActiveOptions(null);
    } catch (err) {
      LoggerService.warn('ConfirmationContext', 'Confirmation action error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (activeOptions?.onCancel) activeOptions.onCancel();
    setActiveOptions(null);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {activeOptions && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={handleCancel}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    activeOptions.type === 'danger'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      : activeOptions.type === 'warning'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                  }`}
                >
                  {activeOptions.type === 'danger' || activeOptions.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Info className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeOptions.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {activeOptions.message}
                  </p>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {activeOptions.cancelText || 'إلغاء'}
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className={`px-5 py-2 rounded-xl text-sm font-medium text-white shadow-md transition-all ${
                        activeOptions.type === 'danger'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : activeOptions.type === 'warning'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {loading ? 'جاري التنفيذ...' : activeOptions.confirmText || 'تأكيد'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error('useConfirmation must be used within ConfirmationProvider');
  return context;
};
