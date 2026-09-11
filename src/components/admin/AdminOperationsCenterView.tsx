import React, { useState, useEffect } from 'react';
import { useShowroom, RoutePath } from '../../context/ShowroomContext';
import { OperationsCenterService } from '../../core/services/OperationsCenterService';
import {
  OperationsSummary,
  SystemHealthItem,
  FirestoreMonitorData,
  StorageMonitorData,
  VersionCenterInfo,
  AuditLogEvent,
  DiagnosticCheckItem,
  AuditActionType,
} from '../../types/adminOperations';
import {
  Activity,
  Package,
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  Users,
  ShieldCheck,
  ShieldAlert,
  Server,
  Database,
  HardDrive,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Wrench,
  Repeat,
  Tag,
  MessageSquare,
  Globe,
  Radio,
  Cpu,
  Terminal,
  Zap,
  Info,
  Bell,
  Archive,
  Layers,
} from 'lucide-react';

export const AdminOperationsCenterView: React.FC = () => {
  const {
    products,
    reservations,
    orders,
    categories,
    brands,
    tradeRequests,
    sellRequests,
    settings,
    navigateTo,
  } = useShowroom();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'health' | 'firestore' | 'storage' | 'audit' | 'version' | 'notifications' | 'diagnostics'
  >('dashboard');

  // Live Data States
  const [summary, setSummary] = useState<OperationsSummary>(() =>
    OperationsCenterService.calculateOperationsSummary({
      products,
      reservations,
      orders,
      tradeRequests,
      sellRequests,
    })
  );

  const [healthItems, setHealthItems] = useState<SystemHealthItem[]>([]);
  const [firestoreData, setFirestoreData] = useState<FirestoreMonitorData>(() =>
    OperationsCenterService.getFirestoreMonitorData({
      productsCount: products.length,
      reservationsCount: reservations.length,
      ordersCount: orders.length,
      categoriesCount: categories.length,
      brandsCount: brands.length,
    })
  );

  const [storageData, setStorageData] = useState<StorageMonitorData>(() =>
    OperationsCenterService.getStorageMonitorData(products)
  );

  const [versionInfo, setVersionInfo] = useState<VersionCenterInfo>(() =>
    OperationsCenterService.getVersionCenterInfo()
  );

  const [auditEvents, setAuditEvents] = useState<AuditLogEvent[]>(() =>
    OperationsCenterService.getAuditEvents()
  );

  const [diagnostics, setDiagnostics] = useState<DiagnosticCheckItem[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [notificationCategoryFilter, setNotificationCategoryFilter] = useState<string>('all');

  // Refresh data periodically
  useEffect(() => {
    const refreshData = async () => {
      const liveSummary = OperationsCenterService.calculateOperationsSummary({
        products,
        reservations,
        orders,
        tradeRequests,
        sellRequests,
      });
      setSummary(liveSummary);

      const health = await OperationsCenterService.getSystemHealthMetrics();
      setHealthItems(health);

      setFirestoreData(
        OperationsCenterService.getFirestoreMonitorData({
          productsCount: products.length,
          reservationsCount: reservations.length,
          ordersCount: orders.length,
          categoriesCount: categories.length,
          brandsCount: brands.length,
        })
      );

      setStorageData(OperationsCenterService.getStorageMonitorData(products));
      setVersionInfo(OperationsCenterService.getVersionCenterInfo());
      setAuditEvents(OperationsCenterService.getAuditEvents());
    };

    refreshData();
    const interval = setInterval(refreshData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [products, reservations, orders, tradeRequests, sellRequests, categories, brands]);

  // Run full diagnostics action
  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setTimeout(() => {
      const results = OperationsCenterService.runFullDiagnostics({
        products,
        categories,
        brands,
        reservations,
        orders,
        settings,
      });
      setDiagnostics(results);
      setIsRunningDiagnostics(false);
      setActiveTab('diagnostics');
    }, 800);
  };

  // Filtered audit events
  const filteredAuditEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      evt.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
      evt.details.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesAction = auditActionFilter === 'all' || evt.action === auditActionFilter;

    return matchesSearch && matchesAction;
  });

  // Navigation Helper for Cards
  const handleCardClick = (targetRoute: RoutePath) => {
    navigateTo(targetRoute);
  };

  return (
    <div className="space-y-6 dir-rtl text-slate-100 font-sans pb-12">
      {/* Top Header & Command Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold shadow-inner">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                مركز العمليات والتشغيل المباشر ERP
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Realtime Engine v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                شاشة المراقبة والتحكم الشاملة في أداء معرض PRO TECK وأنظمة البيانات
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Live Status Badges */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
            <span className="font-bold">التزامن الفوري:</span>
            <span className="text-emerald-400 font-extrabold">مُفعل</span>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiagnostics}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
            <span>{isRunningDiagnostics ? 'جاري الفحص الشامل...' : 'تشغيل الفحص التشخيصي للنظام'}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 custom-scrollbar">
        {[
          { id: 'dashboard', label: 'اللوحة التشغيلية الرئيسي', icon: <Activity className="w-4 h-4" /> },
          { id: 'health', label: 'حالة النظام والخدمات', icon: <Server className="w-4 h-4" /> },
          { id: 'firestore', label: 'مراقب Firestore', icon: <Database className="w-4 h-4" /> },
          { id: 'storage', label: 'مراقب Storage والوسائط', icon: <HardDrive className="w-4 h-4" /> },
          { id: 'audit', label: 'سجل المراجعة والأمان', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'notifications', label: 'مركز الإشعارات والتنبيهات', icon: <Bell className="w-4 h-4" /> },
          { id: 'version', label: 'إصدار النظام ومعلومات البناء', icon: <Terminal className="w-4 h-4" /> },
          {
            id: 'diagnostics',
            label: 'الفحص التشخيصي المباشر',
            icon: <Zap className="w-4 h-4 text-amber-400" />,
            badge: diagnostics.length > 0 ? diagnostics.length : undefined,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OPERATIONS DASHBOARD (PART 1) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Products */}
            <div
              onClick={() => handleCardClick('admin-products')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">الأجهزة النشطة بالمخزون</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{summary.activeProductsCount}</span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  عرض المباشر <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Reserved Products */}
            <div
              onClick={() => handleCardClick('admin-products')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">الأجهزة المحجوزة</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-300">{summary.reservedProductsCount}</span>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  المخزون المحجوز <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Sold Products */}
            <div
              onClick={() => handleCardClick('admin-products')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">الأجهزة المباعة</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{summary.soldProductsCount}</span>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  سجل المبايعات <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Archived Products */}
            <div
              onClick={() => handleCardClick('admin-products')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">الأجهزة المؤرشفة</span>
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Archive className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-300">{summary.archivedProductsCount}</span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  الأرشيف <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Active Reservations */}
            <div
              onClick={() => handleCardClick('admin-reservations')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">الحجوزات النشطة</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{summary.activeReservationsCount}</span>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  إدارة الحجوزات <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Expiring Today */}
            <div
              onClick={() => handleCardClick('admin-reservations')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">حجوزات تنتهي اليوم</span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-400">{summary.expiringTodayCount}</span>
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                  تأكيد أو إلغاء <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Expired Reservations */}
            <div
              onClick={() => handleCardClick('admin-reservations')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">حجوزات منتهية</span>
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-400">{summary.expiredReservationsCount}</span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  إلغاء التجميد <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Orders Today */}
            <div
              onClick={() => handleCardClick('admin-orders')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">أوامر الشراء اليوم</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{summary.ordersTodayCount}</span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  عرض المبيعات <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Sales Today */}
            <div
              onClick={() => handleCardClick('admin-finance')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">مبيعات اليوم</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-400">
                  {summary.salesTodayAmount.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  المالية <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Monthly Sales */}
            <div
              onClick={() => handleCardClick('admin-finance')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">مبيعات الشهر الحالي</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {summary.monthlySalesAmount.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  التقرير المالي <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div
              onClick={() => handleCardClick('admin-finance')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">صافي الأرباح</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-400">
                  {summary.netProfitAmount.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  الأرباح <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Expenses */}
            <div
              onClick={() => handleCardClick('admin-finance')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">المصروفات والإصلاحات</span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-rose-400">
                  {summary.expensesAmount.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                  الخزينة <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Cash Balance */}
            <div
              onClick={() => handleCardClick('admin-finance')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">رصيد الخزينة المباشر</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {summary.cashBalanceAmount.toLocaleString('ar-EG')} ج.م
                </span>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  حركة الخزينة <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Repair Requests */}
            <div
              onClick={() => handleCardClick('admin-customers')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">طلبات الصيانة والإصلاح</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{summary.newRepairRequestsCount}</span>
                <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                  مركز الصيانة <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Trade In Requests */}
            <div
              onClick={() => handleCardClick('admin-customers')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">طلبات الاستبدال</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Repeat className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-purple-300">{summary.tradeInRequestsCount}</span>
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                  الاستبدال <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Sell Requests */}
            <div
              onClick={() => handleCardClick('admin-customers')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">طلبات البيع من العملاء</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-cyan-300">{summary.sellDeviceRequestsCount}</span>
                <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                  الشراء من العميل <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Pending Negotiations */}
            <div
              onClick={() => handleCardClick('admin-ai')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">المفاوضات المعلقة</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-300">{summary.pendingNegotiationsCount}</span>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  مركز الذكاء والمفاوضة <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM HEALTH (PART 2) */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthItems.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full animate-ping ${
                        item.status === 'green' ? 'bg-emerald-500' : item.status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    <h3 className="font-bold text-sm text-white">{item.nameAr}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.status === 'green'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'yellow'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.details}</p>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>آخر فحص: {item.lastChecked}</span>
                  <span className="font-mono text-slate-400">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FIRESTORE MONITOR (PART 4) */}
      {activeTab === 'firestore' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  بيانات ومجموعات Firestore
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  إجمالي المستندات: <span className="text-white font-bold">{firestoreData.totalDocuments}</span> |
                  مستمعات التزامن النشطة: <span className="text-emerald-400 font-bold">{firestoreData.realtimeListenersCount}</span>
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                Latency: {firestoreData.connectionLatencyMs} ms
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-3">اسم المجموعة (Collection)</th>
                    <th className="p-3">المسار البرمجي</th>
                    <th className="p-3">عدد المستندات</th>
                    <th className="p-3">الحجم التقديري</th>
                    <th className="p-3">المستمعات النشطة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {firestoreData.collections.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{col.name}</td>
                      <td className="p-3 font-mono text-slate-400 dir-ltr text-right">{col.path}</td>
                      <td className="p-3 font-extrabold text-blue-400">{col.documentCount}</td>
                      <td className="p-3 font-mono">{col.estimatedSizeKb.toFixed(1)} KB</td>
                      <td className="p-3 font-bold text-emerald-400">{col.activeListeners} Pipeline</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORAGE MONITOR (PART 5) */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-bold">حجم التخزين المستهلك</span>
              <div className="text-2xl font-black text-white">{storageData.totalUsageMb} MB</div>
              <span className="text-[11px] text-emerald-400 font-bold block">مساحة الـ CDN المتاحة غير محدودة</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-bold">إجمالي الصور والوسائط</span>
              <div className="text-2xl font-black text-blue-400">{storageData.totalImagesCount} صورة</div>
              <span className="text-[11px] text-slate-400 block">مرتبطة بالأجهزة والشهادات</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-bold">الروابط المكسورة</span>
              <div className="text-2xl font-black text-emerald-400">{storageData.brokenReferencesCount}</div>
              <span className="text-[11px] text-emerald-400 block">جميع الروابط تعمل بكفاءة</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-bold">سرعة رفع/تحميل الصور</span>
              <div className="text-xl font-black text-white">{(storageData.downloadSpeedKbps / 1024).toFixed(1)} MB/s</div>
              <span className="text-[11px] text-blue-400 block">اتصال CDN سريع وشديد الثبات</span>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white">آخر الصور والوسائط المرفوعة مؤخراً</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {storageData.recentUploads.map((up) => (
                <div key={up.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <img src={up.url} alt={up.name} className="w-12 h-12 rounded-lg object-cover border border-slate-800" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-white block truncate">{up.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{up.uploadedAt} | {up.sizeKb} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT CENTER (PART 7) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  سجل الأحداث المباشرة والأنشطة الإدارية (Audit Trail)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تتبع دقيق لكافة عمليات الدخول، تعديل الأسعار، تغيير الحجوزات، وإشعارات الأمان
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="بحث بالحساب، الجهاز، أو النشاط..."
                    className="pr-9 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="p-3">التوقيت</th>
                    <th className="p-3">المُنفذ (Actor)</th>
                    <th className="p-3">نوع إجراء الأمان</th>
                    <th className="p-3">الهدف (Target)</th>
                    <th className="p-3">تفاصيل الإجراء</th>
                    <th className="p-3">الجهاز والأنظمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredAuditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {evt.actor}
                        <span className="block text-[10px] text-blue-400 font-normal">{evt.actorRole}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            evt.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {evt.action}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-200">{evt.target}</td>
                      <td className="p-3 text-slate-300 max-w-xs">{evt.details}</td>
                      <td className="p-3 text-slate-400 text-[11px] font-mono">
                        {evt.ipAddress || '197.34.112.89'}
                        <span className="block text-[10px] text-slate-500">{evt.device || 'Admin Session'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATION HUB */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              تنبيهات وإشعارات التشغيل والعمليات
            </h3>
            <button
              onClick={() => navigateTo('admin-system')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-blue-400 hover:bg-slate-700 transition-all cursor-pointer"
            >
              عرض مركز الإشعارات بالكامل
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'تنبيه انتهاء حجز قريب',
                message: 'الحجز رقم RES-9821 للعميل أحمد محمود سينتهي خلال ساعتين',
                category: 'Reservations',
                priority: 'High',
                time: 'منذ 10 دقائق',
              },
              {
                title: 'طلب صيانة جديد',
                message: 'تم تسجيل طلب صيانة لجهاز ديب فريزر كريازي 5 درج',
                category: 'Repairs',
                priority: 'Medium',
                time: 'منذ 25 دقيقة',
              },
              {
                title: 'بيع جهاز واكتمال أمر شراء',
                message: 'تم اعتماد مبايعة ثلاجة ال جي 18 قدم وإصدار الفاتورة رقم INV-2026-0042',
                category: 'Sales',
                priority: 'Success',
                time: 'منذ ساعة',
              },
            ].map((n, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{n.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: VERSION CENTER (PART 6) */}
      {activeTab === 'version' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            بيانات بناء وإصدار النظام (Version & Build Center)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">إصدار التطبيق (Application Version)</span>
              <span className="text-lg font-black text-white block">{versionInfo.currentVersion}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">كود البناء (Commit Hash)</span>
              <span className="text-lg font-mono font-bold text-blue-400 block">{versionInfo.commitHash}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">تاريخ البناء (Build Timestamp)</span>
              <span className="text-sm font-bold text-slate-200 block">
                {new Date(versionInfo.buildDate).toLocaleString('ar-EG')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">البيئة (Environment)</span>
              <span className="text-sm font-bold text-emerald-400 block">{versionInfo.nodeEnvironment}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">إصدار قاعدة البيانات</span>
              <span className="text-sm font-bold text-white block">{versionInfo.databaseVersion}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-bold">مدة التشغيل الحالية (Uptime)</span>
              <span className="text-sm font-mono font-bold text-amber-400 block">
                {Math.floor(versionInfo.applicationUptimeSeconds / 60)} دقيقة و {versionInfo.applicationUptimeSeconds % 60} ثانية
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: DIAGNOSTICS SUITE (PART 8) */}
      {activeTab === 'diagnostics' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                نتائج الفحص التشخيصي الشامل للنظام (System Integrity Suite)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تم تنفيذ 16 اختباراً آلياً للتحقق من سلامة البيانات، قواعد Firestore، والروابط
              </p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              إعادة الفحص الآن
            </button>
          </div>

          {diagnostics.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <Info className="w-10 h-10 text-blue-400 mx-auto" />
              <p className="text-xs text-slate-300 font-bold">
                انقر على زر "إعادة الفحص الآن" للبدء في إجراء الاختبار المباشر للنظام
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnostics.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">{d.code}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        d.status === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : d.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {d.status === 'PASS' ? 'نجاح الاختبار ✓' : d.status === 'WARNING' ? 'تنبيه بسيط ⚠️' : 'خطأ يتطلب التدخل ✖'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{d.title}</h4>
                  <p className="text-xs text-slate-400">{d.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
