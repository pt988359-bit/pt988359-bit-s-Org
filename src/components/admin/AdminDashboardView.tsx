import React, { useState, useEffect } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  Activity,
  UserCheck,
  Phone,
  MessageCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Users,
  XCircle,
  PlusCircle,
  Filter,
} from 'lucide-react';
import { WhatsAppMessageBuilder } from '../../core/services/WhatsAppMessageBuilder';
import { defaultRequestRepository, UnifiedCustomerRequest } from '../../core/repositories/RequestRepository';

export const AdminDashboardView: React.FC = () => {
  const { products, reservations, tradeRequests, sellRequests, navigateTo, updateProductStatus, cancelReservation } = useShowroom();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<UnifiedCustomerRequest[]>([]);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [extendedTimeouts, setExtendedTimeouts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Sync unified customer requests from repository
    setRequests(defaultRequestRepository.getAll());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // PART 1: Today's Work Dashboard Metrics
  const availableProducts = products.filter((p) => p.status === 'available');
  const reservedProducts = products.filter((p) => p.status === 'reserved');
  const soldProducts = products.filter((p) => p.status === 'sold');

  const todayReservations = reservations.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr));
  const todayPurchases = requests.filter((r) => r.type === 'purchase' && r.createdAt.startsWith(todayStr));
  const todayNegotiations = requests.filter((r) => r.type === 'negotiation' && r.createdAt.startsWith(todayStr));
  const todaySellRequests = sellRequests.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr));
  const todayTradeRequests = tradeRequests.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr));
  
  // Calculate revenue from sold products
  const todayRevenue = soldProducts.reduce((acc, p) => acc + (p.price || 0), 0);
  const expectedCustomersCount = todayReservations.length + todayPurchases.length;

  // PART 6: Live Reservation Monitor Calculation
  const calculateReservationCountdown = (createdAt: string, resId: string) => {
    const createdTime = new Date(createdAt).getTime();
    const extensionMs = extendedTimeouts[resId] || 0;
    const expirationTime = createdTime + 24 * 3600 * 1000 + extensionMs;
    const now = Date.now();
    const diffMs = expirationTime - now;

    if (diffMs <= 0) {
      return { hours: 0, minutes: 0, statusColor: 'bg-slate-700 text-slate-300', text: 'منتهي (Expired)', isExpired: true, remainingHours: 0 };
    }

    const hours = Math.floor(diffMs / (1000 * 3600));
    const minutes = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));

    let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (hours < 2) {
      statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
    } else if (hours < 6) {
      statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    return {
      hours,
      minutes,
      statusColor,
      text: `${hours} ساعة و ${minutes} دقيقة`,
      isExpired: false,
      remainingHours: hours,
    };
  };

  // Extend Reservation (+24 Hours)
  const handleExtendReservation = (resId: string) => {
    setExtendedTimeouts((prev) => ({
      ...prev,
      [resId]: (prev[resId] || 0) + 24 * 3600 * 1000,
    }));
    showToast('تم تمديد الحجز', 'تم تمديد فترة حجز الجهاز 24 ساعة إضافية بنجاح', 'success');
  };

  // PART 7: One-Click Sales Completion
  const handleCompleteSale = (productId: string, resId?: string, customerName?: string) => {
    updateProductStatus(productId, 'sold');
    if (resId) {
      cancelReservation(resId);
    }
    showToast('تم إتمام عملية البيع', `تم نقل الجهاز إلى سجل الأجهزة المباعة وحجبه نهائياً عن العرض العام (${customerName || 'العميل'})`, 'success');
  };

  // PART 2: Today's Task Queue with Priority Sorting
  const getTaskPriorityScore = (task: any) => {
    if (task.type === 'reservation') {
      const countdown = calculateReservationCountdown(task.createdAt, task.id);
      if (countdown.isExpired) return 1; // 1. Expired Reservation
      if (countdown.remainingHours < 2) return 2; // 2. Expiring < 2h
      return 3; // 3. Waiting customer
    }
    if (task.type === 'purchase') return 4; // 4. New Purchase
    if (task.type === 'negotiation') return 5; // 5. Negotiation
    if (task.type === 'trade_in') return 6; // 6. Trade Request
    if (task.type === 'sell_device') return 7; // 7. Sell Device
    return 8;
  };

  // Consolidate all active tasks
  const allTasks = [
    ...reservations.map((r) => ({
      id: r.id,
      type: 'reservation' as const,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      productTitle: r.productTitle,
      productId: r.productId,
      createdAt: r.createdAt,
      status: r.status,
    })),
    ...requests.map((req) => ({
      id: req.id,
      type: req.type,
      customerName: req.customer.fullName,
      customerPhone: req.customer.phone,
      productTitle: req.productTitle || 'جهاز بدون عنوان',
      productId: req.productId,
      createdAt: req.createdAt,
      status: req.status,
    })),
  ].sort((a, b) => getTaskPriorityScore(a) - getTaskPriorityScore(b));

  const filteredTasks = selectedTaskFilter === 'all'
    ? allTasks
    : allTasks.filter((t) => t.type === selectedTaskFilter);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-12 dir-rtl">
      {/* Top Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            مركز إدارة العمليات اليومية | معرض PRO TECK
          </span>
          <h1 className="text-xl sm:text-3xl font-black">طابور مهام المعرض والعمليات المباشرة</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            متابعة فورية للحجوزات النشطة (24 ساعة)، طلبات الشراء، التفاوض، وإتمام المبيعات بنقرة واحدة.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('admin-reservations')}
            leftIcon={<ShoppingBag className="w-4 h-4 text-amber-400" />}
          >
            سجل الحجوزات ({reservations.length})
          </Button>
          <Button
            variant="electric"
            size="sm"
            onClick={() => navigateTo('admin-products')}
            leftIcon={<Package className="w-4 h-4" />}
          >
            كتالوج الأجهزة ({products.length})
          </Button>
        </div>
      </div>

      {/* PART 1: Today's Work Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {/* 1. Today's Reservations */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">حجوزات اليوم</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{todayReservations.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">24 ساعة مجاناً</span>
        </div>

        {/* 2. Today's Purchase Requests */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">طلبات الشراء</span>
          <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{todayPurchases.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">معاينة واستلام</span>
        </div>

        {/* 3. Today's Negotiations */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">التفاوض</span>
          <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">{todayNegotiations.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">عروض الأسعار</span>
        </div>

        {/* 4. Today's Sell Device Requests */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">بيع أجهزة للمعرض</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{todaySellRequests.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">طلبات العروض</span>
        </div>

        {/* 5. Today's Trade Requests */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">طلبات الاستبدال</span>
          <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">{todayTradeRequests.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">قديم بجديد</span>
        </div>

        {/* 6. Today's Completed Sales */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">المبيعات المكتملة</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{soldProducts.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">تسليم نهائي</span>
        </div>

        {/* 7. Today's Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">إيراد اليوم</span>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1 truncate">
            {todayRevenue.toLocaleString()} ج.م
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">مبيعات اليوم</span>
        </div>

        {/* 8. Today's Expected Customers */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">عملاء متوقعون</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">{expectedCustomersCount}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">زيارة المعرض</span>
        </div>
      </div>

      {/* PART 6: Live Reservation Monitor */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">مراقب الحجوزات النشطة (Live Reservation Monitor)</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                متابعة فورية للأجهزة المحجوزة لمدة 24 ساعة مع عداد تنازلي دقيق ومؤشرات ألوان
              </p>
            </div>
          </div>
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold w-fit">
            {reservations.length} جهاز محجوز مؤقتاً
          </span>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
          {reservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations.map((res) => {
                const countdown = calculateReservationCountdown(res.createdAt, res.id);
                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm text-white block">{res.productTitle}</span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          العميل: <strong className="text-slate-200">{res.customerName}</strong> ({res.customerPhone})
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] border ${countdown.statusColor}`}>
                        {countdown.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-2 text-slate-400">
                      <span>السعر: <strong className="text-emerald-400">{res.productPrice?.toLocaleString()} ج.م</strong></span>
                      <span>الكود: <strong className="font-mono text-slate-300">{res.reservationNumber}</strong></span>
                    </div>

                    {/* Admin Reservation Quick Actions */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="electric"
                        className="text-[10px] py-1 bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => handleCompleteSale(res.productId, res.id, res.customerName)}
                      >
                        إتمام بيع
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] py-1 border-slate-700 text-slate-300"
                        onClick={() => handleExtendReservation(res.id)}
                      >
                        +24h تمديد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] py-1 border-rose-900/50 text-rose-400 hover:bg-rose-950/30"
                        onClick={() => {
                          cancelReservation(res.id);
                          showToast('تم إلغاء الحجز', 'تم تحرير الجهاز وإعادته للعرض المتاح بنجاح', 'info');
                        }}
                      >
                        إلغاء الحجز
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              لا توجد حجوزات نشطة حالياً. جميع الأجهزة متاحة للشراء المباشر.
            </div>
          )}
        </CardBody>
      </Card>

      {/* PART 2 & 3: Today's Task Queue & Quick Actions */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">طابور مهام اليوم المرتب حسب الأولوية التشغيلية</h3>
              <p className="text-[11px] text-slate-400">
                مرتب آلياً: الحجوزات المنتهية ➔ الحجوزات القريبة ➔ العملاء المنتظرون ➔ طلبات الشراء ➔ التفاوض
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTaskFilter}
              onChange={(e) => setSelectedTaskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl outline-none"
            >
              <option value="all">كافة المهام ({allTasks.length})</option>
              <option value="reservation">الحجوزات فقط ({reservations.length})</option>
              <option value="purchase">طلبات الشراء ({todayPurchases.length})</option>
              <option value="negotiation">التفاوض ({todayNegotiations.length})</option>
              <option value="trade_in">الاستبدال ({todayTradeRequests.length})</option>
            </select>
          </div>
        </CardHeader>

        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isRes = task.type === 'reservation';
                const whatsappMsg = isRes
                  ? WhatsAppMessageBuilder.buildReservationMessage(
                      { name: task.customerName, phone: task.customerPhone },
                      { title: task.productTitle, code: task.productId, price: 0 }
                    )
                  : `مرحباً ${task.customerName}، تواصل من معرض PRO TECK بخصوص طلبك (${task.productTitle}).`;

                return (
                  <div
                    key={task.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs hover:border-slate-700 transition-all"
                  >
                    {/* Task Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                        {task.type === 'reservation' ? 'حجز' : task.type === 'purchase' ? 'شراء' : task.type === 'negotiation' ? 'فصال' : 'طلب'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{task.productTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                            {task.type === 'reservation' ? 'حجز 24 ساعة' : task.type === 'purchase' ? 'طلب شراء' : task.type === 'negotiation' ? 'تفاوض سعر' : 'طلب عام'}
                          </span>
                        </div>
                        <span className="text-slate-400 flex items-center gap-2 mt-1 text-[11px]">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          {task.customerName} ({task.customerPhone})
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Open WhatsApp */}
                      <Button
                        size="sm"
                        variant="electric"
                        className="bg-emerald-600 hover:bg-emerald-500 text-[11px] py-1.5 px-3"
                        onClick={() => WhatsAppMessageBuilder.openWhatsApp(task.customerPhone, whatsappMsg)}
                        leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                      >
                        واتساب
                      </Button>

                      {/* Call Customer */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] py-1.5 px-3"
                        onClick={() => window.open(`tel:${task.customerPhone}`, '_self')}
                        leftIcon={<Phone className="w-3.5 h-3.5 text-blue-400" />}
                      >
                        اتصال
                      </Button>

                      {/* View Customer Workspace */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] py-1.5 px-3"
                        onClick={() => navigateTo('admin-customers')}
                        leftIcon={<Users className="w-3.5 h-3.5 text-purple-400" />}
                      >
                        ملف العميل
                      </Button>

                      {/* Complete Sale */}
                      <Button
                        size="sm"
                        variant="silver"
                        className="text-[11px] py-1.5 px-3"
                        onClick={() => handleCompleteSale(task.productId, task.id, task.customerName)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        إتمام بيع
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                لا توجد مهام في قائمة الانتظار الحالية.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
