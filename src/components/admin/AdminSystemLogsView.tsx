import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ShieldAlert, Laptop, Trash2, Clock, ShieldCheck } from 'lucide-react';

export const AdminSystemLogsView: React.FC = () => {
  const { activityLogs, clearActivityLogs, currentSession, failedAttempts, isLockedOut, lockoutRemainingSeconds } = useAuth();

  return (
    <div className="flex flex-col gap-6 pb-12 dir-rtl text-xs">
      {/* Current Active Session & Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              الجلسة الحالية والجاهزية (Active Session)
            </h3>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">رمز التشفير للعلامة Token:</span>
              <span className="font-mono text-blue-400 font-bold truncate max-w-[180px]">
                {currentSession?.token || 'session_active'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">جهاز الدخول والمدينة:</span>
              <span className="font-bold text-white">
                {currentSession?.deviceInfo.browser} ({currentSession?.deviceInfo.os}) - {currentSession?.deviceInfo.ip}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">تاريخ انتهاء صلاحية الجلسة:</span>
              <span className="font-bold text-emerald-400">
                {currentSession?.expiresAt ? new Date(currentSession.expiresAt).toLocaleString('ar-EG') : 'نشطة'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              حالة حارس محاولات الدخول (Rate Limiter)
            </h3>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">عدد المحاولات الخاطئة المسجلة:</span>
              <span className="font-bold text-amber-400">{failedAttempts} / 5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">حالة قفل النظام:</span>
              <span className={`font-bold ${isLockedOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isLockedOut ? `مقفل مؤقتاً (${lockoutRemainingSeconds} ثانية)` : 'آمن وغير مقفل'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">حماية كلمة المرور:</span>
              <span className="font-bold text-indigo-400">تشفير SHA-256 مع Salt معزول</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              سجل نشاطات وأمان النظام ({activityLogs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-1">تتبع كافة الإجراءات والتحركات داخل لوحة التحكم</p>
          </div>
          {activityLogs.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              onClick={clearActivityLogs}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              مسح السجلات
            </Button>
          )}
        </CardHeader>

        <CardBody className="p-6">
          {activityLogs.length === 0 ? (
            <EmptyState
              title="سجل النشاطات فارغ"
              description="لم يتم تسجيل أي عمليات أمان جديدة أو تغييرات حالياً."
              icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.status === 'success'
                          ? 'bg-emerald-500'
                          : log.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <span className="font-bold block text-white">{log.action}</span>
                      <span className="text-slate-400">
                        بواسطة: {log.userName} | {log.details || 'لا توجد تفاصيل إضافية'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left text-[11px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleString('ar-EG')} ({log.ipAddress})
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
