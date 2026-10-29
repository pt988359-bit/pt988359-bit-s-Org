import React, { useState } from 'react';
import { ActiveSession, FailedLoginAttempt } from '../../../types/adminCore';
import { useAuth } from '../../../context/AuthContext';
import { useShowroom } from '../../../context/ShowroomContext';
import { BUSINESS_CONFIG } from '../../../config/businessConfig';
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  AlertTriangle,
  History,
  Key,
  LogOut,
  X,
  CheckCircle2,
  Globe,
  Laptop,
  Check,
  Settings,
  Shield,
  Sliders,
} from 'lucide-react';

interface AdminProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ActiveSession[];
  failedLogins: FailedLoginAttempt[];
  onTerminateSession: (sessionId: string) => void;
}

export const AdminProfileSecurityModal: React.FC<AdminProfileSecurityModalProps> = ({
  isOpen,
  onClose,
  sessions,
  failedLogins,
  onTerminateSession,
}) => {
  const { currentUser, logout } = useAuth();
  const { settings } = useShowroom();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'preferences'>('profile');

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordSavedMsg, setPasswordSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Feature disabled - prevent showing simulated success message
    return;
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.fullName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">{currentUser?.fullName || 'الأدمن الرئيسي'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-[10px] border border-blue-500/30">
                  {currentUser?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentUser?.email || BUSINESS_CONFIG.email} • فرع {BUSINESS_CONFIG.address.area} {BUSINESS_CONFIG.address.street}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>الملف الشخصي</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-4 font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>الأمان و 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2.5 px-4 font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>الأجهزة والجلسات ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2.5 px-4 font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>تفضيلات العرض</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">بيانات مدير المعرض</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      readOnly
                      value={currentUser?.fullName || 'PRO TECK Admin'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">البريد الإلكتروني للإدارة</label>
                    <input
                      type="email"
                      readOnly
                      value={currentUser?.email || BUSINESS_CONFIG.email}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">رقم الهاتف والتواصل</label>
                    <input
                      type="text"
                      readOnly
                      value={settings.phone}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">الفرع المخصص</label>
                    <input
                      type="text"
                      readOnly
                      value="فرع المعادي الرئيسي - شارع 68"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Form */}
              <form onSubmit={handlePasswordSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span>تغيير كلمة المرور الآمنة</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                    غير مفعّل حالياً
                  </span>
                </h3>

                {passwordSavedMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تغيير كلمة المرور وتحديث التشفير بنجاح.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/60 font-bold cursor-not-allowed opacity-60 transition-all"
                    title="تغيير كلمة المرور غير مفعّل حالياً"
                  >
                    حفظ وتحديث التشفير
                  </button>
                  <span className="text-slate-500 text-[11px]">
                    (هذا الإجراء معطل ومحمي مؤقتاً)
                  </span>
                </div>
              </form>

              {/* 2FA Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white block">المصادقة الثنائية (2FA)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        قريباً
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block">تأكيد الدخول عبر رمز أمان إضافي على الهاتف</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl font-bold bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60 transition-all"
                  title="المصادقة الثنائية غير مفعّلة حالياً"
                >
                  غير مفعّل حالياً
                </button>
              </div>

              {/* Failed Logins Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>محاولات الدخول الفاشلة المسجلة</span>
                </h3>

                <div className="space-y-2">
                  {failedLogins.map((fail) => (
                    <div key={fail.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-slate-300">
                      <div>
                        <span className="font-bold text-white block">{fail.email}</span>
                        <span className="text-slate-500 text-[10px] block">{fail.device} • {fail.reason}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-rose-400 block text-[11px]">{fail.ipAddress}</span>
                        <span className="text-slate-500 text-[10px] block">{fail.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">الأجهزة النشطة حالياً</h3>
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{sess.deviceName}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            هذا الجهاز الحالي
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] block">{sess.browser} • {sess.location}</span>
                      <span className="text-slate-500 font-mono text-[10px] block">IP: {sess.ipAddress} • {sess.lastActive}</span>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        غير مفعّل حالياً
                      </span>
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/60 font-bold text-xs cursor-not-allowed opacity-60 transition-all"
                        title="إنهاء الجلسة غير مفعّل حالياً"
                      >
                        إنهاء الجلسة
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">تفضيلات لوحة تحكم الإدارة</h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                <div>
                  <span className="font-bold text-white block">وضع العرض الداكن (Enterprise Dark)</span>
                  <span className="text-slate-400 text-[11px]">مُفعّل افتراضياً لراحة العين أثناء العمل اليومي</span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">نشط</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500">جلسة مشفرة بأمان 256-bit SSL</span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
