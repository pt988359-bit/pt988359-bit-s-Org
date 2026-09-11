import React from 'react';
import { ServiceHealthStatus } from '../../../types/adminCore';
import {
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Bot,
  MessageSquare,
  CreditCard,
  HardDrive,
  Code2,
  Mail,
  RefreshCw,
} from 'lucide-react';

interface AdminSystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceHealthStatus[];
  onRefreshStatuses: () => void;
}

export const AdminSystemStatusModal: React.FC<AdminSystemStatusModalProps> = ({
  isOpen,
  onClose,
  services,
  onRefreshStatuses,
}) => {
  if (!isOpen) return null;

  const getServiceIcon = (key: ServiceHealthStatus['key']) => {
    switch (key) {
      case 'database':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'ai_service':
        return <Bot className="w-4 h-4 text-indigo-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'instapay':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'api':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getStatusBadge = (status: ServiceHealthStatus['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> تعمل بكفاءة
          </span>
        );
      case 'degraded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> بطء استجابة
          </span>
        );
      case 'outage':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> توقف مؤقت
          </span>
        );
      case 'maintenance':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            صيانة جدولة
          </span>
        );
    }
  };

  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">حالة أنظمة وخدمات البنية التحتية</h2>
                {allOperational && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                    100% Operational
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">مراقبة حية لحظية لقواعد البيانات، بوابة البنك، والمساعد الذكي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStatuses}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
              title="تحديث مؤشرات الخدمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {services.map((srv) => (
            <div
              key={srv.key}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getServiceIcon(srv.key)}
                </div>
                <div>
                  <span className="font-extrabold text-xs text-white block">{srv.name}</span>
                  <span className="text-[11px] text-slate-400 block">{srv.details}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
                <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  {srv.latencyMs} ms
                </span>
                {getStatusBadge(srv.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500">
          يتم فحص الاستجابة أوتوماتيكياً كل 30 ثانية لتوفير أقصى استقرار
        </div>
      </div>
    </div>
  );
};
