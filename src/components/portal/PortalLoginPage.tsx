import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  Lock,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { verifyPortalLogin } from '../../utils/portalStorage';

interface PortalLoginPageProps {
  onSuccessLogin: (session: any) => void;
  onBackToPublic: () => void;
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({
  onSuccessLogin,
  onBackToPublic,
}) => {
  const [phone, setPhone] = useState('');
  const [authMethod, setAuthMethod] = useState<'tracking_code' | 'otp'>('tracking_code');
  const [trackingCode, setTrackingCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = () => {
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg('برجاء إدخال رقم هاتف صحيح بالصيغة المصرية أو الدولية.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const codeToVerify = authMethod === 'tracking_code' ? trackingCode : otpCode;
      const res = verifyPortalLogin(phone, codeToVerify, authMethod);

      if (res.success && res.session) {
        onSuccessLogin(res.session);
      } else {
        setErrorMsg(res.message || 'فشل تسجيل الدخول. تأكد من صحة رقم الهاتف وكود التتبع.');
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 dir-rtl font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 text-center space-y-3 relative">
          <button
            onClick={onBackToPublic}
            className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>المعرض الرئيسي</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              بوابة متابعة الحجوزات والطلبات
            </h1>
            <p className="text-xs text-slate-400">
              الدخول الآمن لمتابعة طلباتك ورقم التتبع الخاص بالحجز
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitLogin} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Auth Method Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">طريقة التحقق من الحساب:</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('tracking_code');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl transition-colors ${
                  authMethod === 'tracking_code'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                كود تتبع الطلب
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMsg('');
                }}
                className={`py-2 px-3 rounded-xl transition-colors ${
                  authMethod === 'otp'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                رمز OTP المباشر
              </button>
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>رقم الهاتف المسجل بالطلب:</span>
              <span className="text-[10px] text-slate-500">مثال: 01001234567</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="أدخل رقم الهاتف..."
                className="w-full text-xs font-mono pr-10 pl-4 py-3 bg-slate-950 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white dir-ltr text-right"
              />
            </div>
          </div>

          {/* Auth Field 1: Tracking Code */}
          {authMethod === 'tracking_code' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>كود التتبع الخاص بالطلب (RES-XXXXX / PUR-XXXXX):</span>
                <span className="text-[10px] text-slate-500">مذكور بإيصالك</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="أدخل كود التتبع..."
                  className="w-full text-xs font-mono tracking-wider pr-10 pl-4 py-3 bg-slate-950 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white uppercase"
                />
              </div>
            </div>
          )}

          {/* Auth Field 2: OTP Code */}
          {authMethod === 'otp' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">رمز التحقق المباشر (OTP):</label>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال رمز OTP المكون من 6 أرقام عبر الواتساب</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="أدخل رمز OTP"
                    className="w-full text-center text-lg font-mono tracking-widest py-3 bg-slate-950 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-bold text-xs"
          >
            {isSubmitting ? 'جاري التحقق...' : 'الدخول لبوابة المستندات والطلبات'}
          </Button>

          {/* Security Transparency note */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-1 text-[11px] text-slate-500">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              تتيح لك البوابة الوصول الحصري لمستنداتك وحجوزاتك فقط.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
