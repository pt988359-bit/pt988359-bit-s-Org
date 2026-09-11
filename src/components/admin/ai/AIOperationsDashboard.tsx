import React, { useState } from 'react';
import {
  Brain,
  Zap,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Trash2,
  Filter,
  Search,
  Cpu,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { AIOperationsAgent } from '../../../core/services/ai/AIOperationsAgent';
import { OperationsAgentStats, CommandAuditLog } from '../../../types/aiOperationsAgent';

export const AIOperationsDashboard: React.FC = () => {
  const [stats, setStats] = useState<OperationsAgentStats>(() => AIOperationsAgent.getStats());
  const [logs, setLogs] = useState<CommandAuditLog[]>(() => AIOperationsAgent.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>('ALL');

  const handleRefresh = () => {
    setStats(AIOperationsAgent.getStats());
    setLogs(AIOperationsAgent.getAuditLogs());
  };

  const handleClearLogs = () => {
    if (window.confirm('هل أنت متاكد من رغبتك في تفريغ سجل التدقيق للأوامر المنفذة؟')) {
      AIOperationsAgent.clearAuditLogs();
      handleRefresh();
    }
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ stats, logs }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `proteck-ai-operations-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.rawQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.intentArabicLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.outcomeMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIntent = selectedIntentFilter === 'ALL' || l.intent === selectedIntentFilter;
    return matchesSearch && matchesIntent;
  });

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-indigo-500/30 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Terminal className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TASK-014 Core Dispatcher
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Clean Architecture Engine</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                مركز عمليات وأوامر الذكاء الاصطناعي (AI Operations Center & Ctrl+K Hub)
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                معالجة الأوامر باللغة الطبيعية، المعالجة التلقائية السريعة بدون زمن انتظار، وسجل تدقيق شامل للقرارات والحجوزات.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>تحديث البيانات</span>
            </button>
            <button
              onClick={handleExportLogs}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير سجل التدقيق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>إجمالي الأوامر المنفذة</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.totalCommandsExecuted}</div>
          <p className="text-[10px] text-slate-400">أوامر صادرة من لوحة Ctrl+K</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>نسبة التنفيذ المحلي الفوري</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats.localExecutedPercentage}%</div>
          <p className="text-[10px] text-emerald-400">{stats.localExecutedCount} أمر بدون استهلاك API</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>متوسط زمن الاستجابة</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.avgExecutionTimeMs} ms</div>
          <p className="text-[10px] text-blue-400">سرعة فائقة بدون تأخير واجهة</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>أوامر حساسة مؤكدة</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats.highRiskActionsCount}</div>
          <p className="text-[10px] text-purple-400">إجراءات تتطلب موافقة صريحة</p>
        </div>
      </div>

      {/* Audit Log Table Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>سجل التدقيق للأوامر المباشرة (Command Audit Log)</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              تتبع جميع الاستفسارات والأوامر المنفذة مع النتيجة ونوع المعالجة
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="تصفية السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleClearLogs}
              className="p-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20"
              title="تفريغ السجل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="p-3">الوقت</th>
                <th className="p-3">الأمر المكتوب (Query)</th>
                <th className="p-3">النية المكتشفة (Intent)</th>
                <th className="p-3">نوع المعالجة</th>
                <th className="p-3">الزمن</th>
                <th className="p-3">النتيجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    لا توجد سجلات مطابقة لخيارات البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                    </td>
                    <td className="p-3 font-bold text-white max-w-xs truncate">"{log.rawQuery}"</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                        {log.intentArabicLabel}
                      </span>
                    </td>
                    <td className="p-3">
                      {log.isLocal ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                          <Zap className="w-3 h-3" />
                          <span>محلي فوري</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                          <Brain className="w-3 h-3" />
                          <span>Gemini AI</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-300 font-bold">{log.executionTimeMs} ms</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {log.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className="text-slate-300 font-medium">{log.outcomeMessage}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
