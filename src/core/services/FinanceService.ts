/**
 * Enterprise Architecture - Pure Business Calculation & Orchestration Service for Finance
 * Phase 14.7 Architecture Hardening
 *
 * Employs Split Repositories, Atomic Sequences, Transaction Engine, EventBus, Logger & Metrics.
 */

import {
  ExpenseItem,
  ProductCostSheet,
  CashLedgerEntry,
  BusinessOverviewMetrics,
  ProfitSimulationResult,
} from '../../types/adminFinance';

import { ExpenseRepository, defaultExpenseRepository } from '../repositories/ExpenseRepository';
import { CashLedgerRepository, defaultCashLedgerRepository } from '../repositories/CashLedgerRepository';
import { FinancialTimelineRepository, defaultFinancialTimelineRepository } from '../repositories/FinancialTimelineRepository';
import { PurchaseRepository, defaultPurchaseRepository } from '../repositories/PurchaseRepository';
import {
  ReservationRepository,
  defaultReservationRepository,
  CompletedSaleRepository,
  defaultCompletedSaleRepository,
} from '../repositories/OrderRepository';
import { SequenceService, defaultSequenceService } from './SequenceService';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { EventBus } from '../events/EventBus';
import { ExpenseCreatedEvent } from '../events/DomainEvents';
import { FinanceValidator } from '../validators/FinanceValidator';
import { IdGenerator } from './IdGenerator';
import { DateTimeService } from './DateTimeService';
import { LoggerService } from './LoggerService';
import { MetricsService } from './MetricsService';
import { MAGIC_NUMBERS } from '../config/magicNumbers';

export class FinanceService {
  constructor(
    private readonly expenseRepo: ExpenseRepository = defaultExpenseRepository,
    private readonly cashRepo: CashLedgerRepository = defaultCashLedgerRepository,
    private readonly timelineRepo: FinancialTimelineRepository = defaultFinancialTimelineRepository,
    private readonly sequenceService: SequenceService = defaultSequenceService,
    private readonly purchaseRepo: PurchaseRepository = defaultPurchaseRepository,
    private readonly reservationRepo: ReservationRepository = defaultReservationRepository,
    private readonly completedSaleRepo: CompletedSaleRepository = defaultCompletedSaleRepository
  ) {}

