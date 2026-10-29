import React, { useState, useEffect } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Package,
  CheckCircle2,
  TrendingUp,
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
  const { products, tradeRequests, sellRequests, navigateTo, updateProductStatus } = useShowroom();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<UnifiedCustomerRequest[]>([]);
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');

  useEffect(() => {
    // Sync unified customer requests from repository
    setRequests(defaultRequestRepository.getAll());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // PART 1: Today's Work Dashboard Metrics
  const availableProducts = products.filter((p) => p.status === 'available');
  const soldProducts = products.filter((p) => p.status === 'sold');
  const todaySoldProducts = soldProducts.filter(
    (p) => typeof p.soldAt === 'string' && p.soldAt.startsWith(todayStr)
  );

  const todayPurchases = requests.filter((r) => r.type === 'purchase' && r.createdAt.startsWith(todayStr));
  const todayNegotiations = requests.filter((r) => r.type === 'negotiation' && r.createdAt.startsWith(todayStr));
  const todaySellRequests = sellRequests.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr));
  const todayTradeRequests = tradeRequests.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr));
  
  // Calculate revenue from sold products sold today only (using finalPrice if available)
  const todayRevenue = soldProducts
    .filter((p) => typeof p.soldAt === 'string' && p.soldAt.startsWith(todayStr))
    .reduce((acc, p) => {
      if (typeof p.finalPrice === 'number') return acc + p.finalPrice;
      const matchedReq = requests.find(
        (r) => r.productId === p.id && r.status === 'completed' && typeof r.finalPrice === 'number'
      );
      if (matchedReq && typeof matchedReq.finalPrice === 'number') return acc + matchedReq.finalPrice;
      return acc + (p.price || 0);
    }, 0);
  const expectedCustomersCount = todayPurchases.length;

  // PART 7: One-Click Sales Completion
  const handleCompleteSale = (productId: string, customerName?: string) => {
    updateProductStatus(productId, 'sold');
    showToast('تم إتمام عملية البيع', `تم نقل الجهاز إلى سجل الأجهزة المباعة وحجبه نهائياً عن العرض العام (${customerName || 'العميل'})`, 'success');
  };

  // PART 2: Today's Task Queue with Priority Sorting
  const getTaskPriorityScore = (task: any) => {
    if (task.type === 'purchase') return 1; // 1. New Purchase
    if (task.type === 'negotiation') return 2; // 2. Negotiation
    if (task.type === 'trade_in') return 3; // 3. Trade Request
    if (task.type === 'sell_device') return 4; // 4. Sell Device
    return 5;
  };

  // Consolidate all active tasks
  const allTasks = requests.map((req) => ({
    id: req.id,
    type: req.type,
    customerName: req.customer.fullName,
    customerPhone: req.customer.phone,
    productTitle: req.productTitle || 'جهاز بدون عنوان',
    productId: req.productId,
    createdAt: req.createdAt,
    status: req.status,
  })).sort((a, b) => getTaskPriorityScore(a) - getTaskPriorityScore(b));

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
            متابعة فورية لطلبات الشراء، التفاوض، وإتمام المبيعات بنقرة واحدة.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Today's Purchase Requests */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">طلبات الشراء</span>
          <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{todayPurchases.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">معاينة واستلام</span>
        </div>

        {/* 3. Today's Sell Device Requests */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">بيع أجهزة للمعرض</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{todaySellRequests.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">طلبات العروض</span>
        </div>

        {/* 5. Today's Completed Sales */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">المبيعات المكتملة</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{todaySoldProducts.length}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">تسليم نهائي</span>
        </div>

        {/* 6. Today's Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">إيراد اليوم (الفعلي)</span>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1 truncate">
            {todayRevenue.toLocaleString()} ج.م
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">مبيعات اليوم</span>
        </div>

        {/* 7. Today's Expected Customers */}
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl text-white">
          <span className="text-[10px] text-slate-400 font-bold block">عملاء متوقعون</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">{expectedCustomersCount}</div>
          <span className="text-[9px] text-slate-500 block mt-0.5">زيارة المعرض</span>
        </div>
      </div>

      {/* PART 2 & 3: Today's Task Queue & Quick Actions */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">طابور مهام اليوم المرتب حسب الأولوية التشغيلية</h3>
              <p className="text-[11px] text-slate-400">
                مرتب آلياً: طلبات الشراء ➔ التفاوض ➔ الاستبدال ➔ بيع الأجهزة
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
              <option value="purchase">طلبات الشراء ({todayPurchases.length})</option>
            </select>
          </div>
        </CardHeader>

        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const whatsappMsg = `مرحباً ${task.customerName}، تواصل من معرض PRO TECK بخصوص طلبك (${task.productTitle}).`;

                return (
                  <div
                    key={task.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs hover:border-slate-700 transition-all"
                  >
                    {/* Task Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                        {task.type === 'purchase' ? 'شراء' : task.type === 'negotiation' ? 'فصال' : 'طلب'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{task.productTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                            {task.type === 'purchase' ? 'طلب شراء' : task.type === 'negotiation' ? 'تفاوض سعر' : 'طلب عام'}
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
                        onClick={() => handleCompleteSale(task.productId, task.customerName)}
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
