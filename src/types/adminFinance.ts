export type ExpenseCategory =
  | 'transportation'
  | 'repair'
  | 'cleaning'
  | 'replacement_parts'
  | 'accessories'
  | 'packaging'
  | 'maintenance'
  | 'utilities'
  | 'marketing'
  | 'rent'
  | 'salaries'
  | 'miscellaneous';

export interface ExpenseItem {
  id: string;
  referenceNumber: string; // e.g., EXP-2026-0001
  category: ExpenseCategory;
  categoryLabelAr: string;
  amount: number;
  description: string;
  relatedProductId?: string;
  relatedProductTitle?: string;
  supplierId?: string;
  supplierName?: string;
  createdBy: string;
  date: string;
  attachments?: string[];
  notes?: string;
  isArchived: boolean;
}

export interface ProductCostSheet {
  productId: string;
  productTitle: string;
  productImage: string;
  category: string;
  purchaseCost: number;
  transportationCost: number;
  repairCost: number;
  cleaningCost: number;
  accessoriesCost: number;
  laborCost: number;
  otherCosts: number;
  totalCost: number;
  targetSellingPrice: number;
  minimumAcceptablePrice: number;
  targetProfitMarginPercent: number;
}

export interface ProfitSimulationResult {
  productId: string;
  productTitle: string;
  totalCost: number;
  proposedSellingPrice: number;
  grossProfit: number;
  profitMarginPercent: number;
  minimumAcceptablePrice: number;
  safetyZoneStatus: 'safe' | 'warning' | 'danger';
  warningMessage?: string;
  canOverride: boolean;
}

export interface CashLedgerEntry {
  id: string;
  referenceNumber: string; // e.g., FIN-2026-0001
  type: 'money_in' | 'money_out';
  category: string;
  amount: number;
  description: string;
  relatedReference?: string;
  createdBy: string;
  timestamp: string;
  runningBalance: number;
  isArchived: boolean;
}

export type ProcurementStatus = 'open' | 'searching' | 'found' | 'purchased' | 'cancelled';
export type ProcurementPriority = 'low' | 'medium' | 'high';

export interface ProcurementItem {
  id: string;
  referenceNumber: string; // e.g., PROC-2026-0001
  applianceType: string;
  brand: string;
  preferredModels: string;
  targetPurchasePrice: number;
  maximumPurchasePrice: number;
  priority: ProcurementPriority;
  notes?: string;
  status: ProcurementStatus;
  matchedSellRequestId?: string;
  matchedSellRequestInfo?: {
    customerName: string;
    phone: string;
    askingPrice: number;
    applianceModel: string;
  };
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface SupplierRecord {
  id: string;
  supplierNumber: string; // e.g., SUP-2026-0001
  name: string;
  phone: string;
  whatsapp: string;
  area: string;
  type: 'company' | 'individual';
  preferredCategories: string[];
  purchaseCount: number;
  totalSpent: number;
  lastTransactionDate: string;
  notes?: string;
  rating: number; // 1-5
  isArchived: boolean;
}

export interface AppliancePurchaseRecord {
  id: string;
  referenceNumber: string;
  supplierId: string;
  supplierName: string;
  applianceTitle: string;
  category: string;
  purchasePrice: number;
  purchaseDate: string;
  status: 'in_stock' | 'in_repair' | 'sold' | 'reserved';
  relatedProductId?: string;
  sellingPrice?: number;
  repairExpenses: number;
  profitAfterSale?: number;
}

export type FinancialTimelineEventType =
  | 'purchase'
  | 'expense'
  | 'sale'
  | 'refund'
  | 'large_repair'
  | 'profit_event';

export interface FinancialTimelineEvent {
  id: string;
  referenceNumber: string;
  type: FinancialTimelineEventType;
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  actor: string;
  relatedEntityId?: string;
}

export interface FinancialAlert {
  id: string;
  type:
    | 'expense_exceeded'
    | 'high_repair_cost'
    | 'low_profit_margin'
    | 'large_cash_withdrawal'
    | 'overdue_balance';
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  timestamp: string;
  isAcknowledged: boolean;
}

export interface BusinessOverviewMetrics {
  todayRevenue: number;
  todayExpenses: number;
  estimatedTodayProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  outstandingBalances: number;
  productsSoldMonth: number;
  productsPurchasedMonth: number;
  productsReservedActive: number;
}
