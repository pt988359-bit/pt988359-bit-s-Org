import { firebaseConfig } from '../../firebase/config';
import { LoggerService } from './LoggerService';

export interface ValidationReport {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  configSummary: {
    projectId: string;
    authDomain: string;
    hasDatabaseId: boolean;
    hasStorageBucket: boolean;
    hasApiKey: boolean;
  };
}

/**
 * Enterprise Environment Validator
 * Validates Firebase project configurations, essential environment variables,
 * database pointers, and external API formats prior to production initialization.
 */
export class EnvironmentValidator {
  /**
   * Performs complete environment validation audit.
   */
  static validateEnvironment(): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Firebase API Key
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === '') {
      errors.push('CRITICAL: Firebase API Key (apiKey) is missing in environment or config file.');
    } else if (firebaseConfig.apiKey.startsWith('YOUR_') || firebaseConfig.apiKey.length < 20) {
      errors.push('CRITICAL: Firebase API Key appears to be a placeholder or invalid value.');
    }

    // 2. Project ID
    if (!firebaseConfig.projectId || firebaseConfig.projectId.trim() === '') {
      errors.push('CRITICAL: Firebase Project ID (projectId) is missing.');
    }

    // 3. Firestore Database ID
    if (!firebaseConfig.firestoreDatabaseId) {
      warnings.push('NOTICE: No custom firestoreDatabaseId specified; defaulting to (default) database.');
    }

    // 4. Storage Bucket
    if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket.trim() === '') {
      warnings.push('WARNING: Firebase Storage Bucket (storageBucket) is not configured.');
    } else if (!firebaseConfig.storageBucket.includes('.')) {
      errors.push('INVALID: Storage Bucket format is invalid.');
    }

    // 5. Auth Domain
    if (!firebaseConfig.authDomain) {
      warnings.push('WARNING: Auth Domain is missing; customer authentication redirects may fail.');
    } else if (!firebaseConfig.authDomain.endsWith('.firebaseapp.com') && !firebaseConfig.authDomain.includes('.')) {
      warnings.push('WARNING: Non-standard Auth Domain format detected.');
    }

    const isValid = errors.length === 0;

    const report: ValidationReport = {
      isValid,
      errors,
      warnings,
      configSummary: {
        projectId: firebaseConfig.projectId || 'N/A',
        authDomain: firebaseConfig.authDomain || 'N/A',
        hasDatabaseId: Boolean(firebaseConfig.firestoreDatabaseId),
        hasStorageBucket: Boolean(firebaseConfig.storageBucket),
        hasApiKey: Boolean(firebaseConfig.apiKey),
      },
    };

    if (!isValid) {
      LoggerService.error('EnvironmentValidator', 'Environment validation failed with critical errors:', errors);
    } else {
      LoggerService.info('EnvironmentValidator', 'Environment validation passed successfully.');
    }

    return report;
  }

  /**
   * Enforces strict assertion during server/app startup.
   */
  static assertValidEnvironment(): void {
    const report = this.validateEnvironment();
    if (!report.isValid) {
      throw new Error(
        `[EnvironmentValidator Failure] App cannot start due to missing environment variables:\n${report.errors.join(
          '\n'
        )}`
      );
    }
  }
}
