import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { useShowroom } from '../../context/ShowroomContext';
import { AdminSessionService } from '../../core/services/AdminSessionService';

interface AdminAccessContextType {
  isAdminGateAuthenticated: boolean;
  logoutAdminGate: () => Promise<void>;
  checkAdminGateStatus: () => Promise<boolean>;
}

const AdminAccessContext = createContext<AdminAccessContextType>({
  isAdminGateAuthenticated: false,
  logoutAdminGate: async () => {},
  checkAdminGateStatus: async () => false,
});

export const useAdminAccess = () => useContext(AdminAccessContext);

export async function logoutAdminAccessSession(): Promise<boolean> {
  try {
    try {
      await firebaseSignOut(auth);
    } catch (fbSignOutErr) {
      console.warn('Firebase sign out during admin logout:', fbSignOutErr);
    }
    const storedToken = AdminSessionService.getToken();
    AdminSessionService.clearToken();
    const res = await fetch('/api/admin/access/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(storedToken ? { 'x-admin-token': storedToken } : {}),
      },
      credentials: 'include',
    });
    return res.ok;
  } catch (err) {
    console.error('Logout admin session failed:', err);
    return false;
  }
}

interface AdminAccessGateProps {
  children: ReactNode;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({ children }) => {
  const { navigateTo } = useShowroom();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const checkStatus = async (): Promise<boolean> => {
    try {
      const storedToken = AdminSessionService.getToken();
      const res = await fetch('/api/admin/access/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { 'x-admin-token': storedToken } : {}),
        },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const authed = Boolean(data.authenticated);
        if (authed && data.token) {
          AdminSessionService.setToken(data.token);
        }
        if (authed && data.firebaseCustomToken) {
          try {
            await signInWithCustomToken(auth, data.firebaseCustomToken);
          } catch (fbAuthErr) {
            console.warn('Firebase signInWithCustomToken during check error:', fbAuthErr);
          }
        }
        setIsAuthenticated(authed);
        return authed;
      }
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.warn('Check admin access notice:', err);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة سر لوحة التحكم.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/access/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          AdminSessionService.setToken(data.token);
        }
        if (data.firebaseCustomToken) {
          try {
            await signInWithCustomToken(auth, data.firebaseCustomToken);
          } catch (fbAuthErr) {
            console.warn('Firebase signInWithCustomToken during login error:', fbAuthErr);
          }
        }
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError(data.error || 'كلمة السر غير صحيحة. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.warn('Admin access login notice:', err);
      setError(err?.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقًا.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    AdminSessionService.clearToken();
    try {
      await firebaseSignOut(auth);
    } catch (fbSignOutErr) {
      console.warn('Firebase sign out error:', fbSignOutErr);
    }
    await logoutAdminAccessSession();
    setIsAuthenticated(false);
    setPassword('');
  };

  // Loading State Indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center font-sans dir-rtl">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-bold text-slate-300">جاري التحقق من تصريح الدخول...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: Render single password access gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans dir-rtl text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Brand Icon */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <KeyRound className="w-8 h-8" />
            </div>
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>حماية لوحة التحكم المركزية</span>
              </div>
              <h1 className="text-2xl font-black text-white">PRO TECK Admin</h1>
              <p className="text-xs text-slate-400 mt-1">
                أدخل كلمة السر المخصصة للوصول إلى لوحة إدارة المعرض
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Single Password Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                كلمة سر الدخول (Access Password)
              </label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  dir="ltr"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Showroom Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى المعرض الرئيسي</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Provide Context & Render Children
  return (
    <AdminAccessContext.Provider
      value={{
        isAdminGateAuthenticated: isAuthenticated,
        logoutAdminGate: handleLogout,
        checkAdminGateStatus: checkStatus,
      }}
    >
      {children}
    </AdminAccessContext.Provider>
  );
};
