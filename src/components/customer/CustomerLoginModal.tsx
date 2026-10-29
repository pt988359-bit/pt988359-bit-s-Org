import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Phone, User, ShieldCheck, AlertCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import { validateEgyptianPhone } from '../../utils/phoneUtils';

export const CustomerLoginModal: React.FC = () => {
  const {
    loginModalOpen,
    closeLoginModal,
    identifyCustomer,
    conflictError,
  } = useCustomerAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loginModalOpen) {
      setError(null);
    } else {
      setName('');
      setPhone('');
      setError(null);
    }
  }, [loginModalOpen]);

  useEffect(() => {
    if (conflictError) {
      setError(conflictError);
    }
  }, [conflictError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('يرجى إدخال اسمك بالكامل للمتابعة');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError('يرجى إدخال رقم الهاتف المصري');
      return;
    }

    if (!validateEgyptianPhone(trimmedPhone)) {
      setError('رقم الهاتف غير صحيح. يرجى إدخال رقم محمول مصري مكون من 11 رقم يبدأ بـ 01 (مثال: 01012345678)');
      return;
    }

    setLoading(true);
    try {
      const result = await identifyCustomer(trimmedName, trimmedPhone);
      if (!result.success) {
        setError(result.message || 'تعذر تسجيل الدخول. يرجى التأكد من البيانات والمحاولة مجدداً.');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={loginModalOpen}
      onClose={closeLoginModal}
      title="تسجيل الدخول إلى معرض PRO TECK"
      size="md"
    >
      <div className="p-2 space-y-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">سجلك الموحد ونشاطك بالمعرض</h4>
            <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
              سجّل الدخول السريع بالاسم ورقم الهاتف للوصول الفوري لسجل طلباتك، شهادات الضمان، وفواتير الشراء عبر كافة أجهزتك بكل سهولة.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form: Name & Phone Entry */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customer-login-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الاسم بالكامل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="customer-login-name"
                type="text"
                placeholder="مثال: أحمد محمود"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="pl-3 pr-10 py-2.5 text-sm"
                autoFocus
              />
              <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="customer-login-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف المحمول المصري <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="customer-login-phone"
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
                dir="ltr"
                className="text-right pl-3 pr-10 py-2.5 font-mono text-sm"
              />
              <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              رقم مصري مكون من 11 رقم يبدأ بـ 01 (مثل: 01012345678). سنربط كافة طلباتك بهذا الرقم.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2 mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span>جاري التحقق وتسجيل الدخول...</span>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>دخول واستعراض نشاطي</span>
              </>
            )}
          </Button>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <LockKeyhole className="w-3.5 h-3.5 text-emerald-500" />
            <span>تسجيل مباشر وسريع بدون كلمات سر أو حسابات معقدة</span>
          </div>
        </form>
      </div>
    </Modal>
  );
};
