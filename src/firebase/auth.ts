import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { app } from './firebase';
import { LoggerService } from '../core/services/LoggerService';

let auth: Auth;

try {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    LoggerService.warn('FirebaseAuth', 'Failed to set persistence', err);
  });
} catch (error) {
  LoggerService.warn('FirebaseAuth', 'Failed to initialize Firebase Auth', error);
  auth = getAuth(app);
}

export { auth };

export async function loginWithEmail(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: cred.user };
  } catch (error: any) {
    LoggerService.warn('FirebaseAuth', 'Email login failed', error);
    return { success: false, error: error.message || 'Login failed' };
  }
}

export async function registerWithEmail(email: string, pass: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return { success: true, user: cred.user };
  } catch (error: any) {
    LoggerService.warn('FirebaseAuth', 'Registration failed', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    LoggerService.warn('FirebaseAuth', 'Sign out failed', error);
    return { success: false, error: error.message || 'Sign out failed' };
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  try {
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        LoggerService.info('FirebaseAuth', 'Recaptcha verified');
      },
    });
  } catch (error) {
    LoggerService.warn('FirebaseAuth', 'Recaptcha setup failed', error);
    return null;
  }
}

export async function sendOtpToPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult | null> {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    LoggerService.warn('FirebaseAuth', 'Send OTP failed', error);
    return null;
  }
}

export async function checkGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      LoggerService.info('FirebaseAuth', 'Successfully signed in via Google Redirect result', result.user.email);
      return result.user;
    }
  } catch (error: any) {
    LoggerService.warn('FirebaseAuth', 'Error checking Google redirect result:', error);
  }
  return null;
}

export async function signInWithGoogleRedirect(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    LoggerService.info('FirebaseAuth', 'Initiating Google sign-in with redirect');
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    LoggerService.error('FirebaseAuth', 'Google sign-in redirect error:', error);
    throw new Error('فشل بدء تسجيل الدخول بواسطة Google. يرجى المحاولة مرة أخرى.');
  }
}

// Keep signInWithGooglePopup export as an alias pointing to redirect for full backwards-compatibility
export async function signInWithGooglePopup(): Promise<User | null> {
  await signInWithGoogleRedirect();
  return null;
}

