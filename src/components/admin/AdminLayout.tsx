import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Skeleton } from '../ui/Skeleton';
import { Smartphone, Download } from 'lucide-react';

// Lazy loaded Sub-views
const AdminDashboardView = lazy(() => import('./AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const AdminProductsView = lazy(() => import('./AdminProductsView').then(m => ({ default: m.AdminProductsView })));
const AdminCategoriesView = lazy(() => import('./AdminCategoriesView').then(m => ({ default: m.AdminCategoriesView })));
const AdminOrdersView = lazy(() => import('./AdminOrdersView').then(m => ({ default: m.AdminOrdersView })));
const AdminPaymentsView = lazy(() => import('./AdminPaymentsView').then(m => ({ default: m.AdminPaymentsView })));
const AdminCustomersView = lazy(() => import('./AdminCustomersView').then(m => ({ default: m.AdminCustomersView })));
const AdminFinanceView = lazy(() => import('./AdminFinanceView').then(m => ({ default: m.AdminFinanceView })));
const AdminAnalyticsView = lazy(() => import('./AdminAnalyticsView').then(m => ({ default: m.AdminAnalyticsView })));
const AdminAiView = lazy(() => import('./AdminAiView').then(m => ({ default: m.AdminAiView })));
const AdminSettingsView = lazy(() => import('./AdminSettingsView').then(m => ({ default: m.AdminSettingsView })));
const AdminSystemLogsView = lazy(() => import('./AdminSystemLogsView').then(m => ({ default: m.AdminSystemLogsView })));
const AdminOperationsCenterView = lazy(() => import('./AdminOperationsCenterView').then(m => ({ default: m.AdminOperationsCenterView })));

// Core Foundation Components (Phase 9)
import { AdminCommandPalette } from './core/AdminCommandPalette';
import { AdminApprovalCenter } from './core/AdminApprovalCenter';
import { AdminNotificationCenter } from './core/AdminNotificationCenter';
import { AdminActivityTimelineModal } from './core/AdminActivityTimelineModal';
import { AdminQuickActionCenter } from './core/AdminQuickActionCenter';
import { AdminRecentWorkDrawer } from './core/AdminRecentWorkDrawer';
import { AdminProfileSecurityModal } from './core/AdminProfileSecurityModal';
import { AdminSystemStatusModal } from './core/AdminSystemStatusModal';

// Seed Storage Data
import {
  INITIAL_APPROVALS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_RECENT_WORK,
  INITIAL_DRAFTS,
  INITIAL_SYSTEM_SERVICES,
  INITIAL_ACTIVE_SESSIONS,
  INITIAL_FAILED_LOGINS,
} from '../../utils/adminCoreStorage';
import {
  ApprovalItem,
  ApprovalStatus,
  ActivityLogEntry,
  RecentWorkItem,
  AdminDraft,
  ServiceHealthStatus,
  ActiveSession,
  FailedLoginAttempt,
  AdminNotification,
  NotificationState,
} from '../../types/adminCore';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

export const AdminLayout: React.FC = () => {
  const { currentRoute, navigateTo } = useShowroom();

  // Sidebar Mobile State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Foundation Modal States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [approvalCenterOpen, setApprovalCenterOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [activityTimelineOpen, setActivityTimelineOpen] = useState(false);
  const [recentWorkOpen, setRecentWorkOpen] = useState(false);
  const [profileSecurityOpen, setProfileSecurityOpen] = useState(false);
  const [systemStatusOpen, setSystemStatusOpen] = useState(false);

  // Data States
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  const [recentWorkItems] = useState<RecentWorkItem[]>(INITIAL_RECENT_WORK);
  const [drafts, setDrafts] = useState<AdminDraft[]>(INITIAL_DRAFTS);
  const [services, setServices] = useState<ServiceHealthStatus[]>(INITIAL_SYSTEM_SERVICES);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_ACTIVE_SESSIONS);
  const [failedLogins] = useState<FailedLoginAttempt[]>(INITIAL_FAILED_LOGINS);

  // Silent browser Notification permission request on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        Notification.requestPermission().catch(() => {});
      } catch {}
    }
  }, []);

  // Web Push subscription registration for background alerts
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const r = await fetch('/api/admin/push/vapid-public'); if (!r.ok) return;
        const { publicKey } = await r.json(); if (!publicKey) return;
        const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
        }
        const raw = sub.toJSON();
        await fetch('/api/admin/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: raw.endpoint, keys: raw.keys, userAgent: navigator.userAgent }) }).catch(() => {});
      } catch { /* silent — never break the admin app */ }
    })();
  }, []);

  // Notifications live polling every 25 seconds while admin panel is open
  const previousNotificationIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialFetchRef = React.useRef(true);

  const fetchLiveNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = await res.json();
      const list: AdminNotification[] = Array.isArray(data) ? data : (data.notifications || []);

      // If new unread notifications arrived after initial load, trigger browser notification
      if (!isInitialFetchRef.current) {
        const prevIds = previousNotificationIdsRef.current;
        const freshUnread = list.filter((item) => !prevIds.has(item.id) && item.state === 'unread');
        if (freshUnread.length > 0 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          freshUnread.slice(0, 3).forEach((item) => {
            try {
              new Notification(item.title, {
                body: item.message,
                icon: '/icons/icon-192x192.png',
              });
            } catch {}
          });
        }
      }

      previousNotificationIdsRef.current = new Set(list.map((item) => item.id));
      isInitialFetchRef.current = false;
      setNotifications(list);
    } catch {
      // Silent error fallback
    }
  }, []);

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 25000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, state: 'read' as NotificationState } : item))
    );
    try {
      await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
    } catch {}
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, state: 'read' as NotificationState }))
    );
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' });
    } catch {}
  };

  const handleUpdateNotifications = (updated: AdminNotification[]) => {
    setNotifications(updated);
  };

  // Diagnostic live window width tracker
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  // Global Keyboard Shortcut Listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update approval status handler
  const handleUpdateApproval = (id: string, newStatus: ApprovalStatus) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    // Log event in activity timeline
    const updatedItem = approvals.find((a) => a.id === id);
    if (updatedItem) {
      const newLog: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toLocaleString('ar-EG'),
        actor: 'الأدمن الرئيسي',
        actorRole: 'Super Admin',
        category: 'system_change',
        referenceNumber: updatedItem.referenceNumber,
        description: `تغيير حالة قرار الموافقة لـ (${updatedItem.referenceNumber}) إلى: ${newStatus}`,
        severity: newStatus === 'approved' ? 'success' : 'warning',
      };
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  // Quick Action Handler
  const handleSelectQuickAction = (actionId: string) => {
    if (actionId === 'search-product') {
      setCommandPaletteOpen(true);
    } else if (actionId === 'add-product') {
      navigateTo('admin-products');
    } else if (actionId === 'add-category') {
      navigateTo('admin-categories');
    } else if (actionId === 'open-ai') {
      navigateTo('admin-ai');
    } else if (actionId === 'add-customer') {
      navigateTo('admin-customers');
    }
  };

  // Terminate session handler
  const handleTerminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Refresh services health
  const handleRefreshServices = () => {
    setServices((prev) =>
      prev.map((s, idx) => ({
        ...s,
        latencyMs: 12 + (idx * 5) % 20,
        lastChecked: new Date().toLocaleTimeString('ar-EG'),
      }))
    );
  };

  // Delete draft handler
  const handleDeleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  // If route is admin-login, redirect smoothly to admin-dashboard
  useEffect(() => {
    if (currentRoute === 'admin-login') {
      navigateTo('admin-dashboard');
    }
  }, [currentRoute, navigateTo]);

  // Render Sub View according to currentRoute
  const renderAdminContent = () => {
    switch (currentRoute) {
      case 'admin-products':
        return <AdminProductsView />;
      case 'admin-categories':
        return <AdminCategoriesView />;
      case 'admin-orders':
        return <AdminOrdersView />;
      case 'admin-payments':
        return <AdminPaymentsView />;
      case 'admin-customers':
        return <AdminCustomersView />;
      case 'admin-finance':
        return <AdminFinanceView />;
      case 'admin-analytics':
        return <AdminAnalyticsView />;
      case 'admin-ai':
        return <AdminAiView />;
      case 'admin-settings':
        return <AdminSettingsView />;
      case 'admin-system':
        return <AdminSystemLogsView />;
      case 'admin-operations':
        return <AdminOperationsCenterView />;
      case 'admin-login':
      case 'admin-dashboard':
      case 'admin':
      default:
        return <AdminDashboardView />;
    }
  };

  const pendingApprovalCount = approvals.filter((a) => a.status === 'pending').length;
  const unreadNotificationCount = notifications.filter((n) => n.state === 'unread').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans dir-rtl">
      {/* Temporary Diagnostic Badge */}
      <div className="fixed top-1 left-1 z-[9999] bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none shadow">
        {windowWidth}px
      </div>

      {/* Main Admin App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72">
        {/* Admin Core Header */}
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenApprovalCenter={() => setApprovalCenterOpen(true)}
          onOpenNotifications={() => setNotificationCenterOpen(true)}
          unreadNotificationCount={unreadNotificationCount}
          onOpenActivityTimeline={() => setActivityTimelineOpen(true)}
          onOpenRecentWork={() => setRecentWorkOpen(true)}
          onOpenProfileSecurity={() => setProfileSecurityOpen(true)}
          onOpenSystemStatus={() => setSystemStatusOpen(true)}
          pendingApprovalCount={pendingApprovalCount}
          installPrompt={installPrompt}
          onInstallApp={handleInstallClick}
        />

        {/* Mobile PWA Install Banner (Only rendered on mobile when installPrompt is active) */}
        {installPrompt && (
          <div className="sm:hidden bg-gradient-to-r from-blue-900/90 via-indigo-950/90 to-slate-900 border-b border-blue-500/30 px-3.5 py-2.5 flex items-center justify-between text-xs text-white shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-[11px]">تثبيت تطبيق PRO TECK Admin</p>
                <p className="text-[10px] text-blue-200">لتجربة شاشة كاملة وسرعة وصول</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="space-y-6 dir-rtl py-6">
                <Skeleton className="h-10 w-64 bg-slate-800 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
                  <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
                  <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
                  <Skeleton className="h-32 bg-slate-800 rounded-2xl" />
                </div>
                <Skeleton className="h-96 w-full bg-slate-800 rounded-2xl" />
              </div>
            }
          >
            {renderAdminContent()}
          </Suspense>
        </main>
      </div>

      {/* Standalone Admin Sidebar (Rendered after main content for clean mobile z-index stacking above sticky header) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Floating Quick Action Button (Speed Dial) */}
      <AdminQuickActionCenter onSelectAction={handleSelectQuickAction} />

      {/* PHASE 9 ADMIN CORE MODALS & OVERLAYS */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onTriggerQuickAction={handleSelectQuickAction}
      />

      <AdminApprovalCenter
        isOpen={approvalCenterOpen}
        onClose={() => setApprovalCenterOpen(false)}
        approvalItems={approvals}
        onUpdateApproval={handleUpdateApproval}
      />

      <AdminNotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onUpdateNotifications={handleUpdateNotifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      <AdminActivityTimelineModal
        isOpen={activityTimelineOpen}
        onClose={() => setActivityTimelineOpen(false)}
        activityLogs={activityLogs}
      />

      <AdminRecentWorkDrawer
        isOpen={recentWorkOpen}
        onClose={() => setRecentWorkOpen(false)}
        recentWorkItems={recentWorkItems}
        drafts={drafts}
        onDeleteDraft={handleDeleteDraft}
      />

      <AdminProfileSecurityModal
        isOpen={profileSecurityOpen}
        onClose={() => setProfileSecurityOpen(false)}
        sessions={sessions}
        failedLogins={failedLogins}
        onTerminateSession={handleTerminateSession}
      />

      <AdminSystemStatusModal
        isOpen={systemStatusOpen}
        onClose={() => setSystemStatusOpen(false)}
        services={services}
        onRefreshStatuses={handleRefreshServices}
      />
    </div>
  );
};
