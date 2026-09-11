import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ShieldCheck, Lock, User, AlertCircle, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const { login, isLockedOut, lockoutRemainingSeconds, failedAttempts } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('خطأ في البيانات', 'يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        showToast('تسجيل دخول ناجح', result.message, 'success');
        onSuccess();
      } else {
        showToast('فشل تسجيل الدخول', result.message, 'error');
      }
    } catch (err) {
      showToast('خطأ في النظام', 'حدث خطأ أثناء الاتصال بالنظام الآمن', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingMins = Math.ceil(lockoutRemainingSeconds / 60);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white p-4 sm:p-8 relative overflow-hidden font-sans dir-rtl">
      {/* Glow Background Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
        {/* Brand Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-2xl shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              PRO TECK Admin Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              نظام إدارة المعرض العام والتحكم المركزي - المعادي
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isLockedOut && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">تم قفل النظام المؤقت لحماية الحساب!</span>
              <span>
                تجاوزت الحد المسموح للمحاولات الخاطئة. المتبقي للقفل: {remainingMins} دقيقة ({lockoutRemainingSeconds} ثانية).
              </span>
            </div>
          </div>
        )}

        {/* Login Form Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              المصادقة الآمنة لمديري المعرض
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              تشفير SHA-256
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username / Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isLockedOut}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr text-right"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  كلمة المرور
                </span>
                <span
                  title="خاصية استرجاع كلمة المرور تتطلب تحكم المطور الرئيسي"
                  className="text-[11px] text-slate-500 cursor-not-allowed hover:text-slate-400"
                >
                  نسيت كلمة المرور؟ (غير مفعل)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLockedOut}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dir-ltr text-right pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
                />
                <span>تذكر الجلسة لمدة 30 يوماً</span>
              </label>

              {failedAttempts > 0 && !isLockedOut && (
                <span className="text-amber-400 text-[11px] font-bold">
                  محاولات خاطئة: {failedAttempts} / 5
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="electric"
              size="lg"
              disabled={isSubmitting || isLockedOut}
              className="w-full mt-2 font-bold justify-center"
            >
              {isSubmitting ? 'جاري التحقق من التشفير...' : 'تسجيل الدخول للنظام'}
            </Button>
          </form>

          {/* Quick Credentials Info Box */}
          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-400 leading-relaxed flex flex-col gap-1">
            <span className="font-bold text-blue-300">بيانات الدخول الافتراضية للم تجربة:</span>
            <span>اسم المستخدم: <code className="text-white font-mono bg-slate-950 px-1.5 py-0.5 rounded">admin</code></span>
            <span>كلمة المرور: <code className="text-white font-mono bg-slate-950 px-1.5 py-0.5 rounded">admin123</code></span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          PRO TECK Maadi Showroom System &copy; 2026 | حارس الذكاء الاصطناعي مفعل
        </div>
      </div>
    </div>
  );
};
