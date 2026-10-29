import React from 'react';
import { useShowroom, RoutePath } from '../../context/ShowroomContext';
import { useAuth } from '../../context/AuthContext';
import { logoutAdminAccessSession } from './AdminAccessGate';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  CreditCard,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  Bot,
  Settings,
  ShieldAlert,
  LogOut,
  X,
  ShieldCheck,
  Building2,
  Activity,
} from 'lucide-react';

interface MenuItem {
  id: RoutePath;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { currentRoute, navigateTo, products } = useShowroom();
  const { logout, currentUser } = useAuth();

  const menuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'لوحة التحكم والمؤشرات', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'admin-operations', label: 'مركز العمليات والتشغيل ERP', icon: <Activity className="w-5 h-5" /> },
    { id: 'admin-products', label: 'إدارة الأجهزة والمخزون', icon: <Package className="w-5 h-5" />, badge: products.length },
    { id: 'admin-orders', label: 'أوامر الشراء والمبيعات', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'admin-customers', label: 'دليل العملاء والسجل', icon: <Users className="w-5 h-5" /> },
    { id: 'admin-finance', label: 'المالية والخزينة', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'admin-invoices', label: 'المستندات والفواتير', icon: <FileText className="w-5 h-5" /> },
    { id: 'admin-analytics', label: 'التقارير والأداء', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'admin-settings', label: 'إعدادات المعرض', icon: <Settings className="w-5 h-5" /> },
    { id: 'admin-system', label: 'سجلات النشاط والأمان', icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  const handleNav = (route: RoutePath) => {
    navigateTo(route);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen
            ? 'translate-x-0 pointer-events-auto shadow-2xl'
            : 'translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
        }`}
      >
        {/* Top Header */}
        <div className="flex flex-col gap-4 p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/30">
                PT
              </div>
              <div>
                <h2 className="font-black text-base leading-tight">PRO TECK Admin</h2>
                <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  فرع المعادي شارع 68
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
              aria-label="إغلاق القائمة الجانبية"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentRoute === item.id || (currentRoute === 'admin' && item.id === 'admin-dashboard');

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-blue-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / User & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.fullName}
              className="w-9 h-9 rounded-lg object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs block text-white truncate">
                {currentUser?.fullName || 'الأدمن الرئيسي'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser?.email || BUSINESS_CONFIG.email}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              await logoutAdminAccessSession();
              logout();
              navigateTo('home');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>
      </aside>
    </>
  );
};
