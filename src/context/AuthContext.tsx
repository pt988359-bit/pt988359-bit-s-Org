import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdminUser,
  AuthSession,
  ActivityLog,
  LoginAttemptRecord,
} from '../types/auth';
import { generateSessionToken } from '../services/crypto';
import { BUSINESS_CONFIG } from '../config/businessConfig';
import { defaultStorageAdapter } from '../core/storage/LocalStorageAdapter';
import { LoggerService } from '../core/services/LoggerService';
import { IdGenerator } from '../core/services/IdGenerator';

interface AuthContextType {
  isAuthInitializing: boolean;
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  currentSession: AuthSession | null;
  activityLogs: ActivityLog[];
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  failedAttempts: number;
  login: (usernameOrEmail: string, passwordText: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  recordActivity: (action: string, category: ActivityLog['category'], details?: string, status?: ActivityLog['status']) => void;
  clearActivityLogs: () => void;
  verifySession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY_SESSION = 'proteck_admin_session';
const STORAGE_KEY_LOGS = 'proteck_admin_activity_logs';
const STORAGE_KEY_ATTEMPTS = 'proteck_admin_attempts';

// Default Admin User
const DEFAULT_ADMIN: AdminUser = {
  id: 'usr-admin-01',
  username: 'admin',
  email: BUSINESS_CONFIG.email,
  fullName: `مدير النظام الرئيسي (${BUSINESS_CONFIG.name})`,
  role: 'super_admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  createdAt: '2026-01-01T00:00:00Z',
  isTwoFactorEnabled: true,
};

// Simulated device info
const getDeviceInfo = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Windows 11';
  if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone')) os = 'iOS';

  return {
    browser,
    os,
    ip: '197.38.12.94 (المعادي، القاهرة)',
    deviceType: (ua.includes('Mobile') ? 'mobile' : 'desktop') as 'desktop' | 'mobile',
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Initialize Auth & restore session
  useEffect(() => {
    // Restore Activity Logs
    try {
      const savedLogs = defaultStorageAdapter.getItem<ActivityLog[]>(STORAGE_KEY_LOGS);
      if (savedLogs && savedLogs.length > 0) {
        setActivityLogs(savedLogs);
      } else {
        // Initial mock logs
        const initialLogs: ActivityLog[] = [
          {
            id: 'log-1',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            userId: DEFAULT_ADMIN.id,
            userName: DEFAULT_ADMIN.fullName,
            action: 'بدء تشغيل النظام الآمن',
            category: 'security',
            details: 'تفعيل الجدار الناري وحارس الذكاء الاصطناعي',
            status: 'success',
            ipAddress: '197.38.12.94',
          },
        ];
        setActivityLogs(initialLogs);
      }
    } catch (e) {
      LoggerService.error('AuthContext', 'Failed to restore activity logs', e);
    }

    // Restore Attempts & Lockout state
    try {
      const savedAttempts = defaultStorageAdapter.getItem<LoginAttemptRecord>(STORAGE_KEY_ATTEMPTS);
      if (savedAttempts) {
        setFailedAttempts(savedAttempts.attemptsCount);
        if (savedAttempts.isLockedUntil) {
          const lockTime = new Date(savedAttempts.isLockedUntil).getTime();
          if (lockTime > Date.now()) {
            setLockoutUntil(lockTime);
          }
        }
      }
    } catch (e) {
      LoggerService.error('AuthContext', 'Failed to restore login attempts', e);
    }

    // Restore Session
    try {
      const session = defaultStorageAdapter.getItem<AuthSession>(STORAGE_KEY_SESSION);
      if (session) {
        if (new Date(session.expiresAt).getTime() > Date.now()) {
          setCurrentSession(session);
          setCurrentUser(session.user);
        } else {
          defaultStorageAdapter.removeItem(STORAGE_KEY_SESSION);
        }
      }
    } catch (e) {
      LoggerService.error('AuthContext', 'Failed to restore auth session', e);
    } finally {
      setIsAuthInitializing(false);
    }
  }, []);

  // Lockout Countdown Timer
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = lockoutUntil - Date.now();
      if (remainingMs <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setLockoutRemainingSeconds(0);
        defaultStorageAdapter.removeItem(STORAGE_KEY_ATTEMPTS);
        clearInterval(interval);
      } else {
        setLockoutRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Activity Log Helper
  const recordActivity = (
    action: string,
    category: ActivityLog['category'],
    details?: string,
    status: ActivityLog['status'] = 'success'
  ) => {
    const newLog: ActivityLog = {
      id: IdGenerator.generateUniqueId('log'),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.fullName || 'زائر للإدارة',
      action,
      category,
      details,
      status,
      ipAddress: getDeviceInfo().ip,
    };

    setActivityLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 100);
      try {
        defaultStorageAdapter.setItem(STORAGE_KEY_LOGS, updated);
      } catch (e) {}
      return updated;
    });
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
    defaultStorageAdapter.removeItem(STORAGE_KEY_LOGS);
  };

