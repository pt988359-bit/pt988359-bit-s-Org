import React from 'react';
import { OrderWorkspaceModule, OrderDisplayMode } from '../../../types/orderManagementCenter';
import {
  ShoppingCart,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Archive,
  ShieldCheck,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Filter,
  Download,
  Plus,
} from 'lucide-react';

interface OrderModuleTabsProps {
  activeModule: OrderWorkspaceModule;
  onChangeModule: (mod: OrderWorkspaceModule) => void;
  displayMode: OrderDisplayMode;
  onChangeDisplayMode: (mode: OrderDisplayMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  counts: {
    unified_requests?: number;
    purchase_requests: number;
    negotiations: number;
    inquiries?: number;
    completed_sales: number;
    cancelled: number;
    archived: number;
    audit_log: number;
  };

  onExport: () => void;
  onCreateNewRequest: () => void;
}

export const OrderModuleTabs: React.FC<OrderModuleTabsProps> = ({
  activeModule,
  onChangeModule,
  displayMode,
  onChangeDisplayMode,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  counts,
  onExport,
  onCreateNewRequest,
}) => {
  const modules: { id: OrderWorkspaceModule; label: string; icon: React.ReactNode; badge: number }[] = [
    { id: 'unified_requests', label: 'مركز الطلبات الموحد (Unified)', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, badge: counts.unified_requests || (counts.purchase_requests + counts.negotiations) },
    { id: 'purchase_requests', label: 'طلبات الشراء', icon: <ShoppingCart className="w-4 h-4" />, badge: counts.purchase_requests },
    { id: 'completed_sales', label: 'المبيعات المكتملة', icon: <CheckCircle2 className="w-4 h-4" />, badge: counts.completed_sales },
    { id: 'cancelled', label: 'الملغاة والمرفوضة', icon: <XCircle className="w-4 h-4" />, badge: counts.cancelled },
    { id: 'archived', label: 'المؤرشفة', icon: <Archive className="w-4 h-4" />, badge: counts.archived },
    { id: 'audit_log', label: 'سجل التدقيق', icon: <ShieldCheck className="w-4 h-4" />, badge: counts.audit_log },
  ];

  return (
    <div className="space-y-4 dir-rtl text-xs">
      {/* Top Header & Workspaces Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-lg flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {modules.map((m) => {
            const isActive = activeModule === m.id;

            return (
              <button
                key={m.id}
                onClick={() => onChangeModule(m.id)}
                className={`px-3.5 py-2.5 rounded-2xl font-black text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {m.badge}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>طلب جديد</span>
        </button>
      </div>

      {/* Filter Bar & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث برقم المرجع، العميل، الهاتف، أو الجهاز..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
          />
        </div>

        {/* Priority Filter & View Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">كل الأولويات</option>
              <option value="high">عالية (High)</option>
              <option value="medium">متوسطة (Medium)</option>
              <option value="low">منخفضة (Low)</option>
            </select>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeDisplayMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض الجدول (Table View)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeDisplayMode('kanban')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض كانتين كانبان (Kanban Board)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeDisplayMode('calendar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض النتيجة والتقويم (Calendar View)"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onExport}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>تصدير CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
