import React from 'react';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, X, Bell } from 'lucide-react';
import { FinancialAlert } from '../../../types/adminFinance';

interface FinanceAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: FinancialAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

export const FinanceAlertsDrawer: React.FC<FinanceAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex justify-end dir-rtl">
      <div className="w-full max-w-md bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">التنبيهات التشغيلية والمالية</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                alert.isAcknowledged
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : alert.severity === 'danger'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : alert.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {alert.severity === 'danger' && <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />}
                  {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                  {alert.severity === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
                  <h4 className="text-xs font-black text-white">{alert.title}</h4>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-bold leading-relaxed">{alert.description}</p>

              {!alert.isAcknowledged && (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="w-full py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  تمت الملاحظة والعلم
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
