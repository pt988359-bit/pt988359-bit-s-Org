import React from 'react';
import { OrderAuditLogEntry } from '../../../types/orderManagementCenter';
import { ShieldCheck, Clock, User, ArrowRightLeft, FileText } from 'lucide-react';

interface AuditLogWorkspaceProps {
  auditLogs: OrderAuditLogEntry[];
}

export const AuditLogWorkspace: React.FC<AuditLogWorkspaceProps> = ({ auditLogs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs text-slate-100 dir-rtl">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h3 className="font-extrabold text-sm text-white">سجل التدقيق الأمني والعمليات الحية (Audit Log)</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          إجمالي السجلات: {auditLogs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
              <th className="p-4">الوقت والتاريخ</th>
              <th className="p-4">الأدمن المسؤول</th>
              <th className="p-4">رقم المرجع</th>
              <th className="p-4">الحالة السابقة</th>
              <th className="p-4">الحالة الجديدة</th>
              <th className="p-4">السبب والملاحظة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد عمليات مسجلة بالسجل بعد.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-4 font-bold text-white">{log.administrator}</td>
                  <td className="p-4 font-mono font-black text-blue-400">{log.referenceNumber}</td>
                  <td className="p-4 text-rose-400 font-bold">{log.previousStatus}</td>
                  <td className="p-4 text-emerald-400 font-bold">{log.newStatus}</td>
                  <td className="p-4 text-slate-300 max-w-[280px] truncate">{log.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
