import React, { useState } from 'react';
import {
  AdminNotification,
  NotificationPriority,
  NotificationState,
  NotificationType,
} from '../../../types/adminCore';
import { useShowroom, RoutePath } from '../../../context/ShowroomContext';
import {
  Bell,
  X,
  Filter,
  Search,
  CheckCheck,
  Clock,
  Archive,
  AlertTriangle,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  FileText,
  Sparkles,
  Bot,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onUpdateNotifications: (updated: AdminNotification[]) => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onUpdateNotifications,
}) => {
  const { navigateTo } = useShowroom();
  const [filterState, setFilterState] = useState<'all' | 'unread' | 'snoozed' | 'archived'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | NotificationPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter logic
  const filteredNotifications = notifications.filter((item) => {
    // State filter
    if (filterState === 'unread' && item.state !== 'unread') return false;
    if (filterState === 'snoozed' && item.state !== 'snoozed') return false;
    if (filterState === 'archived' && item.state !== 'archived') return false;
    if (filterState === 'all' && item.state === 'archived') return false; // hide archived in all by default

    // Priority filter
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;

    // Search query
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const unreadCount = notifications.filter((n) => n.state === 'unread').length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, state: 'read' as NotificationState }));
    onUpdateNotifications(updated);
  };

  const handleItemStateChange = (id: string, newState: NotificationState) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, state: newState } : n));
    onUpdateNotifications(updated);
  };

  const handleNotificationClick = (item: AdminNotification) => {
    // Mark as read
    handleItemStateChange(item.id, 'read');
    if (item.linkRoute) {
      navigateTo(item.linkRoute as RoutePath);
      onClose();
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'purchase_request':
        return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case 'reservation':
      case 'reservation_expiring':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'ai_suggestion':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'low_stock':
      case 'product_warning':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'system_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'invoice':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">حرج للغاية</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">هام جداً</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">عادي</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-md flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">مركز إشعارات الإدارة</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-extrabold text-[11px]">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">تنبيهات الحجوزات، التحويلات، وتنبيهات حارس AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في التنبيهات بالاسم أو المرجع..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterState('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterState === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterState('unread')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterState === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                غير مقروء
              </button>
              <button
                onClick={() => setFilterState('snoozed')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterState === 'snoozed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                مؤجل
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>قراءة الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              لا توجد تنبيهات تطابق خيارات الفلترة المحددة.
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col gap-2 ${
                  item.state === 'unread'
                    ? 'bg-slate-900 border-blue-500/40 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-90'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="font-extrabold text-xs text-white">{item.title}</span>
                  </div>
                  {getPriorityBadge(item.priority)}
                </div>

                {/* Body Message */}
                <p className="text-xs text-slate-300 leading-relaxed pr-8">{item.message}</p>

                {/* Footer details */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.timestamp}</span>
                    </span>
                    {item.referenceNumber && (
                      <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {item.referenceNumber}
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {item.state === 'unread' ? (
                      <button
                        onClick={() => handleItemStateChange(item.id, 'read')}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="تعليم كـ مقروء"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    <button
                      onClick={() =>
                        handleItemStateChange(
                          item.id,
                          item.state === 'snoozed' ? 'read' : 'snoozed'
                        )
                      }
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                      title={item.state === 'snoozed' ? 'إلغاء التأجيل' : 'تأجيل التنبيه'}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleItemStateChange(item.id, 'archived')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                      title="أرشفة التنبيه"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500">
          تنبيهات فورية متزامنة مع نظام حارس AI ومعرض المعادي
        </div>
      </div>
    </div>
  );
};
