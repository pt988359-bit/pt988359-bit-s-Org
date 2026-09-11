import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Sliders,
  Wallet,
  ShoppingBag,
  Users,
  ShoppingCart,
  Clock,
  BarChart3,
  Bot,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import {
  getExpenses,
  saveExpense,
  archiveExpense,
  getCostSheets,
  saveCostSheet,
  getCashLedger,
  addCashLedgerEntry,
  getProcurementItems,
  saveProcurementItem,
  updateProcurementStatus,
  getSuppliers,
  saveSupplier,
  getPurchaseHistory,
  getFinancialTimeline,
  getFinancialAlerts,
  acknowledgeAlert,
  getBusinessOverviewMetrics,
} from '../../utils/adminFinanceStorage';

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
  ProcurementStatus,
} from '../../types/adminFinance';

// Subcomponents
import { FinanceOverviewTab } from './finance/FinanceOverviewTab';
import { ExpenseCenterTab } from './finance/ExpenseCenterTab';
import { ProductCostCenterTab } from './finance/ProductCostCenterTab';
import { ProfitSimulatorTab } from './finance/ProfitSimulatorTab';
import { CashRegisterTab } from './finance/CashRegisterTab';
import { ProcurementCenterTab } from './finance/ProcurementCenterTab';
import { SupplierDirectoryTab } from './finance/SupplierDirectoryTab';
import { PurchaseHistoryTab } from './finance/PurchaseHistoryTab';
import { FinancialTimelineTab } from './finance/FinancialTimelineTab';
import { BusinessReportsTab } from './finance/BusinessReportsTab';
import { AiBusinessAssistantModal } from './finance/AiBusinessAssistantModal';
import { FinanceAlertsDrawer } from './finance/FinanceAlertsDrawer';

