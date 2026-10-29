import React, { useState } from 'react';
import { ApprovalItem, ApprovalStatus, ApprovalType } from '../../../types/adminCore';
import { useShowroom, RoutePath } from '../../../context/ShowroomContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Bot,
  User,
  Package,
  Phone,
  X,
  Search,
  Filter,
  Eye,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface AdminApprovalCenterProps {
  isOpen: boolean;
  onClose: () => void;
  approvalItems: ApprovalItem[];
  onUpdateApproval: (id: string, newStatus: ApprovalStatus) => void;
}

export const AdminApprovalCenter: React.FC<AdminApprovalCenterProps> = ({
  isOpen,
  onClose,
  approvalItems,
  onUpdateApproval,
}) => {
  const { navigateTo } = useShowroom();
  const [selectedType, setSelectedType] = useState<'all' | ApprovalType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState<ApprovalItem | null>(null);

  if (!isOpen) return null;

  const pendingCount = approvalItems.filter((item) => item.status === 'pending').length;

  const filteredItems = approvalItems.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;

    if (
      searchQuery &&
      !item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(item.relatedProductTitle && item.relatedProductTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  const getApprovalTypeLabel = (type: ApprovalType) => {
    switch (type) {
      case 'purchase_request':
        return 'طلب شراء كاش مباشر';
      case 'negotiation':
        return 'طلب تفاوض وسعر خاص';
      case 'sell_request':
        return 'عرض بيع جهاز مستعمل';
      case 'exchange_request':
        return 'طلب استبدال جهاز';
      case 'ai_suggestion':
        return 'توصية الذكاء الاصطناعي';
      case 'manual_adjustment':
        return 'تسوية مالية يدوية';
      default:
        return 'طلب معلق';
    }
  };

  const getPriorityBadge = (priority: ApprovalItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">عاجل جداً</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">أولوية مرتفعة</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">أولوية متوسطة</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">عادية</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white">مركز الموافقات والاعتمادات المركزي</h2>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                    {pendingCount} بانتظار قرارك
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                المركز الموحد لاعتماد طلبات الشراء، العروض، واستثناءات حارس AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Governance Reminder Banner */}
        <div className="px-5 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>قانون حوكمة الذكاء الاصطناعي:</strong> الذكاء الاصطناعي لا ينفذ أي قرار مالياً أو مخزنياً. الموافقة اليدوية من المدير أمر إلزامي ومباشر.
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالرقم المرجعي، العميل، أو الجهاز..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                قيد الانتظار ({approvalItems.filter((i) => i.status === 'pending').length})
              </button>
              <button
                onClick={() => setSelectedStatus('approved')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  selectedStatus === 'approved'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تمت الموافقة
              </button>
              <button
                onClick={() => setSelectedStatus('rejected')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  selectedStatus === 'rejected'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                مرفوضة
              </button>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                جميع السجلات
              </button>
            </div>
          </div>
        </div>

        {/* Approval Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              لا توجد طلبات موافقة تطابق الفلاتر المحددة حالياً.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 transition-all shadow-lg"
              >
                {/* Top Row: Ref, Type, Priority, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                      #{item.referenceNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {getApprovalTypeLabel(item.type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">صاحب الطلب / العميل</span>
                      <span className="font-bold text-white block">{item.customerName}</span>
                      <span className="text-slate-400 font-mono text-[11px] block">{item.customerPhone}</span>
                    </div>
                  </div>

                  {/* Related Product / Value */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Package className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">الجهاز المرتبط / القيمة</span>
                      <span className="font-bold text-white block truncate">
                        {item.relatedProductTitle || 'غير محدد'}
                      </span>
                      {item.amount && (
                        <span className="text-emerald-400 font-black text-[11px] block">
                          المبلغ: {item.amount.toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </div>

                {/* Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">حالة القرار:</span>
                    {item.status === 'pending' && (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        بانتظار قرار الأدمن
                      </span>
                    )}
                    {item.status === 'approved' && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> تم القبول والاعتماد
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> تم الرفض
                      </span>
                    )}
                    {item.status === 'more_info_requested' && (
                      <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        تم طلب توضيح من العميل
                      </span>
                    )}
                  </div>

                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onUpdateApproval(item.id, 'approved')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>موافقة واعتماد</span>
                      </button>

                      <button
                        onClick={() => onUpdateApproval(item.id, 'rejected')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 font-bold text-xs transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>

                      <button
                        onClick={() => onUpdateApproval(item.id, 'more_info_requested')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-700"
                        title="طلب استكمال معلومات"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>سجل الموافقات المركزي المؤرَخ والمحمي بسجل التتبع</span>
          <span className="font-bold text-emerald-400">PRO TECK Security System</span>
        </div>
      </div>
    </div>
  );
};
