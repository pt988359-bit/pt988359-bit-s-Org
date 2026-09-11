import React, { useState } from 'react';
import { Customer, CommunicationLogEntry } from '../../../../types/customerHub';
import {
  MessageSquare,
  Phone,
  Mail,
  Plus,
  Clock,
  Send,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface CommunicationTabProps {
  customer: Customer;
  onAddLogEntry: (entry: Omit<CommunicationLogEntry, 'id'>) => void;
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  customer,
  onAddLogEntry,
}) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<'whatsapp' | 'phone_call' | 'email' | 'manual_note'>(
    'phone_call'
  );
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [outcome, setOutcome] = useState('تم التواصل والمتابعة بنجاح');
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [actorName, setActorName] = useState(customer.assignedAdmin || 'PRO TECK Admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    onAddLogEntry({
      type: logType,
      direction,
      summary,
      details,
      actor: actorName,
      timestamp: new Date().toISOString(),
      outcome,
      durationSeconds: durationMinutes * 60,
    });

    setSummary('');
    setDetails('');
    setShowLogForm(false);
  };

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      {/* Header & New Log Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>سجل اتصالات وتواصل العميل ({customer.communicationLogs.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            متابعة المكالمات الهاتفية اليدوية، رسائل الواتساب، والبريد الإلكتروني
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showLogForm ? 'إغلاق النموذج' : 'تسجيل مكالمة / تواصل جديد'}</span>
        </button>
      </div>

      {/* Manual Log Entry Form */}
      {showLogForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3 shadow-xl"
        >
          <div className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <span>نموذج توثيق تواصل مع العميل</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-bold">نوع التواصل:</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="phone_call">مكالمة هاتفية (Phone Call)</option>
                <option value="whatsapp">محادثة واتساب (WhatsApp)</option>
                <option value="email">بريد إلكتروني (Email)</option>
                <option value="manual_note">ملاحظة شفهية بالمعرض</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-bold">اتجاه الاتصال:</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="outbound">صادر من المعرض للعميل (Outbound)</option>
                <option value="inbound">وارد من العميل للمعرض (Inbound)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-bold">مسؤول المتابعة:</label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-[11px] block mb-1 font-bold">
              ملخص الاتصال (العنوان الرئيسي):
            </label>
            <input
              type="text"
              required
              placeholder="مثال: متابعة موعد التسليم واقتراح جهاز بديل..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-bold">
                النتيجة الصادرة (Outcome):
              </label>
              <input
                type="text"
                placeholder="مثال: تم الاتفاق على المعاينة غداً الساعة 6 مساءً"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1 font-bold">
                مدة المكالمة (بالدقائق):
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>حفظ الاتصال بسجل العميل</span>
            </button>
          </div>
        </form>
      )}

      {/* Logs List */}
      {customer.communicationLogs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد اتصالات موثقة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customer.communicationLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-md"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.type === 'phone_call' ? (
                      <Phone className="w-4 h-4" />
                    ) : log.type === 'whatsapp' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </span>
                  <span className="font-extrabold text-white text-xs">{log.summary}</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>المسؤول: {log.actor}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                </div>
              </div>

              {log.outcome && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] flex items-center justify-between">
                  <span>النتيجة: <strong>{log.outcome}</strong></span>
                  {log.durationSeconds && (
                    <span className="text-slate-500 font-mono">
                      المدة: {Math.round(log.durationSeconds / 60)} دقيقة
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
