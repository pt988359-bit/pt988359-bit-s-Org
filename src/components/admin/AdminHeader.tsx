import React, { useState } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import {
  Menu,
  Search,
  ShieldCheck,
  Bot,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Command,
  Activity,
  History,
  Clock,
  Lock,
  Sliders,
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenApprovalCenter: () => void;
  onOpenActivityTimeline: () => void;
  onOpenRecentWork: () => void;
  onOpenProfileSecurity: () => void;
  onOpenSystemStatus: () => void;
  pendingApprovalCount: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenSidebar,
  onOpenCommandPalette,
  onOpenApprovalCenter,
  onOpenActivityTimeline,
  onOpenRecentWork,
  onOpenProfileSecurity,
  onOpenSystemStatus,
  pendingApprovalCount,
}) => {
  const { currentRoute, navigateTo } = useShowroom();
  const { currentUser, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Breadcrumb route mapping
  const getBreadcrumbTitle = () => {
    switch (currentRoute) {
      case 'admin-products':
        return 'إدارة الأجهزة والمنتجات';
      case 'admin-categories':
        return 'الأقسام والفئات';
      case 'admin-orders':
        return 'أوامر الشراء والتوريد';
      case 'admin-payments':
        return 'حسابات إنستا باي والمدفوعات';
      case 'admin-invoices':
        return 'الفواتير وضمان المعرض';
      case 'admin-customers':
        return 'دليل العملاء والطلبات';
      case 'admin-analytics':
        return 'تقارير الأداء والمبيعات';
      case 'admin-ai':
        return 'إعدادات وحارس الذكاء الاصطناعي';
      case 'admin-settings':
        return 'إعدادات بيانات المعرض الفنية';
      case 'admin-system':
        return 'سجلات أمان النظام والتنبيهات';
      default:
        return 'نظرة عامة ولوحة التحكم';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 dir-rtl">
      {/* Left (RTL Right): Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center transition-colors"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold">
          <span
            onClick={() => navigateTo('admin-dashboard')}
            className="text-slate-400 hover:text-blue-400 cursor-pointer hidden sm:inline"
          >
            الإدارة العامة
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-white font-bold text-xs sm:text-base truncate max-w-[140px] sm:max-w-none">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Center: Quick Universal Search Trigger Button */}
      <div className="flex-1 max-w-md mx-1 sm:mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full bg-slate-950 hover:bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-xl px-2.5 sm:px-3.5 py-2 flex items-center justify-between text-xs text-slate-400 transition-all cursor-pointer shadow-inner min-h-[40px]"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Search className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate hidden sm:inline">البحث السريع والأوامر... (الأجهزة، العملاء، الحجوزات)</span>
            <span className="truncate sm:hidden text-[11px]">بحث سريع...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Controls: Approvals, Notifications, System Status, Timeline, Recent Work, Public Site, User */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* AI Rule Governance Badge */}
        <div
          onClick={() => navigateTo('admin-ai')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold cursor-pointer hover:bg-indigo-500/20 transition-all min-h-[38px]"
          title="قانون حوكمة AI: ينصح والمدير يعتمد"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span>حارس AI: موافقة مسبقة</span>
        </div>

        {/* System Status Live Indicator Button */}
        <button
          onClick={onOpenSystemStatus}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5 min-w-[38px] min-h-[38px] sm:min-w-0"
          title="حالة خدمات البنية التحتية"
        >
          <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden md:inline-block" />
          <span className="hidden lg:inline text-[11px]">الأنظمة</span>
        </button>

        {/* Approval Center Button */}
        <button
          onClick={onOpenApprovalCenter}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 relative flex items-center justify-center gap-1.5 min-w-[38px] min-h-[38px] sm:min-w-0"
          title="مركز الموافقات والاعتمادات"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden lg:inline text-[11px]">الموافقات</span>
          {pendingApprovalCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {pendingApprovalCount}
            </span>
          )}
        </button>

        {/* Recent Work & Drafts Button */}
        <button
          onClick={onOpenRecentWork}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 hidden sm:flex items-center gap-1.5"
          title="آخر ما تم العمل عليه والمسودات"
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="hidden lg:inline text-[11px]">السجلات</span>
        </button>

        {/* Timeline Log Button */}
        <button
          onClick={onOpenActivityTimeline}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 hidden md:flex items-center gap-1.5"
          title="سجل نشاط النظام العام"
        >
          <History className="w-4 h-4 text-blue-400" />
          <span className="hidden lg:inline text-[11px]">النشاط</span>
        </button>

        {/* Switch to Public Website view */}
        <button
          onClick={() => navigateTo('home')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700"
          title="معاينة موقع العملاء العام"
        >
          <span>الموقع العام</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700/80 transition-colors cursor-pointer"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={currentUser?.fullName}
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="text-xs font-bold hidden sm:inline">{currentUser?.fullName || 'الأدمن'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 text-xs">
              <div className="p-3 border-b border-slate-800 text-right">
                <span className="font-bold text-white block">{currentUser?.fullName || 'مدير النظام'}</span>
                <span className="text-[10px] text-slate-400 block">{currentUser?.email || BUSINESS_CONFIG.email}</span>
              </div>

              <button
                onClick={() => {
                  onOpenProfileSecurity();
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-right cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>الملف الشخصي والأمان</span>
              </button>

              <button
                onClick={() => {
                  onOpenProfileSecurity();
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-right cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>جلسات الأجهزة و 2FA</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('admin-settings');
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white text-right cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>إعدادات النظام الفنية</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigateTo('home');
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-right cursor-pointer border-t border-slate-800/80 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج الآمن</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
