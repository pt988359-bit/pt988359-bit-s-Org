import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Phone, ShieldCheck, AlertCircle, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

export const CustomerLoginModal: React.FC = () => {
  const {
    loginModalOpen,
    closeLoginModal,
    signInWithGoogle,
    completeWhatsAppRegistration,
    needsWhatsappPrompt,
    pendingAuthUser,
    conflictError,
    isAuthLoading,
  } = useCustomerAuth();

  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loginModalOpen) {
      setError(null);
      setWhatsappPhone('');
    }
  }, [loginModalOpen]);

  useEffect(() => {
    if (conflictError) {
      setError(conflictError);
    }
  }, [conflictError]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success && result.message) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول بواسطة Google');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!whatsappPhone.trim()) {
      setError('يرجى إدخال رقم الواتساب الخاص بك');
      return;
    }

    setLoading(true);
    try {
      const result = await completeWhatsAppRegistration(whatsappPhone);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const displayName = pendingAuthUser?.displayName || 'عميلنا العزيز';
  const displayEmail = pendingAuthUser?.email || '';

  return (
    <Modal
      isOpen={loginModalOpen}
      onClose={closeLoginModal}
      title={needsWhatsappPrompt ? 'إكمال بيانات الحساب' : 'تسجيل الدخول إلى معرض PRO TECK'}
      size="md"
    >
      <div className="p-2 space-y-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">حسابك الموحد بالمعرض</h4>
            <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
              سجّل الدخول عبر Google للوصول الفوري لسجل طلباتك، إيصالات الحجز، وشهادات الضمان عبر كافة أجهزتك.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* STEP 1: Main Google Sign-In */}
        {!needsWhatsappPrompt ? (
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              اضغط على الزر أدناه للدخول السريع والآمن دون الحاجة لكلمة سر
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || isAuthLoading}
              className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading || isAuthLoading ? 'جاري الاتصال بـ Google...' : 'المتابعة باستخدام Google'}</span>
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>دخول مشفر ومحمي وفق معايير Google للأمان</span>
            </div>
          </div>
        ) : (
          /* STEP 2: One-time WhatsApp Number Entry */
          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">مرحباً بك في المعرض:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  حساب Google موثق
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {displayName}
              </p>
              {displayEmail && <p className="text-slate-500 text-[11px]">{displayEmail}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم الواتساب المصري للتواصل <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="01012345678"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right pl-3 pr-10 py-2.5 font-mono text-sm"
                  autoFocus
                />
                <MessageCircle className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                سنستخدم هذا الرقم لإرسال تفاصيل الفواتير والضمان والمتابعة عبر الواتساب (11 رقم يبدأ بـ 01).
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2 mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span>جاري حفظ الحساب...</span>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>متابعة وتأكيد الحساب</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
