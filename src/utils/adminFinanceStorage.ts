/**
 * Admin Finance Storage Adapter (Refactored to Enterprise Architecture Phase 14.7)
 * Phase 14.7 Architecture Hardening
 *
 * Facade bridging legacy utility callers to Split Repositories, Atomic Sequences, and Business Services.
 */

import {
  ExpenseItem,
  ProductCostSheet,
  CashLedgerEntry,
  ProcurementItem,
  SupplierRecord,
  AppliancePurchaseRecord,
  FinancialTimelineEvent,
  FinancialAlert,
  BusinessOverviewMetrics,
  ProfitSimulationResult,
} from '../types/adminFinance';

import { defaultExpenseRepository } from '../core/repositories/ExpenseRepository';
import { defaultCashLedgerRepository } from '../core/repositories/CashLedgerRepository';
import { defaultCostSheetRepository } from '../core/repositories/CostSheetRepository';
import { defaultSupplierRepository } from '../core/repositories/SupplierRepository';
import { defaultPurchaseRepository } from '../core/repositories/PurchaseRepository';
import { defaultFinancialAlertRepository } from '../core/repositories/FinancialAlertRepository';
import { defaultFinancialTimelineRepository } from '../core/repositories/FinancialTimelineRepository';
import { defaultProcurementRepository } from '../core/repositories/ProcurementRepository';

import { defaultFinanceService } from '../core/services/FinanceService';
import { defaultSequenceService } from '../core/services/SequenceService';
import { DateTimeService } from '../core/services/DateTimeService';
import { IdGenerator } from '../core/services/IdGenerator';
import { defaultStorageAdapter } from '../core/storage/LocalStorageAdapter';
import { FIRESTORE_COLLECTIONS } from '../core/config/FirestoreConfig';

const EXPENSES_STORAGE_KEY = FIRESTORE_COLLECTIONS.EXPENSES;
const COST_SHEETS_STORAGE_KEY = FIRESTORE_COLLECTIONS.COST_SHEETS;
const CASH_LEDGER_STORAGE_KEY = FIRESTORE_COLLECTIONS.CASH_LEDGERS;
const PROCUREMENT_STORAGE_KEY = FIRESTORE_COLLECTIONS.PROCUREMENT;
const SUPPLIERS_STORAGE_KEY = FIRESTORE_COLLECTIONS.SUPPLIERS;
const PURCHASE_HISTORY_STORAGE_KEY = FIRESTORE_COLLECTIONS.PURCHASE_HISTORY;
const TIMELINE_STORAGE_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_TIMELINE;
const ALERTS_STORAGE_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_ALERTS;

const LEGACY_STORAGE_MAP: Record<string, string> = {
  'proteck_admin_expenses_v1': FIRESTORE_COLLECTIONS.EXPENSES,
  'proteck_admin_cost_sheets_v1': FIRESTORE_COLLECTIONS.COST_SHEETS,
  'proteck_admin_cash_ledger_v1': FIRESTORE_COLLECTIONS.CASH_LEDGERS,
  'proteck_admin_procurement_v1': FIRESTORE_COLLECTIONS.PROCUREMENT,
  'proteck_admin_suppliers_v1': FIRESTORE_COLLECTIONS.SUPPLIERS,
  'proteck_admin_purchase_history_v1': FIRESTORE_COLLECTIONS.PURCHASE_HISTORY,
  'proteck_admin_financial_timeline_v1': FIRESTORE_COLLECTIONS.FINANCIAL_TIMELINE,
  'proteck_admin_financial_alerts_v1': FIRESTORE_COLLECTIONS.FINANCIAL_ALERTS,
};

export function migrateLegacyFinanceData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    Object.entries(LEGACY_STORAGE_MAP).forEach(([legacyKey, newKey]) => {
      const rawLegacy = window.localStorage.getItem(legacyKey);
      if (rawLegacy && rawLegacy !== '[]' && rawLegacy !== 'null' && rawLegacy !== '{}') {
        const rawNew = window.localStorage.getItem(newKey);
        if (!rawNew || rawNew === '[]' || rawNew === 'null') {
          window.localStorage.setItem(newKey, rawLegacy);
        }
      }
    });
  } catch (err) {
    // Fail-safe
  }
}