  public recordExpense(payload: {
    category: string;
    categoryLabelAr: string;
    amount: number;
    description: string;
    relatedProductId?: string;
    relatedProductTitle?: string;
    supplierId?: string;
    supplierName?: string;
    createdBy: string;
    notes?: string;
  }): ExpenseItem {
    const startTime = performance.now();
    LoggerService.info('FinanceService', 'Processing expense recording transaction', payload);

    try {
      FinanceValidator.validateExpense(payload.amount, payload.category, payload.description);
    } catch (err) {
      MetricsService.trackValidationFailure();
      throw err;
    }

    const referenceNumber = this.sequenceService.generateNextReference('expense');
    const id = IdGenerator.generateUniqueId('exp');

    const newExpense: ExpenseItem = {
      id,
      referenceNumber,
      category: payload.category as ExpenseItem['category'],
      categoryLabelAr: payload.categoryLabelAr,
      amount: payload.amount,
      description: payload.description,
      relatedProductId: payload.relatedProductId,
      relatedProductTitle: payload.relatedProductTitle,
      supplierId: payload.supplierId,
      supplierName: payload.supplierName,
      createdBy: payload.createdBy,
      date: DateTimeService.todayDateString(),
      notes: payload.notes,
      isArchived: false,
    };

    // Calculate cash ledger entry
    const cashRefNumber = this.sequenceService.generateNextReference('financialLedger');
    const currentBalance = this.cashRepo.getLatestRunningBalance();
    const newBalance = currentBalance - payload.amount;

    const cashEntry: CashLedgerEntry = {
      id: IdGenerator.generateUniqueId('cash'),
      referenceNumber: cashRefNumber,
      type: 'money_out',
      category: payload.categoryLabelAr,
      amount: payload.amount,
      description: `[مصروف] ${payload.description}`,
      relatedReference: referenceNumber,
      createdBy: payload.createdBy,
      timestamp: DateTimeService.nowISO(),
      runningBalance: newBalance,
      isArchived: false,
    };

    // Atomic Transaction Execution via UnitOfWork
    const tx = UnitOfWork.beginTransaction();
    tx.addOperation({
      description: `Save Expense ${referenceNumber}`,
      execute: () => this.expenseRepo.save(newExpense),
      rollback: () => this.expenseRepo.remove(id),
    });

    tx.addOperation({
      description: `Save Cash Ledger ${cashRefNumber}`,
      execute: () => this.cashRepo.save(cashEntry),
      rollback: () => this.cashRepo.remove(cashEntry.id),
    });

    tx.addOperation({
      description: `Save Financial Timeline Event`,
      execute: () =>
        this.timelineRepo.save({
          id: IdGenerator.generateUniqueId('ftime'),
          referenceNumber,
          type: payload.amount > MAGIC_NUMBERS.LARGE_REPAIR_EXPENSE_THRESHOLD ? 'large_repair' : 'expense',
          title: `تسجيل مصروف: ${payload.categoryLabelAr}`,
          description: payload.description,
          amount: payload.amount,
          timestamp: DateTimeService.nowISO(),
          actor: payload.createdBy,
        }),
      rollback: () => {},
    });

    tx.commit();

    // Publish Domain Event
    const domainEvent: ExpenseCreatedEvent = {
      eventId: IdGenerator.generateUUID(),
      eventName: 'ExpenseCreated',
      timestamp: DateTimeService.nowISO(),
      payload: {
        expenseId: id,
        referenceNumber,
        category: payload.categoryLabelAr,
        amount: payload.amount,
        description: payload.description,
        createdBy: payload.createdBy,
      },
    };
    EventBus.publish(domainEvent);

    MetricsService.recordProcessingTime(performance.now() - startTime);
    return newExpense;
  }

  public recordCashFlow(payload: {
    type: 'money_in' | 'money_out';
    category: string;
    amount: number;
    description: string;
    relatedReference?: string;
    createdBy: string;
  }): CashLedgerEntry {
    const referenceNumber = this.sequenceService.generateNextReference('financialLedger');
    const currentBalance = this.cashRepo.getLatestRunningBalance();
    const newBalance = payload.type === 'money_in' ? currentBalance + payload.amount : currentBalance - payload.amount;

    const entry: CashLedgerEntry = {
      id: IdGenerator.generateUniqueId('cash'),
      referenceNumber,
      type: payload.type,
      category: payload.category,
      amount: payload.amount,
      description: payload.description,
      relatedReference: payload.relatedReference,
      createdBy: payload.createdBy,
      timestamp: DateTimeService.nowISO(),
      runningBalance: newBalance,
      isArchived: false,
    };

    return this.cashRepo.save(entry);
  }

  public calculateCostSheetTotal(sheet: Omit<ProductCostSheet, 'totalCost' | 'targetProfitMarginPercent'>): number {
    return (
      (sheet.purchaseCost || 0) +
      (sheet.transportationCost || 0) +
      (sheet.repairCost || 0) +
      (sheet.cleaningCost || 0) +
      (sheet.accessoriesCost || 0) +
      (sheet.laborCost || 0) +
      (sheet.otherCosts || 0)
    );
  }