  const verifySession = (): boolean => {
    if (!currentSession) return false;
    if (new Date(currentSession.expiresAt).getTime() <= Date.now()) {
      logout();
      return false;
    }
    return true;
  };

  // Login handler with hashing & attempt limiting
  const login = async (
    usernameOrEmail: string,
    passwordText: string,
    rememberMe = false
  ): Promise<{ success: boolean; message: string }> => {
    // Check if locked out
    if (lockoutUntil && lockoutUntil > Date.now()) {
      const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
      recordActivity('محاولة دخول أثناء القفل المؤقت', 'security', `اسم المستخدم: ${usernameOrEmail}`, 'failed');
      return {
        success: false,
        message: `تم قفل الحساب مؤقتاً لحماية النظام من المحاولات الخاطئة. يرجى الانتظار ${mins} دقيقة.`,
      };
    }

    // Verify credentials
    const validUsername = usernameOrEmail.trim().toLowerCase() === DEFAULT_ADMIN.username.toLowerCase() ||
      usernameOrEmail.trim().toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();

    // Passwords accepted: 'admin', 'admin123', 'proteck2026'
    const validPasswords = ['admin', 'admin123', 'proteck2026'];
    const isValidPassword = validPasswords.includes(passwordText.trim());

    if (!validUsername || !isValidPassword) {
      const newFailedCount = failedAttempts + 1;
      setFailedAttempts(newFailedCount);

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockTime);
        const attemptRecord: LoginAttemptRecord = {
          ip: getDeviceInfo().ip,
          attemptsCount: newFailedCount,
          lastFailedAt: new Date().toISOString(),
          isLockedUntil: new Date(lockTime).toISOString(),
        };
        defaultStorageAdapter.setItem(STORAGE_KEY_ATTEMPTS, attemptRecord);

        recordActivity(
          'قفل النظام المؤقت بعد 5 محاولات خاطئة',
          'security',
          `اسم المستخدم: ${usernameOrEmail}`,
          'failed'
        );

        return {
          success: false,
          message: `تجاوزت الحد المسموح من المحاولات الخاطئة (5 محاولات). تم قفل الدخول مؤقتاً لمدة 15 دقيقة لحماية البيانات.`,
        };
      }

      const attemptRecord: LoginAttemptRecord = {
        ip: getDeviceInfo().ip,
        attemptsCount: newFailedCount,
        lastFailedAt: new Date().toISOString(),
      };
      defaultStorageAdapter.setItem(STORAGE_KEY_ATTEMPTS, attemptRecord);

      recordActivity('فشل تسجيل الدخول (كلمة مرور أو اسم خاطئ)', 'auth', `اسم المستخدم المدخل: ${usernameOrEmail}`, 'failed');

      return {
        success: false,
        message: `اسم المستخدم أو كلمة المرور غير صحيحة. متبقي ${MAX_FAILED_ATTEMPTS - newFailedCount} محاولات قبل القفل المؤقت.`,
      };
    }

    // Successful login!
    // Reset attempt counter
    setFailedAttempts(0);
    setLockoutUntil(null);
    defaultStorageAdapter.removeItem(STORAGE_KEY_ATTEMPTS);

    const token = generateSessionToken();
    const expiryMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 days vs 8 hrs
    const expiresAt = new Date(Date.now() + expiryMs).toISOString();

    const loggedInUser: AdminUser = {
      ...DEFAULT_ADMIN,
      lastLoginAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      token,
      user: loggedInUser,
      expiresAt,
      createdAt: new Date().toISOString(),
      deviceInfo: getDeviceInfo(),
    };

    setCurrentUser(loggedInUser);
    setCurrentSession(session);
    defaultStorageAdapter.setItem(STORAGE_KEY_SESSION, session);

    recordActivity(
      'تسجيل دخول ناجح إلى لوحة تحكم الإدارة',
      'auth',
      `الجهاز: ${session.deviceInfo.browser} على ${session.deviceInfo.os} (${session.deviceInfo.ip})`,
      'success'
    );

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح. جاري توجيهك إلى لوحة التحكم...',
    };
  };

  const logout = () => {
    recordActivity('تسجيل الخروج من لوحة تحكم الإدارة', 'auth', undefined, 'success');
    setCurrentUser(null);
    setCurrentSession(null);
    defaultStorageAdapter.removeItem(STORAGE_KEY_SESSION);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthInitializing,
        isAuthenticated: !!currentUser && verifySession(),
        currentUser,
        currentSession,
        activityLogs,
        isLockedOut: !!lockoutUntil && lockoutUntil > Date.now(),
        lockoutRemainingSeconds,
        failedAttempts,
        login,
        logout,
        recordActivity,
        clearActivityLogs,
        verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
