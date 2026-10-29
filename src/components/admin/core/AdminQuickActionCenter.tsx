import React, { useState } from 'react';
import { useShowroom, RoutePath } from '../../../context/ShowroomContext';
import {
  Plus,
  X,
  Package,
  Layers,
  FileSpreadsheet,
  Users,
  ShoppingBag,
  Search,
  Bot,
  Sparkles,
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  route?: RoutePath;
  actionId: string;
}

interface AdminQuickActionCenterProps {
  onSelectAction: (actionId: string) => void;
}

export const AdminQuickActionCenter: React.FC<AdminQuickActionCenterProps> = ({
  onSelectAction,
}) => {
  const { navigateTo } = useShowroom();
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickActionItem[] = [
    {
      id: 'qa-1',
      label: 'إضافة جهاز جديد',
      icon: <Package className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      route: 'admin-products',
      actionId: 'add-product',
    },
    {
      id: 'qa-2',
      label: 'إضافة قسم جديد',
      icon: <Layers className="w-4 h-4" />,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      route: 'admin-categories',
      actionId: 'add-category',
    },
    {
      id: 'qa-3',
      label: 'إصدار فاتورة ضريبية',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      color: 'bg-purple-600 hover:bg-purple-500 text-white',
      route: 'admin-invoices',
      actionId: 'create-invoice',
    },
    {
      id: 'qa-4',
      label: 'إضافة عميل جديد',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      route: 'admin-customers',
      actionId: 'add-customer',
    },
    {
      id: 'qa-5',
      label: 'مركز طلبات الشراء',
      icon: <ShoppingBag className="w-4 h-4" />,
      color: 'bg-amber-600 hover:bg-amber-500 text-white',
      route: 'admin-orders',
      actionId: 'open-orders',
    },
    {
      id: 'qa-6',
      label: 'بحث فوري في المعرض',
      icon: <Search className="w-4 h-4" />,
      color: 'bg-slate-700 hover:bg-slate-600 text-white',
      actionId: 'search-product',
    },
    {
      id: 'qa-7',
      label: 'فتح المساعد الذكي AI',
      icon: <Bot className="w-4 h-4" />,
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      route: 'admin-ai',
      actionId: 'open-ai',
    },
  ];

  const handleExecuteAction = (item: QuickActionItem) => {
    setIsOpen(false);
    if (item.route) {
      navigateTo(item.route);
    }
    onSelectAction(item.actionId);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 dir-rtl flex flex-col items-start gap-2">
      {/* Expanded Speed Dial Menu */}
      {isOpen && (
        <div className="flex flex-col gap-2 p-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in mb-2 min-w-[200px]">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-extrabold text-slate-400 flex items-center justify-between">
            <span>اختصارات العمليات السريعة</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>

          <div className="flex flex-col gap-1 max-h-80 overflow-y-auto custom-scrollbar">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => handleExecuteAction(act)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-slate-200 hover:bg-slate-800 text-right cursor-pointer"
              >
                <div className={`p-1.5 rounded-lg ${act.color}`}>{act.icon}</div>
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-2xl font-bold shadow-2xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-rose-600 text-white rotate-45 shadow-rose-600/40'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 hover:scale-105'
        }`}
        title="مركز الإجراءات السريعة (Quick Actions)"
      >
        <Plus className="w-6 h-6 transition-transform duration-300" />
      </button>
    </div>
  );
};