export const AdminFinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Data States
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getExpenses());
  const [costSheets, setCostSheets] = useState<ProductCostSheet[]>(getCostSheets());
  const [ledger, setLedger] = useState<CashLedgerEntry[]>(getCashLedger());
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>(getProcurementItems());
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(getSuppliers());
  const [purchases] = useState<AppliancePurchaseRecord[]>(getPurchaseHistory());
  const [timelineEvents, setTimelineEvents] = useState<FinancialTimelineEvent[]>(getFinancialTimeline());
  const [alerts, setAlerts] = useState<FinancialAlert[]>(getFinancialAlerts());
  const [metrics, setMetrics] = useState<BusinessOverviewMetrics>(getBusinessOverviewMetrics());

  // Modal States
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);

  // Refresh Metrics on state changes
  useEffect(() => {
    setMetrics(getBusinessOverviewMetrics());
  }, [expenses, ledger, costSheets]);

  // Event Handlers
  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id' | 'referenceNumber' | 'isArchived'>) => {
    saveExpense(expenseData);
    setExpenses(getExpenses());
    setLedger(getCashLedger());
    setTimelineEvents(getFinancialTimeline());
  };

  const handleArchiveExpense = (id: string) => {
    archiveExpense(id);
    setExpenses(getExpenses());
  };

  const handleSaveCostSheet = (sheet: ProductCostSheet) => {
    saveCostSheet(sheet);
    setCostSheets(getCostSheets());
  };

  const handleAddCashEntry = (entry: {
    type: 'money_in' | 'money_out';
    category: string;
    amount: number;
    description: string;
    relatedReference?: string;
    createdBy: string;
  }) => {
    addCashLedgerEntry(entry);
    setLedger(getCashLedger());
  };

  const handleAddProcurement = (itemData: Omit<ProcurementItem, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    saveProcurementItem(itemData);
    setProcurementItems(getProcurementItems());
  };

  const handleUpdateProcurementStatus = (id: string, status: ProcurementStatus) => {
    updateProcurementStatus(id, status);
    setProcurementItems(getProcurementItems());
  };

  const handleAddSupplier = (supplierData: Omit<SupplierRecord, 'id' | 'supplierNumber' | 'purchaseCount' | 'totalSpent' | 'isArchived'>) => {
    saveSupplier(supplierData);
    setSuppliers(getSuppliers());
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    setAlerts(getFinancialAlerts());
  };

  const unackAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  const NAV_TABS = [
    { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'expense-center', label: 'مركز المصروفات', icon: <FileText className="w-4 h-4" /> },
    { id: 'cost-center', label: 'تكاليف الأجهزة', icon: <Calculator className="w-4 h-4" /> },
    { id: 'profit-simulator', label: 'محاكي الربح', icon: <Sliders className="w-4 h-4" /> },
    { id: 'cash-register', label: 'الخزينة والسيولة', icon: <Wallet className="w-4 h-4" /> },
    { id: 'procurement', label: 'مركز المشتريات', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'suppliers', label: 'دليل الموردين', icon: <Users className="w-4 h-4" /> },
    { id: 'purchase-history', label: 'سجل الشراء', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'timeline', label: 'الخط الزمني المالي', icon: <Clock className="w-4 h-4" /> },
    { id: 'reports', label: 'التقارير المالية', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 dir-rtl pb-12">
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-black uppercase tracking-wider">
              PRO TECK Operations & Finance
            </span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              مركز التشغيل والمالية اليومي
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            مركز العمليات والمالية التشغيلية
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            متابعة تكاليف الأجهزة، تسجيل المصروفات، محاكاة هامش الربح والفصال، الخزينة، والمشتريات بكل بساطة ووضوح.
          </p>
        </div>

        {/* Action Buttons: AI & Alerts */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAlertsDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold relative cursor-pointer transition-all"
            title="التنبيهات والتحذيرات المالية"
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {unackAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center border border-slate-900 animate-pulse">
                {unackAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAiAssistantOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
          >
            <Bot className="w-4.5 h-4.5" />
            المساعد الذكي (AI)
          </button>
        </div>
      </div>

      {/* Enterprise Tabs Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto custom-scrollbar shadow-lg">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-black'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-Workspace */}
      {activeTab === 'overview' && (
        <FinanceOverviewTab
          metrics={metrics}
          onNavigateTab={setActiveTab}
          onOpenAiAssistant={() => setAiAssistantOpen(true)}
        />
      )}

      {activeTab === 'expense-center' && (
        <ExpenseCenterTab
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onArchiveExpense={handleArchiveExpense}
        />
      )}

      {activeTab === 'cost-center' && (
        <ProductCostCenterTab
          costSheets={costSheets}
          onSaveCostSheet={handleSaveCostSheet}
        />
      )}

      {activeTab === 'profit-simulator' && (
        <ProfitSimulatorTab costSheets={costSheets} />
      )}

      {activeTab === 'cash-register' && (
        <CashRegisterTab
          ledger={ledger}
          onAddEntry={handleAddCashEntry}
        />
      )}

      {activeTab === 'procurement' && (
        <ProcurementCenterTab
          procurementItems={procurementItems}
          onAddProcurement={handleAddProcurement}
          onUpdateStatus={handleUpdateProcurementStatus}
        />
      )}

      {activeTab === 'suppliers' && (
        <SupplierDirectoryTab
          suppliers={suppliers}
          onAddSupplier={handleAddSupplier}
        />
      )}

      {activeTab === 'purchase-history' && (
        <PurchaseHistoryTab purchases={purchases} />
      )}

      {activeTab === 'timeline' && (
        <FinancialTimelineTab timelineEvents={timelineEvents} />
      )}

      {activeTab === 'reports' && (
        <BusinessReportsTab
          costSheets={costSheets}
          expenses={expenses}
        />
      )}

      {/* Modals & Overlays */}
      <AiBusinessAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      <FinanceAlertsDrawer
        isOpen={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />
    </div>
  );
};