migrateLegacyFinanceData();

// Seed initial data using StorageAdapter
const INITIAL_EXPENSES: ExpenseItem[] = [];

const INITIAL_COST_SHEETS: ProductCostSheet[] = [];

const INITIAL_CASH_LEDGER: CashLedgerEntry[] = [];

const INITIAL_PROCUREMENT: ProcurementItem[] = [];

const INITIAL_SUPPLIERS: SupplierRecord[] = [];

const INITIAL_PURCHASE_HISTORY: AppliancePurchaseRecord[] = [];

const INITIAL_TIMELINE: FinancialTimelineEvent[] = [];

const INITIAL_ALERTS: FinancialAlert[] = [];

function ensureSeeded(): void {
  migrateLegacyFinanceData();
  if (defaultStorageAdapter.getCollection(EXPENSES_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(EXPENSES_STORAGE_KEY, INITIAL_EXPENSES);
  }
  if (defaultStorageAdapter.getCollection(COST_SHEETS_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(COST_SHEETS_STORAGE_KEY, INITIAL_COST_SHEETS);
  }
  if (defaultStorageAdapter.getCollection(CASH_LEDGER_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(CASH_LEDGER_STORAGE_KEY, INITIAL_CASH_LEDGER);
  }
  if (defaultStorageAdapter.getCollection(PROCUREMENT_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(PROCUREMENT_STORAGE_KEY, INITIAL_PROCUREMENT);
  }
  if (defaultStorageAdapter.getCollection(SUPPLIERS_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(SUPPLIERS_STORAGE_KEY, INITIAL_SUPPLIERS);
  }
  if (defaultStorageAdapter.getCollection(PURCHASE_HISTORY_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(PURCHASE_HISTORY_STORAGE_KEY, INITIAL_PURCHASE_HISTORY);
  }
  if (defaultStorageAdapter.getCollection(TIMELINE_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(TIMELINE_STORAGE_KEY, INITIAL_TIMELINE);
  }
  if (defaultStorageAdapter.getCollection(ALERTS_STORAGE_KEY).length === 0) {
    defaultStorageAdapter.saveCollection(ALERTS_STORAGE_KEY, INITIAL_ALERTS);
  }
}

ensureSeeded();

// Split Repository Facades
export function getExpenses(): ExpenseItem[] {
  ensureSeeded();
  return defaultExpenseRepository.getAll();
}

export async function saveExpense(expenseData: Omit<ExpenseItem, 'id' | 'referenceNumber' | 'isArchived'>): Promise<ExpenseItem> {
  return await defaultFinanceService.recordExpense({
    category: expenseData.category,
    categoryLabelAr: expenseData.categoryLabelAr,
    amount: expenseData.amount,
    description: expenseData.description,
    relatedProductId: expenseData.relatedProductId,
    relatedProductTitle: expenseData.relatedProductTitle,
    supplierId: expenseData.supplierId,
    supplierName: expenseData.supplierName,
    createdBy: expenseData.createdBy,
    notes: expenseData.notes,
  });
}

export function archiveExpense(id: string): void {
  const item = defaultExpenseRepository.getById(id);
  if (item) {
    defaultExpenseRepository.save({ ...item, isArchived: true });
  }
}

export function getCostSheets(): ProductCostSheet[] {
  ensureSeeded();
  return defaultCostSheetRepository.getAll();
}

export function saveCostSheet(sheet: ProductCostSheet): void {
  const totalCost = defaultFinanceService.calculateCostSheetTotal(sheet);
  const calculatedSheet: ProductCostSheet = {
    ...sheet,
    totalCost,
  };
  defaultCostSheetRepository.saveSheet(calculatedSheet);
}

export function calculateProfitSimulation(
  totalCost: number,
  proposedSellingPrice: number,
  minAcceptablePrice: number
): ProfitSimulationResult {
  return defaultFinanceService.simulateProfit(totalCost, proposedSellingPrice, minAcceptablePrice);
}

export function getCashLedger(): CashLedgerEntry[] {
  ensureSeeded();
  return defaultCashLedgerRepository.getAll();
}

export async function addCashLedgerEntry(entry: {
  type: 'money_in' | 'money_out';
  category: string;
  amount: number;
  description: string;
  relatedReference?: string;
  createdBy: string;
}): Promise<CashLedgerEntry> {
  return await defaultFinanceService.recordCashFlow(entry);
}

export function getProcurementItems(): ProcurementItem[] {
  ensureSeeded();
  return defaultProcurementRepository.getAll();
}

export async function saveProcurementItem(itemData: Omit<ProcurementItem, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'isArchived'>): Promise<ProcurementItem> {
  const ref = await defaultSequenceService.generateNextReference('procurement');
  const newItem: ProcurementItem = {
    ...itemData,
    id: IdGenerator.generateUniqueId('proc'),
    referenceNumber: ref,
    createdAt: DateTimeService.todayDateString(),
    updatedAt: DateTimeService.todayDateString(),
    isArchived: false,
  };

  return defaultProcurementRepository.save(newItem);
}

export function updateProcurementStatus(id: string, status: ProcurementItem['status']): void {
  const target = defaultProcurementRepository.getById(id);
  if (target) {
    target.status = status;
    target.updatedAt = DateTimeService.todayDateString();
    defaultProcurementRepository.save(target);
  }
}

export function getSuppliers(): SupplierRecord[] {
  ensureSeeded();
  return defaultSupplierRepository.getAll();
}

export async function saveSupplier(supplierData: Omit<SupplierRecord, 'id' | 'supplierNumber' | 'purchaseCount' | 'totalSpent' | 'isArchived'>): Promise<SupplierRecord> {
  const ref = await defaultSequenceService.generateNextReference('supplier');
  const newSupplier: SupplierRecord = {
    ...supplierData,
    id: IdGenerator.generateUniqueId('sup'),
    supplierNumber: ref,
    purchaseCount: 0,
    totalSpent: 0,
    isArchived: false,
  };

  return defaultSupplierRepository.save(newSupplier);
}

export function getPurchaseHistory(): AppliancePurchaseRecord[] {
  ensureSeeded();
  return defaultPurchaseRepository.getAll();
}

export function getFinancialTimeline(): FinancialTimelineEvent[] {
  ensureSeeded();
  return defaultFinancialTimelineRepository.getAll();
}

export function addTimelineEvent(eventData: Omit<FinancialTimelineEvent, 'id' | 'timestamp'>): void {
  const newEvt: FinancialTimelineEvent = {
    ...eventData,
    id: IdGenerator.generateUniqueId('ftime'),
    timestamp: DateTimeService.nowISO(),
  };
  defaultFinancialTimelineRepository.save(newEvt);
}

export function getFinancialAlerts(): FinancialAlert[] {
  ensureSeeded();
  return defaultFinancialAlertRepository.getAll();
}

export function acknowledgeAlert(alertId: string): void {
  const alert = defaultFinancialAlertRepository.getById(alertId);
  if (alert) {
    defaultFinancialAlertRepository.save({ ...alert, isAcknowledged: true });
  }
}

export function getBusinessOverviewMetrics(): BusinessOverviewMetrics {
  return defaultFinanceService.getOverviewMetrics();
}

export function exportFinancialReport(format: 'excel' | 'csv' | 'pdf', reportType: string): void {
  const expenses = getExpenses();

  if (format === 'csv') {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Reference,Category,Amount,Description,Date,CreatedBy\n';
    expenses.forEach((e) => {
      csvContent += `"${e.referenceNumber}","${e.categoryLabelAr}",${e.amount},"${e.description}","${e.date}","${e.createdBy}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRO_TECK_Finance_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(`جاري تجهيز وتنزيل ملف التقرير المالي بصيغة (${format.toUpperCase()}) للتقرير: ${reportType}`);
  }
}
