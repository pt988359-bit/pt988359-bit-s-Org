import React, { useState } from 'react';
import { ActivityCategory, ActivityLogEntry, ActivitySeverity } from '../../../types/adminCore';
import {
  History,
  X,
  Search,
  Filter,
  UserCheck,
  Package,
  CreditCard,
  FileText,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Globe,
} from 'lucide-react';

interface AdminActivityTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityLogs: ActivityLogEntry[];
}

export const AdminActivityTimelineModal: React.FC<AdminActivityTimelineModalProps> = ({
  isOpen,
  onClose,
  activityLogs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ActivityCategory>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | ActivitySeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = activityLogs.filter((log) => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;

    if (
      searchQuery &&
      !log.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.actor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(log.referenceNumber && log.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'login':
      case 'logout':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'product_change':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'payment_update':
        return <CreditCard className="w-4 h-4 text-cyan-400" />;
      case 'invoice_creation':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'ai_suggestion':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'system_change':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'customer_action':
        return <Globe className="w-4 h-4 text-blue-300" />;
      default:
        return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: ActivitySeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> خطير
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            تنبيه
          </span>
        );
      case 'success':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ناجح
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            معلومات
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-600/10">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">سجل نشاط النظام العام (Timeline)</h2>
              <p className="text-xs text-slate-400">
                تتبع زمني شامل لعمليات الأدمن، الحجوزات، إيصالات البنك، وحارس الذكاء الاصطناعي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في السجل بالحساب، الرقم المرجعي أو الإجراء..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">جميع الخطورات</option>
              <option value="info">معلومات (Info)</option>
              <option value="success">نجاح (Success)</option>
              <option value="warning">تحذير (Warning)</option>
              <option value="critical">حرج (Critical)</option>
            </select>
          </div>
        </div>

        {/* Timeline Log Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد أحداث مطابقة في سجل نشاط النظام.
            </div>
          ) : (
            <div className="relative pr-4 border-r-2 border-slate-800 space-y-6 mr-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative flex flex-col gap-2 group">
                  {/* Circle Marker */}
                  <div className="absolute -right-[23px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-blue-500 shadow-sm" />

                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-slate-800 text-slate-300">
                        {getCategoryIcon(log.category)}
                      </div>
                      <span className="font-bold text-xs text-white">{log.actor}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {log.actorRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getSeverityBadge(log.severity)}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed group-hover:border-slate-700 transition-all">
                    <p>{log.description}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                      {log.referenceNumber && (
                        <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          مرجع: #{log.referenceNumber}
                        </span>
                      )}
                      {log.ipAddress && (
                        <span className="font-mono text-slate-500">IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500">
          سجل الأحداث يوثّق جميع العمليات بحماية أمنية لا تقبل التعديل
        </div>
      </div>
    </div>
  );
};
