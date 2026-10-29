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
  identifyCustomer: (name: string, phone: string) => Promise<{ success: boolean; message?: string; customer?: any }>;
  loginWithNameAndPhone: (name: string, phone: string) => Promise<{ success: boolean; message?: string; customer?: any }>;
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

  const normalizeCustomer = (cust: any): Customer & { name: string; phone: string; verified: boolean } => {
    const rawPhone = cust.whatsappPhone || cust.primaryPhone || cust.phone || '';
    const rawName = cust.fullName || cust.name || 'عميل PRO TECK';
    return {
      ...cust,
      fullName: rawName,
      name: rawName,
      primaryPhone: rawPhone,
      whatsappPhone: rawPhone,
      phone: rawPhone,
      address: {
        governorate: cust.address?.governorate || '',
        cityArea: cust.address?.cityArea || '',
        streetAddress: cust.address?.streetAddress || '',
      },
      verified: true,
    };
  };

  // Load saved customer identity on startup
  useEffect(() => {
    try {
      const saved = firestoreStorageAdapter.getItem<any>(STORAGE_KEY_IDENTITY);
      if (saved && (saved.phone || saved.primaryPhone || saved.whatsappPhone)) {
        const normalized = normalizeCustomer(saved);
        setCustomer(normalized);
        LoggerService.info('CustomerAuthContext', 'Restored customer session from local storage:', { phone: normalized.phone, name: normalized.name });
      }
    } catch (err) {
      LoggerService.warn('CustomerAuthContext', 'Error loading stored customer identity:', err);
    } finally {
      setIsAuthLoading(false);
    }
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

  // Fast Identification via Server Endpoint (Name + Egyptian Mobile)
  const identifyCustomer = async (name: string, phone: string) => {
    setIsAuthLoading(true);
    setConflictError(null);
    try {
      const res = await fetch('/api/customers/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.error || 'تعذر تسجيل الدخول بالاسم ورقم الهاتف');
      }

      const normalized = normalizeCustomer(data.customer);
      setCustomer(normalized);
      firestoreStorageAdapter.setItem(STORAGE_KEY_IDENTITY, normalized);

      try {
        defaultCustomerRepository.save(normalized);
      } catch (repoErr) {
        LoggerService.warn('CustomerAuthContext', 'Repository save warning:', repoErr);
      }

      setLoginModalOpen(false);

      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
          setPendingAction(null);
        }, 100);
      }

      LoggerService.info('CustomerAuthContext', 'Customer identified successfully:', { id: normalized.id, name: normalized.name, phone: normalized.phone });
      return { success: true, customer: normalized };
    } catch (err: any) {
      const message = err?.message || 'حدث خطأ أثناء تسجيل الدخول بالاسم ورقم الهاتف';
      setConflictError(message);
      LoggerService.error('CustomerAuthContext', 'Customer identify failed:', err);
      return { success: false, message };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithNameAndPhone = identifyCustomer;

  /*
   * [GOOGLE SIGN-IN DISABLED IN FAVOR OF NAME & PHONE LOGIN]
   * In-app browsers (WhatsApp/Instagram/Facebook webviews) frequently block or fail Google redirect OAuth.
   * Replaced with direct Name & Phone authentication via /api/customers/identify.
   * Kept signature intact for full backwards-compatibility.
   */
  const signInWithGoogle = async () => {
    openLoginModal();
    return { success: true };
  };

  /*
   * [LEGACY GOOGLE AUTH / WHATSAPP REGISTRATION]
   * Preserved for backwards compatibility with any remaining callers.
   */
  const completeWhatsAppRegistration = async (whatsappPhone: string) => {
    if (customer?.name) {
      return identifyCustomer(customer.name, whatsappPhone);
    }
    return identifyCustomer('عميل PRO TECK', whatsappPhone);
  };

  const logoutCustomer = async () => {
    try {
      firestoreStorageAdapter.removeItem(STORAGE_KEY_IDENTITY);
      setCustomer(null);
      setFirebaseUser(null);
      setNeedsWhatsappPrompt(false);
      setPendingAuthUser(null);
      setConflictError(null);
      LoggerService.info('CustomerAuthContext', 'Customer logged out cleanly');
    } catch (err) {
      LoggerService.warn('CustomerAuthContext', 'Logout warning:', err);
    }
  };

  const requireCustomerAuth = (actionCallback: () => void): boolean => {
    if (customer && (customer.phone || customer.primaryPhone)) {
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
        isCustomerAuthenticated: !!(customer && (customer.phone || customer.primaryPhone || customer.whatsappPhone)),
        isAuthLoading,
        loginModalOpen,
        needsWhatsappPrompt,
        pendingAuthUser,
        conflictError,
        openLoginModal,
        closeLoginModal,
        signInWithGoogle,
        identifyCustomer,
        loginWithNameAndPhone,
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
