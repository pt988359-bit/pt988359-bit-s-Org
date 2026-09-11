/**
 * Enterprise Architecture - Centralized Domain Errors
 * Phase 14.5 Refactoring
 */

export abstract class AppError extends Error {
  public abstract readonly code: string;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly code = 'VALIDATION_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class RepositoryError extends AppError {
  public readonly code = 'REPOSITORY_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class StorageError extends AppError {
  public readonly code = 'STORAGE_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class PermissionError extends AppError {
  public readonly code = 'PERMISSION_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class BusinessRuleError extends AppError {
  public readonly code = 'BUSINESS_RULE_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class AIApprovalError extends AppError {
  public readonly code = 'AI_APPROVAL_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
