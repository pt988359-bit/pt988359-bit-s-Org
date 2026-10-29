import React, { useState } from 'react';
import { UserCheck, Bell, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { getPortalSettings, savePortalSettings } from '../../utils/portalStorage';

interface PortalSettingsViewProps {
  session: any;
}

export const PortalSettingsView: React.FC<PortalSettingsViewProps> = ({ session }) => {
  const [settings, setSettings] = useState(() => getPortalSettings(session?.phoneNumber || ''));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (session?.phoneNumber) {
      savePortalSettings(session.phoneNumber, settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in dir-rtl max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>إعدادات وتفضيلات حساب العميل</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          إدارة تفضيلات التواصل الإشعارية، وإعدادات الدخول بالهاتف وكود التتبع أو كلمة السر المؤقتة (OTP).
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تم حفظ الإعدادات بنجاح.</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
        {/* Account Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">بياناتك المسجلة بالبوابة:</h3>
          <p className="text-slate-600 dark:text-slate-300">الاسم المحترم: <span className="font-bold text-slate-900 dark:text-white">{session?.customerName}</span></p>
          <p className="text-slate-600 dark:text-slate-300">رقم الهاتف الأساسي: <span dir="ltr" className="font-mono font-bold text-blue-600 dark:text-blue-400 inline-block" style={{ unicodeBidi: 'isolate' }}>{session?.phoneNumber}</span></p>
        </div>

        {/* Preferred Contact Method */}
        <div className="space-y-2">
          <label className="font-bold text-slate-900 dark:text-white block">وسيلة التواصل المفضلة لتلقي التحديثات:</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSettings({ ...settings, preferredContactMethod: 'whatsapp' })}
              className={`p-3 rounded-2xl border font-bold text-xs transition-colors cursor-pointer ${
                settings.preferredContactMethod === 'whatsapp'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              واتساب المعرض
            </button>
            <button
              onClick={() => setSettings({ ...settings, preferredContactMethod: 'phone' })}
              className={`p-3 rounded-2xl border font-bold text-xs transition-colors cursor-pointer ${
                settings.preferredContactMethod === 'phone'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              اتصال هاتفي
            </button>
            <button
              onClick={() => setSettings({ ...settings, preferredContactMethod: 'sms' })}
              className={`p-3 rounded-2xl border font-bold text-xs transition-colors cursor-pointer ${
                settings.preferredContactMethod === 'sms'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              رسائل SMS
            </button>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>إعدادات التنبيهات والإشعارات</span>
          </h3>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationPreferences.warrantyReminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationPreferences: {
                      ...settings.notificationPreferences,
                      warrantyReminders: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300">تذكيرات تفعيل وانتهاء شهادات الضمان</span>
            </label>
          </div>
        </div>

        {/* Future OTP option */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>نظام تسجيل الدخول بالرمز المباشر (OTP Future Ready)</span>
          </h3>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
            <p className="leading-relaxed">
              يمكنك تفعيل خيار تلقي كود التحقق السريع (OTP) المكون من 6 أرقام عبر الواتساب أو SMS بدلاً من كود التتبع التقليدي عند تسجيل الدخول القادم.
            </p>
            <label className="flex items-center gap-2 cursor-pointer pt-1 font-bold">
              <input
                type="checkbox"
                checked={settings.futureOtpEnabled}
                onChange={(e) => setSettings({ ...settings, futureOtpEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600"
              />
              <span>تفعيل استقبال رمز OTP في عمليات الدخول القادمة</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button onClick={handleSave}>حفظ التغييرات</Button>
        </div>
      </div>
    </div>
  );
};
