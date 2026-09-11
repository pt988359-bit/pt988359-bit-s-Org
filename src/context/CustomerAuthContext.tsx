import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogleRedirect, checkGoogleRedirectResult, logoutUser } from '../firebase/auth';
import { getDocData, setDocData, updateDocData } from '../firebase/firestore';
import { Customer } from '../types/customerHub';
import { DeviceInfo } from '../types/customerIdentity';
import { PhoneValidator } from '../core/validators/PhoneValidator';
import { defaultCustomerRepository } from '../core/repositories/CustomerRepository';
import { LoggerService } from '../core/services/LoggerService';
import { firestoreStorageAdapter } from '../core/storage/FirestoreStorageAdapter';
import { supabase } from '../supabase/client';
import { mapPostgresRowToItem } from '../core/storage/SupabaseStorageAdapter';

export interface CustomerAuthContextType {
  firebaseUser: User | null;
  customer: (Customer & { name: string; phone: string; verified: boolean }) | null;
  isCustomerAuthenticated: boolean;
  isAuthLoading: boolean;
  loginModalOpen: boolean;
  needsWhatsappPrompt: boolean;
  pendingAuthUser: User | null;
  conflictError: string | null;
  openLoginModal: (onSuccessAction?: () => void) => void;
  closeLoginModal: () => void;
  signInWithGoogle: () => Promise<{ success: boolean; needsWhatsapp?: boolean; message?: string }>;
  completeWhatsAppRegistration: (whatsappPhone: string) => Promise<{ success: boolean; message: string }>;
  logoutCustomer: () => Promise<void>;
  requireCustomerAuth: (actionCallback: () => void) => boolean;
  getDeviceInfo: () => DeviceInfo;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY_IDENTITY = 'proteck_customer_identity_v3';

export const getClientDeviceInfo = (): DeviceInfo => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser';
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Windows 11';
  if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return {
    browser,
    os,
    deviceType: ua.includes('Mobile') ? 'mobile' : 'desktop',
    userAgent: ua,
  };
};

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<(Customer & { name: string; phone: string; verified: boolean }) | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [needsWhatsappPrompt, setNeedsWhatsappPrompt] = useState<boolean>(false);
  const [pendingAuthUser, setPendingAuthUser] = useState<User | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const normalizeCustomer = (cust: Customer): Customer & { name: string; phone: string; verified: boolean } => {
    return {
      ...cust,
      name: cust.fullName || 'عميل PRO TECK',
      phone: cust.whatsappPhone || cust.primaryPhone || '',
      verified: true,
    };
  };

  const syncCustomerToServer = async (custRecord: Customer, userOverride?: User | null) => {
    try {
      const activeUser = userOverride || auth.currentUser || firebaseUser || pendingAuthUser;
      if (!activeUser) {
        LoggerService.warn('CustomerAuthContext', 'Skipping /api/customers/sync: no active Firebase user session');
        return;
      }

      let idToken: string | undefined;
      try {
        idToken = await activeUser.getIdToken();
      } catch (tokenErr) {
        LoggerService.warn('CustomerAuthContext', 'Failed to acquire Firebase ID token:', tokenErr);
      }

      if (!idToken) {
        LoggerService.warn('CustomerAuthContext', 'Skipping /api/customers/sync: missing ID token');
        return;
      }

      const payload: Customer = {
        ...custRecord,
        id: custRecord.id || activeUser.uid,
        firebaseUid: custRecord.firebaseUid || activeUser.uid,
      };

      const res = await fetch('/api/customers/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        LoggerService.warn('CustomerAuthContext', `/api/customers/sync returned HTTP status ${res.status}`);
      }
    } catch (err) {
      LoggerService.warn('CustomerAuthContext', 'Non-blocking /api/customers/sync failed:', err);
    }
  };

  const syncAndLoadCustomer = async (
    fbUser: User
  ): Promise<(Customer & { name: string; phone: string; verified: boolean }) | null> => {
    setConflictError(null);
    try {
      // Step 1. Fast lookup in Supabase 'customers' table by firebase_uid
      try {
        const { data: supabaseRow, error: supabaseErr } = await supabase
          .from('customers')
          .select('*')
          .eq('firebase_uid', fbUser.uid)
          .maybeSingle();

        if (!supabaseErr && supabaseRow) {
          const mappedCust = mapPostgresRowToItem<Customer>('customers', supabaseRow);
          const normalized = normalizeCustomer(mappedCust);
          setCustomer(normalized);
          setNeedsWhatsappPrompt(false);
          setPendingAuthUser(null);
          firestoreStorageAdapter.setItem(STORAGE_KEY_IDENTITY, normalized);

          // Non-blocking background Firestore synchronization/update for future compatibility
          getDocData<Customer>('customers', fbUser.uid)
            .then((directDoc) => {
              if (directDoc) {
                updateDocData('customers', fbUser.uid, { lastActivityDate: new Date().toISOString() }).catch(() => {});
              } else {
                setDocData('customers', mappedCust).catch(() => {});
              }
            })
            .catch(() => {});

          return normalized;
        }
      } catch (sbQueryErr) {
        LoggerService.warn('CustomerAuthContext', 'Supabase customer query check encountered warning:', sbQueryErr);
      }

      // Step 2. If not found by firebase_uid, check if email matches an existing customer in local/repository
      const fbEmail = (fbUser.email || '').trim().toLowerCase();
      if (fbEmail) {
        try {
          const allCustomers = await defaultCustomerRepository.findAll();
          const matching = allCustomers.filter(
            (c) => c.email && c.email.trim().toLowerCase() === fbEmail
          );

          if (matching.length > 1) {
            const errMsg = 'تم العثور على أكثر من حساب بنفس البريد الإلكتروني. يرجى التواصل مع الدعم الفني لحل التعارض.';
            LoggerService.warn('CustomerAuthContext', 'Multiple customer records match same email', { fbEmail, matches: matching.length });
            setConflictError(errMsg);
            return null;
          }

          if (matching.length === 1) {
            const existing = matching[0];
            LoggerService.info('CustomerAuthContext', `Linking Firebase UID ${fbUser.uid} to existing customer ${existing.id}`);

            const linkedRecord: Customer = {
              ...existing,
              id: fbUser.uid,
              firebaseUid: fbUser.uid,
              email: fbUser.email || existing.email,
              fullName: fbUser.displayName || existing.fullName,
              lastActivityDate: new Date().toISOString(),
            };

            // Save immediately to repository and sync to Supabase via server API
            try {
              defaultCustomerRepository.save(linkedRecord);
            } catch (saveErr) {
              LoggerService.warn('CustomerAuthContext', 'Repository save warning:', saveErr);
            }
            syncCustomerToServer(linkedRecord, fbUser);

            // Non-blocking Firestore sync
            setDocData('customers', linkedRecord).catch(() => {});

            const normalized = normalizeCustomer(linkedRecord);
            setCustomer(normalized);
            setNeedsWhatsappPrompt(false);
            setPendingAuthUser(null);
            firestoreStorageAdapter.setItem(STORAGE_KEY_IDENTITY, normalized);
            return normalized;
          }
        } catch (repoErr) {
          LoggerService.warn('CustomerAuthContext', 'Email matching warning:', repoErr);
        }
      }

      // Non-blocking Firestore check in background without blocking UI
      getDocData<Customer>('customers', fbUser.uid)
        .then((directDoc) => {
          if (directDoc) {
            updateDocData('customers', fbUser.uid, { lastActivityDate: new Date().toISOString() }).catch(() => {});
            syncCustomerToServer(directDoc, fbUser);
          }
        })
        .catch(() => {});

      // Step 3. New Customer (no existing profile found yet)
      setNeedsWhatsappPrompt(true);
      setPendingAuthUser(fbUser);
      setCustomer(null);
      return null;
    } catch (err) {
      LoggerService.error('CustomerAuthContext', 'Error in syncAndLoadCustomer', err);
      return null;
    }
  };

  // Firebase Auth State Observer
  useEffect(() => {
    setIsAuthLoading(true);

    // Check for pending redirect sign-in result (mobile/popup fallback)
    checkGoogleRedirectResult()
      .then(async (redirectUser) => {
        if (redirectUser) {
          setFirebaseUser(redirectUser);
          await syncAndLoadCustomer(redirectUser);
        }
      })
      .catch((err) => {
        LoggerService.warn('CustomerAuthContext', 'checkGoogleRedirectResult warning:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        await syncAndLoadCustomer(fbUser);
      } else {
        setFirebaseUser(null);
        setCustomer(null);
        setNeedsWhatsappPrompt(false);
        setPendingAuthUser(null);
        setConflictError(null);
        firestoreStorageAdapter.removeItem(STORAGE_KEY_IDENTITY);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = (onSuccessAction?: () => void) => {
    if (onSuccessAction) {
      setPendingAction(() => onSuccessAction);
    }
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    setConflictError(null);
    try {
      await signInWithGoogleRedirect();
      return { success: true };
    } catch (err: any) {
      LoggerService.error('CustomerAuthContext', 'Google sign-in redirect failed', err);
      setIsAuthLoading(false);
      return { success: false, message: err?.message || 'فشل تسجيل الدخول بواسطة Google' };
    }
  };

  const completeWhatsAppRegistration = async (whatsappPhone: string) => {
    const activeUser = pendingAuthUser || firebaseUser || auth.currentUser;
    if (!activeUser) {
      return { success: false, message: 'جلسة تسجيل الدخول غير نشطة. يرجى محاولة تسجيل الدخول بجوجل مجدداً.' };
    }

    const valPhone = PhoneValidator.validateEgyptianPhoneDetailed(whatsappPhone);
    if (!valPhone.isValid) {
      return {
        success: false,
        message: valPhone.errorMessage || 'رقم الواتساب يجب أن يكون رقم مصري صحيح (11 رقم يبدأ بـ 01)',
      };
    }

    const uid = activeUser.uid;
    const normalizedPhone = valPhone.normalizedNumber;

    const newCustomerRecord: Customer = {
      id: uid,
      firebaseUid: uid,
      fullName: activeUser.displayName || 'عميل محترم',
      email: activeUser.email || '',
      primaryPhone: normalizedPhone,
      whatsappPhone: normalizedPhone,
      preferredContactMethod: 'whatsapp',
      status: 'active',
      tags: ['Google Auth', 'حساب موثق'],
      firstContactDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      totalRequests: 0,
      totalPurchases: 0,
      totalReservations: 0,
      totalSpent: 0,
      address: {
        governorate: 'القاهرة',
        cityArea: 'المعادي',
        streetAddress: '',
      },
      notes: [],
      communicationLogs: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'العميل',
          eventType: 'customer_created',
          title: 'تسجيل حساب جديد عبر Google',
          description: `تم إنشاء الحساب بـ Google وتوثيق رقم الواتساب (${normalizedPhone})`,
        },
      ],
      documents: [],
      visitedProducts: [],
      isArchived: false,
    };

    try {
      // Fire non-blocking Firestore save in background for compatibility
      setDocData('customers', newCustomerRecord).catch((fErr) => {
        LoggerService.warn('CustomerAuthContext', 'Non-blocking Firestore setDocData failed:', fErr);
      });

      // Save to repository & sync to Supabase backend API
      try {
        defaultCustomerRepository.save(newCustomerRecord);
      } catch (saveErr) {
        LoggerService.warn('CustomerAuthContext', 'Repository save warning:', saveErr);
      }
      syncCustomerToServer(newCustomerRecord, activeUser);

      const normalized = normalizeCustomer(newCustomerRecord);
      setCustomer(normalized);
      setNeedsWhatsappPrompt(false);
      setPendingAuthUser(null);
      setLoginModalOpen(false);
      firestoreStorageAdapter.setItem(STORAGE_KEY_IDENTITY, normalized);

      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
          setPendingAction(null);
        }, 100);
      }

      return { success: true, message: 'تم إنشاء وتوثيق حسابك بنجاح' };
    } catch (err: any) {
      LoggerService.error('CustomerAuthContext', 'Failed to save new customer document', err);
      return { success: false, message: 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.' };
    }
  };

  const logoutCustomer = async () => {
    try {
      await logoutUser();
    } catch (err) {
      LoggerService.warn('CustomerAuthContext', 'Logout warning', err);
    } finally {
      setFirebaseUser(null);
      setCustomer(null);
      setNeedsWhatsappPrompt(false);
      setPendingAuthUser(null);
      setConflictError(null);
      firestoreStorageAdapter.removeItem(STORAGE_KEY_IDENTITY);
      LoggerService.info('CustomerAuthContext', 'Customer logged out cleanly');
    }
  };

  const requireCustomerAuth = (actionCallback: () => void): boolean => {
    if (customer && customer.verified) {
      actionCallback();
      return true;
    }
    openLoginModal(actionCallback);
    return false;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        firebaseUser,
        customer,
        isCustomerAuthenticated: !!(customer && customer.verified),
        isAuthLoading,
        loginModalOpen,
        needsWhatsappPrompt,
        pendingAuthUser,
        conflictError,
        openLoginModal,
        closeLoginModal,
        signInWithGoogle,
        completeWhatsAppRegistration,
        logoutCustomer,
        requireCustomerAuth,
        getDeviceInfo: getClientDeviceInfo,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