  public simulateProfit(
    totalCost: number,
    proposedSellingPrice: number,
    minAcceptablePrice: number
  ): ProfitSimulationResult {
    const grossProfit = proposedSellingPrice - totalCost;
    const profitMarginPercent = proposedSellingPrice > 0 ? (grossProfit / proposedSellingPrice) * 100 : 0;

    let safetyZoneStatus: 'safe' | 'warning' | 'danger' = 'safe';
    let warningMessage: string | undefined = undefined;

    if (proposedSellingPrice < minAcceptablePrice) {
      safetyZoneStatus = 'danger';
      warningMessage = `تنبيه حرج: السعر المقترح (${proposedSellingPrice.toLocaleString('ar-EG')} ج.م) أقل من الحد الأدنى المقبول (${minAcceptablePrice.toLocaleString('ar-EG')} ج.م). التخفيض يتطلب التجاوز الصريح من الأدمن.`;
    } else if (profitMarginPercent < MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT) {
      safetyZoneStatus = 'warning';
      warningMessage = `تنبيه: هامش الربح الحالي (${profitMarginPercent.toFixed(1)}%) ضئيل للغاية وأقل من النسبة المستهدفة (${MAGIC_NUMBERS.MIN_ACCEPTABLE_PROFIT_MARGIN_PERCENT}%).`;
    }

    return {
      productId: 'simulated',
      productTitle: 'محاكاة تفاوض السعر',
      totalCost,
      proposedSellingPrice,
      grossProfit,
      profitMarginPercent,
      minimumAcceptablePrice: minAcceptablePrice,
      safetyZoneStatus,
      warningMessage,
      canOverride: true,
    };
  }

  public getOverviewMetrics(): BusinessOverviewMetrics {
    const expenses = this.expenseRepo.getActiveExpenses();
    const ledger = this.cashRepo.getActiveEntries();
    const todayStr = DateTimeService.todayDateString();
    const currentMonthStr = todayStr.substring(0, 7);

    // Today expenses from actual active expenses recorded today
    const todayExpenses = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Today revenue from actual cash ledger entries of type 'money_in' recorded today
    const todayMoneyIn = ledger
      .filter((c) => c.timestamp && c.timestamp.startsWith(todayStr) && c.type === 'money_in')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    // Estimated today profit from actual revenues and expenses (0 if no data exists)
    const estimatedTodayProfit =
      todayMoneyIn > 0 || todayExpenses > 0 ? todayMoneyIn - todayExpenses : 0;

    // Monthly revenue from actual cash ledger entries of type 'money_in' in current month
    const monthlyRevenue = ledger
      .filter((c) => c.timestamp && c.timestamp.startsWith(currentMonthStr) && c.type === 'money_in')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    // Monthly expenses from actual active expenses in current month
    const monthlyExpenses = expenses
      .filter((e) => e.date && e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Monthly profit from actual monthly revenue and expenses (0 if no data exists)
    const monthlyProfit =
      monthlyRevenue > 0 || monthlyExpenses > 0 ? monthlyRevenue - monthlyExpenses : 0;

    // Outstanding balances: actual unpaid balance on active/confirmed reservations
    const reservations = this.reservationRepo.getAll();
    const activeReservations = reservations.filter(
      (r) =>
        !r.isArchived &&
        (r.status === 'Reserved' ||
          r.status === 'confirmed' ||
          r.status === 'pending')
    );
    const outstandingBalances = activeReservations.reduce(
      (sum, r) => sum + (r.remainingBalance || 0),
      0
    );

    // Products sold this month from completed sales records
    const completedSales = this.completedSaleRepo.getAll();
    const productsSoldMonth = completedSales.filter(
      (s) => s.completionDate && s.completionDate.startsWith(currentMonthStr)
    ).length;

    // Products purchased this month from purchase history records
    const purchases = this.purchaseRepo.getAll();
    const productsPurchasedMonth = purchases.filter(
      (p) => p.purchaseDate && p.purchaseDate.startsWith(currentMonthStr)
    ).length;

    // Active reserved products count
    const productsReservedActive = activeReservations.length;

    return {
      todayRevenue: todayMoneyIn,
      todayExpenses,
      estimatedTodayProfit,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      outstandingBalances,
      productsSoldMonth,
      productsPurchasedMonth,
      productsReservedActive,
    };
  }
}

export const defaultFinanceService = new FinanceService();
