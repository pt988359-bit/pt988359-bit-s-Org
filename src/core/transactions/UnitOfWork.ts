/**
 * Enterprise Architecture - Unit of Work & Transaction Engine
 * Phase 14.7 Architecture Hardening
 *
 * Guarantees atomic operations across multiple repositories.
 * Prepares the codebase for native Firestore transaction batching.
 */

import { LoggerService } from '../services/LoggerService';
import { MetricsService } from '../services/MetricsService';
import { StorageError } from '../errors/DomainErrors';
import { IdGenerator } from '../services/IdGenerator';

export interface PendingOperation {
  description: string;
  execute: () => void;
  rollback: () => void;
}

export class Transaction {
  private operations: PendingOperation[] = [];
  private executedOperations: PendingOperation[] = [];
  private isCommitted = false;
  private isRolledBack = false;

  constructor(public readonly transactionId: string) {
    LoggerService.info('Transaction', `Began transaction [${transactionId}]`);
  }

  public addOperation(op: PendingOperation): void {
    if (this.isCommitted || this.isRolledBack) {
      throw new StorageError(`Cannot add operation to ${this.isCommitted ? 'committed' : 'rolled back'} transaction`);
    }
    this.operations.push(op);
  }

  public commit(): void {
    if (this.isCommitted) return;
    MetricsService.trackTransaction();

    try {
      for (const op of this.operations) {
        LoggerService.debug('Transaction', `Executing op: ${op.description}`);
        op.execute();
        this.executedOperations.push(op);
      }
      this.isCommitted = true;
      LoggerService.info('Transaction', `Successfully committed transaction [${this.transactionId}] with ${this.operations.length} ops`);
    } catch (error) {
      LoggerService.error('Transaction', `Commit failed for [${this.transactionId}]. Triggering rollback.`, error);
      this.rollback();
      throw new StorageError(`Transaction commit failed: ${this.transactionId}`, { error });
    }
  }

  public rollback(): void {
    if (this.isRolledBack) return;
    LoggerService.warn('Transaction', `Rolling back transaction [${this.transactionId}] (${this.executedOperations.length} ops executed)`);

    for (let i = this.executedOperations.length - 1; i >= 0; i--) {
      try {
        this.executedOperations[i].rollback();
      } catch (err) {
        LoggerService.error('Transaction', `Failed during rollback of op: ${this.executedOperations[i].description}`, err);
      }
    }
    this.isRolledBack = true;
  }
}

export class UnitOfWork {
  public static beginTransaction(): Transaction {
    const txId = IdGenerator.generateUniqueId('tx');
    return new Transaction(txId);
  }
}
