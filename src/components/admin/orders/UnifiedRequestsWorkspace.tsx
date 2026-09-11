import React, { useState, useEffect } from 'react';
import { defaultRequestRepository, RequestRepository, UnifiedCustomerRequest, RequestStatus, UnifiedRequestType } from '../../../core/repositories/RequestRepository';
import { WhatsAppMessageBuilder } from '../../../core/services/WhatsAppMessageBuilder';
import { useToast } from '../../../context/ToastContext';
import { useShowroom } from '../../../context/ShowroomContext';
import {
  User,
  Package,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Phone,
  Copy,
  ExternalLink,
  Trash2,
  Archive,
  Filter,
  Search,
  ArrowUpDown,
  Download,
  Tag,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface UnifiedRequestsWorkspaceProps {
  onSelectCustomer?: (customerPhone: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const UnifiedRequestsWorkspace: React.FC<UnifiedRequestsWorkspaceProps> = ({
  onSelectCustomer,
  onSelectProduct,
}) => {
  const { showToast } = useToast();
  const { updateProductStatus, cancelReservation, navigateTo } = useShowroom();

  const [requests, setRequests] = useState<UnifiedCustomerRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeModalRequest, setActiveModalRequest] = useState<UnifiedCustomerRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Load and subscribe requests
  const loadRequests = () => {
    const all = defaultRequestRepository.getAll();
    // Sort by priority score (ascending) and then by date (descending)
    all.sort((a, b) => {
      const pA = RequestRepository.calculatePriorityScore(a);
      const pB = RequestRepository.calculatePriorityScore(b);
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setRequests(all);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle Quick Actions
  const handleOpenWhatsApp = (req: UnifiedCustomerRequest) => {
    const text = WhatsAppMessageBuilder.buildReservationMessage(
      { name: req.customer.fullName, phone: req.customer.phone },
      { title: req.productTitle || 'جهاز المعرض', code: req.productId || '', price: req.productPrice || 0 }
    );

    // Auto log timeline event
    defaultRequestRepository.addTimelineEntry(req.id, 'تم فتح محادثة الواتساب مع العميل', 'Showroom Admin');
    loadRequests();

    WhatsAppMessageBuilder.openWhatsApp(req.customer.phone, text);
    showToast('واتساب', `تم فتح المحادثة المباشرة مع ${req.customer.fullName}`, 'info');
  };

  const handleCallCustomer = (req: UnifiedCustomerRequest) => {
    defaultRequestRepository.addTimelineEntry(req.id, 'تم إجراء اتصال هاتفي مع العميل', 'Showroom Admin');
    loadRequests();
    window.open(`tel:${req.customer.phone}`, '_self');
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    showToast('تم النسخ', `تم نسخ رقم الهاتف (${phone}) إلى الحافظة`, 'success');
  };

  const handleUpdateStatus = (reqId: string, newStatus: RequestStatus, note?: string) => {
    defaultRequestRepository.updateStatus(reqId, newStatus, note);
    loadRequests();
    if (activeModalRequest && activeModalRequest.id === reqId) {
      const updated = defaultRequestRepository.getById(reqId);
      if (updated) setActiveModalRequest(updated);
    }
    showToast('تحديث الحالة', `تم تغيير حالة الطلب بنجاح إلى ${newStatus}`, 'success');
  };

  const handleCompleteSale = (req: UnifiedCustomerRequest) => {
    if (req.productId) {
      updateProductStatus(req.productId, 'sold');
    }
    if (req.type === 'reservation' && req.details?.reservationId) {
      cancelReservation(req.details.reservationId);
    }
    defaultRequestRepository.updateStatus(req.id, 'completed', 'تمت عملية البيع والتسليم المباشر بنجاح بالمعرض');
    loadRequests();
    if (activeModalRequest && activeModalRequest.id === req.id) {
      const updated = defaultRequestRepository.getById(req.id);
      if (updated) setActiveModalRequest(updated);
    }
    showToast('إتمام البيع', `تم إتمام بيع الجهاز للعميل ${req.customer.fullName} وتحديث السجلات تلقائياً`, 'success');
  };

  const handleCancelRequest = (req: UnifiedCustomerRequest) => {
    defaultRequestRepository.updateStatus(req.id, 'cancelled', 'تم إلغاء الطلب بناءً على طلب العميل أو الإدارة');
    loadRequests();
    if (activeModalRequest && activeModalRequest.id === req.id) {
      const updated = defaultRequestRepository.getById(req.id);
      if (updated) setActiveModalRequest(updated);
    }
    showToast('إلغاء الطلب', 'تم إلغاء الطلب وإعادة توجيه البيانات', 'info');
  };

  const handleDeleteRequest = (reqId: string) => {
    defaultRequestRepository.remove(reqId);
    loadRequests();
    if (activeModalRequest?.id === reqId) setActiveModalRequest(null);
    showToast('حذف الطلب', 'تم حذف الطلب نهائياً من النظام', 'info');
  };

  const handleAddNote = (reqId: string) => {
    if (!adminNoteInput.trim()) return;
    defaultRequestRepository.addTimelineEntry(reqId, `ملاحظة إدارية: ${adminNoteInput}`, 'Showroom Admin');
    setAdminNoteInput('');
    loadRequests();
    const updated = defaultRequestRepository.getById(reqId);
    if (updated) setActiveModalRequest(updated);
    showToast('ملاحظة إدارية', 'تم حفظ الملاحظة بالجدول الزمني للطلب', 'success');
  };

  // Bulk Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkStatusChange = (newStatus: RequestStatus) => {
    const count = defaultRequestRepository.bulkUpdateStatus(selectedIds, newStatus);
    setSelectedIds([]);
    loadRequests();
    showToast('عملية جماعية', `تم تحديث حالة ${count} طلب بنجاح`, 'success');
  };

  const handleBulkDelete = () => {
    const count = defaultRequestRepository.bulkDelete(selectedIds);
    setSelectedIds([]);
    loadRequests();
    showToast('حذف جماعي', `تم حذف ${count} طلب من السجلات`, 'info');
  };

  const handleExportCSV = () => {
    const headers = ['Reference Number', 'Customer Name', 'Customer Phone', 'Request Type', 'Product', 'Price', 'Status', 'Created At'];
    const rows = filteredRequests.map((r) => [
      r.referenceNumber,
      `"${r.customer.fullName}"`,
      r.customer.phone,
      r.type,
      `"${r.productTitle || ''}"`,
      r.productPrice || 0,
      r.status,
      r.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Unified_Requests_PRO_TECK_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تصدير CSV', 'تم تصدير سجل الطلبات الموحد بنجاح', 'success');
  };

  // Filter & Search Logic
  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      req.referenceNumber.toLowerCase().includes(q) ||
      req.customer.fullName.toLowerCase().includes(q) ||
      req.customer.phone.includes(q) ||
      (req.productTitle && req.productTitle.toLowerCase().includes(q)) ||
      (req.productId && req.productId.toLowerCase().includes(q));

    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: UnifiedRequestType) => {
    switch (type) {
      case 'reservation':
        return { label: 'حجز 24 ساعة', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'purchase':
        return { label: 'طلب شراء', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'negotiation':
        return { label: 'تفاوض سعر', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'sell_device':
        return { label: 'بيع جهاز للمعرض', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'trade_in':
        return { label: 'طلب استبدال', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'inquiry':
        return { label: 'استفسار عام', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'new':
        return { label: 'جديد (New)', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse' };
      case 'viewed':
        return { label: 'تم الاطلاع', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
      case 'contacted':
        return { label: 'تم التواصل', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
      case 'waiting_customer':
        return { label: 'في انتظار العميل', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      case 'completed':
        return { label: 'مكتمل (تم البيع)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'cancelled':
        return { label: 'ملغى', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'expired':
        return { label: 'منتهي الصلاحية', color: 'bg-slate-800 text-slate-400 border-slate-700' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="flex flex-col gap-5 text-xs text-slate-100 dir-rtl font-sans">
      {/* Top Controls & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، رقم الهاتف، المرجع (Ref ID)، كود الجهاز، عنوان المنتج..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 pr-10 pl-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">كافة أنواع الطلبات ({requests.length})</option>
                <option value="reservation">الحجوزات (Reservation)</option>
                <option value="purchase">طلبات الشراء (Purchase)</option>
                <option value="negotiation">التفاوض (Negotiation)</option>
                <option value="sell_device">بيع جهاز للمعرض (Sell Device)</option>
                <option value="trade_in">الاستبدال (Trade)</option>
                <option value="inquiry">استفسارات عامة (Inquiry)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">كافة الحالات</option>
                <option value="new">جديد (New)</option>
                <option value="viewed">تم الاطلاع (Viewed)</option>
                <option value="contacted">تم التواصل (Contacted)</option>
                <option value="waiting_customer">في انتظار العميل (Waiting)</option>
                <option value="completed">مكتمل / تم البيع (Completed)</option>
                <option value="cancelled">ملغى (Cancelled)</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Toolbar if selected */}
        {selectedIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <span className="font-extrabold text-blue-300">
              تم تحديد ({selectedIds.length}) طلب من السجلات
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('contacted')}
                className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/30 hover:bg-purple-600/40 text-[11px] font-bold"
              >
                تحديد كـ "تم التواصل"
              </button>
              <button
                onClick={() => handleBulkStatusChange('completed')}
                className="px-3 py-1 rounded-xl bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-600/40 text-[11px] font-bold"
              >
                إتمام المبيعات
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-[11px] font-bold"
              >
                أرشفة
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 rounded-xl bg-rose-600/30 text-rose-200 border border-rose-500/30 hover:bg-rose-600/40 text-[11px] font-bold"
              >
                حذف النهائيات
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white text-[11px] font-bold underline mr-2"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Unified Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                  />
                </th>
                <th className="p-4">المرجع (Ref ID)</th>
                <th className="p-4">نوع الطلب والأولوية</th>
                <th className="p-4">اسم العميل والمنطقة</th>
                <th className="p-4">الجهاز المطلوب والسعر</th>
                <th className="p-4">الحالة التشغيلية</th>
                <th className="p-4">التاريخ والوقت</th>
                <th className="p-4 text-center">الإجراءات السريعة (One-Click)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-bold">
                    لا توجد طلبات مطابقة للبحث أو الفلاتر المحددة حالياً.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  const typeBadge = getTypeBadge(req.type);
                  const statusBadge = getStatusBadge(req.status);

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-950/30' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(req.id)}
                          className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Ref ID */}
                      <td className="p-4 font-mono font-black text-blue-400">
                        <button
                          onClick={() => setActiveModalRequest(req)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{req.referenceNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </td>

                      {/* Request Type & Priority */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border w-fit ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <strong className="text-white font-bold block">{req.customer.fullName}</strong>
                          <span className="text-slate-400 font-mono text-[11px] block">
                            <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>
                              {req.customer.phone}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Product & Price */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-200 block truncate max-w-[200px]">
                            {req.productTitle || 'بدون جهاز مخصص'}
                          </span>
                          {req.productPrice ? (
                            <span className="font-black text-emerald-400 font-mono">
                              {req.productPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">حسب المعاينة</span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={req.status}
                          onChange={(e) => handleUpdateStatus(req.id, e.target.value as RequestStatus)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black border outline-none cursor-pointer ${statusBadge.color}`}
                        >
                          <option value="new">جديد (New)</option>
                          <option value="viewed">تم الاطلاع (Viewed)</option>
                          <option value="contacted">تم التواصل (Contacted)</option>
                          <option value="waiting_customer">في انتظار العميل (Waiting)</option>
                          <option value="completed">مكتمل / تم البيع (Completed)</option>
                          <option value="cancelled">ملغى (Cancelled)</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleOpenWhatsApp(req)}
                            title="فتح محادثة الواتساب"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Phone Call */}
                          <button
                            onClick={() => handleCallCustomer(req)}
                            title="إجراء اتصال هاتفي"
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Phone */}
                          <button
                            onClick={() => handleCopyPhone(req.customer.phone)}
                            title="نسخ رقم الهاتف"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Complete Sale */}
                          <button
                            onClick={() => handleCompleteSale(req)}
                            title="إتمام عملية البيع فوراً"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all cursor-pointer"
                          >
                            إتمام بيع
                          </button>

                          {/* Details 360 Modal */}
                          <button
                            onClick={() => setActiveModalRequest(req)}
                            title="عرض تفاصيل الطلب الكاملة"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PART 4: Detailed 360 Request Modal */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 dir-rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    تفاصيل الطلب 360 ({activeModalRequest.referenceNumber})
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    النوع: <strong className="text-amber-400">{activeModalRequest.type}</strong> | التاريخ:{' '}
                    {new Date(activeModalRequest.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalRequest(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-blue-400 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                    <User className="w-4 h-4" />
                    <span>بيانات العميل التواصلية</span>
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-white font-bold text-sm">{activeModalRequest.customer.fullName}</p>
                    <p className="text-slate-300 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span dir="ltr" className="font-mono inline-block" style={{ unicodeBidi: 'isolate' }}>{activeModalRequest.customer.phone}</span>
                    </p>
                    {activeModalRequest.customer.email && (
                      <p className="text-slate-400">البريد: {activeModalRequest.customer.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenWhatsApp(activeModalRequest)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>
                    <button
                      onClick={() => handleCallCustomer(activeModalRequest)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-amber-400 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                    <Package className="w-4 h-4" />
                    <span>تفاصيل الجهاز المطلوب</span>
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-white font-extrabold">{activeModalRequest.productTitle || 'بدون تحديد جهاز'}</p>
                    {activeModalRequest.productPrice && (
                      <p className="text-emerald-400 font-mono font-black text-sm">
                        {activeModalRequest.productPrice.toLocaleString('ar-EG')} ج.م
                      </p>
                    )}
                    {activeModalRequest.productId && (
                      <p className="text-slate-400 font-mono text-[10px]">كود الجهاز: {activeModalRequest.productId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Lifecycle Controller */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-slate-200 text-sm">تغيير حالة مسار الطلب (Request Lifecycle)</h4>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'viewed', 'contacted', 'waiting_customer', 'completed', 'cancelled'] as RequestStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(activeModalRequest.id, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                        activeModalRequest.status === st
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes & Add Note */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-purple-400 text-sm">الملاحظات والتعليمات الإدارية</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="إضافة ملاحظة إدارية خاصة بهذا الطلب..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleAddNote(activeModalRequest.id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Automatic Timeline / Audit Trail */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>الجدول الزمني والتسجيل الآلي (Automatic Timeline & Audit Trail)</span>
                </h4>
                <div className="space-y-2">
                  {activeModalRequest.auditTrail.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] flex justify-between items-start"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">{entry.note}</span>
                        <span className="text-slate-500 text-[10px]">المسؤول: {entry.actor}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(entry.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleDeleteRequest(activeModalRequest.id)}
                className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 font-bold"
              >
                حذف الطلب نهائياً
              </button>
              <button
                onClick={() => handleCompleteSale(activeModalRequest)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg"
              >
                إتمام بيع الشحنة والجهاز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
