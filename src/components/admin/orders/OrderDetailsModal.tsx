import React, { useState } from 'react';
import {
  PurchaseRequest,
  NegotiationItem,
  OrderTimelineEvent,
  ProductSyncPayload,
} from '../../../types/orderManagementCenter';

import { createProductSyncPayload } from '../../../utils/orderManagementStorage';
import { normalizeEgyptianPhone } from '../../../utils/phoneUtils';
import {
  X,
  Clock,
  User,
  Package,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  ArrowRightLeft,
  ShieldCheck,
  Send,
  AlertTriangle,
  RefreshCw,
  Printer,
  Sparkles,
} from 'lucide-react';

interface OrderDetailsModalProps {
  item: PurchaseRequest | any;
  itemType: 'request' | 'negotiation' | 'completed';
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onConvertToSale?: (item: any) => void;
  onOpenAiAssistant?: (item: any) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  item,
  itemType,
  onClose,
  onUpdateStatus,
  onConvertToSale,
  onOpenAiAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'sync_payload' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<ProductSyncPayload | null>(null);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotesList((prev) => [newNote.trim(), ...prev]);
    setNewNote('');
  };

  const handleTriggerProductSync = (newStatus: 'available' | 'reserved' | 'sold') => {
    const payload = createProductSyncPayload(item.productTitle || item.productTitle, newStatus);
    setSyncStatus(payload);
  };

  const timelineEvents: OrderTimelineEvent[] = item.timeline || [
    {
      id: 'tl-init',
      timestamp: item.requestedDate || item.createdAt || new Date().toISOString(),
      eventType: 'request_created',
      title: 'تم إنشاء الطلب بالنظام',
      description: 'تسجيل البيانات المبدئية للعميل والجهاز المطلوبة.',
      actor: item.customerName || 'العميل',
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg">
              PT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm text-white">
                  مركز تفاصيل الطلب والحساب 360°
                </h2>
                <span className="font-mono text-blue-400 font-extrabold bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                  {item.referenceNumber || item.reservationNumber || item.orderNumber || 'REF-N/A'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                العميل: <strong className="text-white">{item.customerName}</strong> | الجهاز:{' '}
                <strong className="text-slate-200">{item.productTitle}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الملف</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>نظرة عامة والتحويلات</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سجل الجدول الزمني (Timeline)</span>
          </button>

          <button
            onClick={() => setActiveTab('sync_payload')}
            className={`px-4 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sync_payload'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>ربط المخزون والمزامن</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl font-extrabold text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الملاحظات الداخلية ({notesList.length})</span>
          </button>

          {onOpenAiAssistant && (
            <button
              onClick={() => onOpenAiAssistant(item)}
              className="mr-auto px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>تحليل المساعد الذكي</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-extrabold text-blue-400 text-[11px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>بيانات العميل</span>
                  </span>
                  <p className="font-black text-white text-xs">{item.customerName}</p>
                  <p className="text-slate-400 font-mono text-[11px]">الهاتف: {item.customerPhone}</p>
                  <a
                    href={`https://wa.me/${normalizeEgyptianPhone(item.customerPhone || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline pt-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>مراسلة عبر الواتساب</span>
                  </a>
                </div>

                {/* Product Details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-extrabold text-purple-400 text-[11px] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>تفاصيل الجهاز</span>
                  </span>
                  <p className="font-black text-white text-xs">{item.productTitle}</p>
                  <p className="text-emerald-400 font-black text-xs">
                    السعر: {(item.productPrice || item.finalPrice || 0).toLocaleString('ar-EG')} ج.م
                  </p>
                  <p className="text-slate-400 text-[10px]">كود الجهاز: {item.productCode || 'PROD-SPEC'}</p>
                </div>

                {/* Status & Admin */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-extrabold text-amber-400 text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>الحالة والمسؤول</span>
                  </span>
                  <div>
                    <span className="text-slate-400 text-[10px] block">الحالة الحالية:</span>
                    <span className="font-black text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 inline-block mt-0.5">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] pt-1">
                    المشرف المسؤول: <strong className="text-slate-200">{item.assignedAdmin || 'PRO TECK Admin'}</strong>
                  </p>
                </div>
              </div>

              {/* Conversion Workflows & Status Controls */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-black text-xs text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                  <span>محرك التحويل وتغيير سير العمل (Conversion Workflow Engine)</span>
                </h4>

                <div className="flex items-center gap-2 flex-wrap">
                  {onConvertToSale && (
                    <button
                      onClick={() => {
                        onConvertToSale(item);
                        handleTriggerProductSync('sold');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إتمام البيع والتسليم (Completed Sale)</span>
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateStatus(item.id, 'rejected')}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold border border-rose-500/20 cursor-pointer"
                  >
                    رفض الطلب
                  </button>

                  <button
                    onClick={() => onUpdateStatus(item.id, 'archived')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold cursor-pointer"
                  >
                    أرشفة الطلب
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-black text-xs text-slate-200">تتبع الأحداث الميدانية (Order Lifecycle Timeline):</h4>
              <div className="relative border-r-2 border-slate-800 pr-5 space-y-6">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-md shadow-blue-500/50" />
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold text-xs">{evt.title}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(evt.timestamp).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{evt.description}</p>
                      <span className="text-[10px] text-blue-400 font-semibold block pt-1">
                        بواسطة: {evt.actor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sync_payload' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-extrabold text-xs text-emerald-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>محرك مزامنة حالة الجهاز بالنظام والمخزن</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  عند تغيير حالة الطلب، يتم إطلاق حمولة مزامنة فورية لتحديث حالة الجهاز بالمخزن وحساب العميل وإشعارات الإدارة.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleTriggerProductSync('sold')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/20"
                  >
                    مزامنة كـ "مباع"
                  </button>

                  <button
                    onClick={() => handleTriggerProductSync('available')}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold border border-blue-500/20"
                  >
                    مزامنة كـ "متاح بالمعرض"
                  </button>
                </div>

                {syncStatus && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold block">✓ تم إنشاء حمولة المزامنة بنجاح (Sync Payload Ready):</span>
                    <pre className="text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto text-[10px]">
                      {JSON.stringify(syncStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">إضافة ملاحظة إدارية خاصة:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="مثال: تم الاتفاق على موعد التسليم الخميس القادم..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>حفظ الملاحظة</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {notesList.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                    <p className="text-xs">{note}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      بواسطة الأدمن • {new Date().toLocaleTimeString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
