/**
 * Enterprise Architecture - Finance Repository
 * Phase 14.5 Refactoring
 *
 * Encapsulates all finance-related storage access behind standard repository calls.
 */

import { BaseRepository } from './BaseRepository';
import { StorageAdapter } from '../storage/StorageAdapter';
import { firestoreStorageAdapter } from '../storage/FirestoreStorageAdapter';
import { FIRESTORE_COLLECTIONS } from '../config/FirestoreConfig';
import {
  ExpenseItem,
  ProductCostSheet,
  CashLedgerEntry,
  ProcurementItem,
  SupplierRecord,
  AppliancePurchaseRecord,
  FinancialTimelineEvent,
  FinancialAlert,
} from '../../types/adminFinance';

const EXPENSES_KEY = FIRESTORE_COLLECTIONS.EXPENSES;
const COST_SHEETS_KEY = FIRESTORE_COLLECTIONS.COST_SHEETS;
const CASH_LEDGER_KEY = FIRESTORE_COLLECTIONS.CASH_LEDGERS;
const PROCUREMENT_KEY = FIRESTORE_COLLECTIONS.PROCUREMENT;
const SUPPLIERS_KEY = FIRESTORE_COLLECTIONS.SUPPLIERS;
const PURCHASE_HISTORY_KEY = FIRESTORE_COLLECTIONS.PURCHASE_HISTORY;
const TIMELINE_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_TIMELINE;
const ALERTS_KEY = FIRESTORE_COLLECTIONS.FINANCIAL_ALERTS;

export class FinanceRepository extends BaseRepository<ExpenseItem> {
  constructor(storage: StorageAdapter = firestoreStorageAdapter) {
    super(EXPENSES_KEY, storage);
  }

  // Expenses
  public getExpenses(): ExpenseItem[] {
    return this.getAll();
  }

  public saveExpense(expense: ExpenseItem): ExpenseItem {
    return this.save(expense);
  }

  // Cost Sheets
  public getCostSheets(): ProductCostSheet[] {
    return this.storage.getCollection<ProductCostSheet>(COST_SHEETS_KEY);
  }

  public getCostSheetByProductId(productId: string): ProductCostSheet | null {
    const sheets = this.getCostSheets();
    return sheets.find((s) => s.productId === productId) || null;
  }

  public saveCostSheet(sheet: ProductCostSheet): void {
    const sheets = this.getCostSheets();
    const index = sheets.findIndex((s) => s.productId === sheet.productId);
    let updated: ProductCostSheet[];
    if (index >= 0) {
      updated = [...sheets];
      updated[index] = sheet;
    } else {
      updated = [sheet, ...sheets];
    }
    this.storage.saveCollection(COST_SHEETS_KEY, updated);
  }

  // Cash Ledger
  public getCashLedger(): CashLedgerEntry[] {
    return this.storage.getCollection<CashLedgerEntry>(CASH_LEDGER_KEY);
  }

  public saveCashLedgerEntry(entry: CashLedgerEntry): CashLedgerEntry {
    const ledger = this.getCashLedger();
    const updated = [entry, ...ledger];
    this.storage.saveCollection(CASH_LEDGER_KEY, updated);
    return entry;
  }

  // Procurement
  public getProcurementItems(): ProcurementItem[] {
    return this.storage.getCollection<ProcurementItem>(PROCUREMENT_KEY);
  }

  public saveProcurementItem(item: ProcurementItem): ProcurementItem {
    const list = this.getProcurementItems();
    const index = list.findIndex((p) => p.id === item.id);
    let updated: ProcurementItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [item, ...list];
    }
    this.storage.saveCollection(PROCUREMENT_KEY, updated);
    return item;
  }

  // Suppliers
  public getSuppliers(): SupplierRecord[] {
    return this.storage.getCollection<SupplierRecord>(SUPPLIERS_KEY);
  }

  public saveSupplier(supplier: SupplierRecord): SupplierRecord {
    const list = this.getSuppliers();
    const index = list.findIndex((s) => s.id === supplier.id);
    let updated: SupplierRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = supplier;
    } else {
      updated = [supplier, ...list];
    }
    this.storage.saveCollection(SUPPLIERS_KEY, updated);
    return supplier;
  }

  // Purchase History
  public getPurchaseHistory(): AppliancePurchaseRecord[] {
    return this.storage.getCollection<AppliancePurchaseRecord>(PURCHASE_HISTORY_KEY);
  }

  public savePurchaseRecord(record: AppliancePurchaseRecord): AppliancePurchaseRecord {
    const history = this.getPurchaseHistory();
    const updated = [record, ...history];
    this.storage.saveCollection(PURCHASE_HISTORY_KEY, updated);
    return record;
  }

  // Timeline
  public getFinancialTimeline(): FinancialTimelineEvent[] {
    return this.storage.getCollection<FinancialTimelineEvent>(TIMELINE_KEY);
  }

  public addTimelineEvent(event: FinancialTimelineEvent): void {
    const events = this.getFinancialTimeline();
    const updated = [event, ...events];
    this.storage.saveCollection(TIMELINE_KEY, updated);
  }

  // Alerts
  public getFinancialAlerts(): FinancialAlert[] {
    return this.storage.getCollection<FinancialAlert>(ALERTS_KEY);
  }

  public acknowledgeAlert(alertId: string): void {
    const alerts = this.getFinancialAlerts();
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a));
    this.storage.saveCollection(ALERTS_KEY, updated);
  }
}

export const defaultFinanceRepository = new FinanceRepository();
