import React, { useState } from 'react';
import { Customer, CustomerWorkspaceTab, CustomerDocument } from '../../../types/customerHub';
import { RequestAuditStatus } from '../../../types/customerActions';
import { defaultSequenceService } from '../../../core/services/SequenceService';
import { IdGenerator } from '../../../core/services/IdGenerator';
import {
  User,
  X,
  Phone,
  MessageSquare,
  ShoppingBag,
  BookmarkCheck,
  DollarSign,
  Percent,
  RefreshCw,
  Repeat,
  FileText,
  Eye,
  FileCheck,
  Pin,
  Clock,
  Bot,
  Plus,
  Trash2,
  Printer,
  Edit,
} from 'lucide-react';

// Workspace Tabs
import { OverviewTab } from './tabs/OverviewTab';
import { PurchaseRequestsTab } from './tabs/PurchaseRequestsTab';
import { ReservationsTab } from './tabs/ReservationsTab';
import { NegotiationsTab } from './tabs/NegotiationsTab';

import { SellRequestsTab } from './tabs/SellRequestsTab';
import { ExchangeRequestsTab } from './tabs/ExchangeRequestsTab';
import { InvoicesTab } from './tabs/InvoicesTab';
import { VisitedProductsTab } from './tabs/VisitedProductsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { CommunicationTab } from './tabs/CommunicationTab';
import { NotesTab } from './tabs/NotesTab';
import { TimelineTab } from './tabs/TimelineTab';
import { AiAssistantTab } from './tabs/AiAssistantTab';

// Modals
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { CreateRequestModal } from './CreateRequestModal';

interface CustomerWorkspaceModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdateCustomer: (updated: Partial<Customer>) => void;
  onSoftDeleteCustomer: (customer: Customer) => void;
}

export const CustomerWorkspaceModal: React.FC<CustomerWorkspaceModalProps> = ({
  customer,
  onClose,
  onUpdateCustomer,
  onSoftDeleteCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<CustomerWorkspaceTab>('overview');

  // Child Modals inside Workspace
  const [previewDoc, setPreviewDoc] = useState<CustomerDocument | null>(null);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);

  // Tabs Configuration
  const tabs: { key: CustomerWorkspaceTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: <User className="w-4 h-4" /> },
    { key: 'purchase_requests', label: 'طلبات الشراء', icon: <ShoppingBag className="w-4 h-4" />, badge: customer.totalPurchases },
    { key: 'reservations', label: 'الحجوزات', icon: <BookmarkCheck className="w-4 h-4" />, badge: customer.totalReservations },
    { key: 'negotiations', label: 'التفاوض', icon: <Percent className="w-4 h-4" /> },

    { key: 'sell_requests', label: 'بيع جهاز للشركة', icon: <RefreshCw className="w-4 h-4" /> },
    { key: 'exchange_requests', label: 'طلب استبدال', icon: <Repeat className="w-4 h-4" /> },
    { key: 'invoices', label: 'الفواتير', icon: <FileText className="w-4 h-4" /> },
    { key: 'visited_products', label: 'الأجهزة المعاينة', icon: <Eye className="w-4 h-4" />, badge: customer.visitedProducts.length },
    { key: 'documents', label: 'المستندات الإيصالات', icon: <FileCheck className="w-4 h-4" />, badge: customer.documents.length },
    { key: 'communication_history', label: 'سجل الاتصالات', icon: <MessageSquare className="w-4 h-4" />, badge: customer.communicationLogs.length },
    { key: 'notes', label: 'الملاحظات', icon: <Pin className="w-4 h-4" />, badge: customer.notes.length },
    { key: 'timeline', label: 'الجدول الزمني', icon: <Clock className="w-4 h-4" /> },
    { key: 'ai_assistant', label: 'المساعد الذكي', icon: <Bot className="w-4 h-4 text-purple-400" /> },
  ];

  // Request & Storage Handlers
  const handleUpdateStatus = (status: Customer['status']) => {
    onUpdateCustomer({ status });
  };

  const handleAddNote = (content: string, isPinned: boolean) => {
    const newNote = {
      id: `note-${Date.now()}`,
      content,
      isPinned,
      author: 'PRO TECK Admin',
      createdAt: new Date().toISOString(),
    };
    onUpdateCustomer({
      notes: [newNote, ...customer.notes],
    });
  };

  const handleTogglePinNote = (noteId: string) => {
    const updatedNotes = customer.notes.map((n) =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateCustomer({ notes: updatedNotes });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = customer.notes.filter((n) => n.id !== noteId);
    onUpdateCustomer({ notes: updatedNotes });
  };

  const handleAddLogEntry = (entry: any) => {
    const newLog = {
      id: `comm-${Date.now()}`,
      ...entry,
    };
    onUpdateCustomer({
      communicationLogs: [newLog, ...customer.communicationLogs],
    });
  };

  const handleCreateRequest = (type: string, payload: any) => {
    // Add timeline log for request creation
    const newTimelineEvent = {
      id: IdGenerator.generateUniqueId('tl'),
      timestamp: new Date().toISOString(),
      actor: 'PRO TECK Admin',
      eventType: 'purchase_approved' as any,
      title: `إصدار طلب جديد (${type.toUpperCase()})`,
      description: `تم إضافة طلب جديد لـ ${customer.fullName} بقيمة ${payload.price || payload.totalProductPrice || 0} ج.م`,
      referenceNumber: defaultSequenceService.generateNextReference('purchase'),
      productTitle: payload.productTitle || payload.product?.title,
    };

    onUpdateCustomer({
      totalRequests: customer.totalRequests + 1,
      timeline: [newTimelineEvent, ...customer.timeline],
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Workspace Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-lg">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">{customer.fullName}</h2>
                <span className="font-mono text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {customer.id}
                </span>
                <select
                  value={customer.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="vip">★ VIP مميز</option>
                  <option value="active">نشط (Active)</option>
                  <option value="new">عميل جديد (New)</option>
                  <option value="returning">عائد لشراء مجدد</option>
                  <option value="blocked">محظور (Blocked)</option>
                </select>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {customer.address.cityArea} - {customer.address.governorate} | المتابعة مع:{' '}
                <strong className="text-slate-200">{customer.assignedAdmin || 'غير معين'}</strong>
              </p>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://wa.me/${customer.whatsappPhone}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </a>

            <a
              href={`tel:${customer.primaryPhone}`}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال هاتف</span>
            </a>

            <button
              onClick={() => setShowCreateRequestModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طلب جديد</span>
            </button>

            <button
              onClick={() => onSoftDeleteCustomer(customer)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
              title="أرشفة الملف"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Scrollable Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 overflow-x-auto flex items-center gap-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-3 font-extrabold text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Canvas */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
          {activeTab === 'overview' && (
            <OverviewTab
              customer={customer}
              onUpdateCustomer={onUpdateCustomer}
              onNavigateTab={(k) => setActiveTab(k)}
            />
          )}

          {activeTab === 'purchase_requests' && (
            <PurchaseRequestsTab
              customer={customer}
              requests={[]}
              onUpdateRequestStatus={() => {}}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsTab
              customer={customer}
              reservations={[]}
              onUpdateRequestStatus={() => {}}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'negotiations' && (

            <NegotiationsTab
              customer={customer}
              negotiations={[]}
              onUpdateRequestStatus={() => {}}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'sell_requests' && (
            <SellRequestsTab
              customer={customer}
              sellRequests={[]}
              onUpdateRequestStatus={() => {}}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'exchange_requests' && (
            <ExchangeRequestsTab
              customer={customer}
              exchangeRequests={[]}
              onUpdateRequestStatus={() => {}}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesTab
              customer={customer}
              onPreviewDocument={(doc) => setPreviewDoc(doc)}
              onCreateNewRequest={() => setShowCreateRequestModal(true)}
            />
          )}

          {activeTab === 'visited_products' && <VisitedProductsTab customer={customer} />}

          {activeTab === 'documents' && (
            <DocumentsTab customer={customer} onPreviewDocument={(doc) => setPreviewDoc(doc)} />
          )}

          {activeTab === 'communication_history' && (
            <CommunicationTab customer={customer} onAddLogEntry={handleAddLogEntry} />
          )}

          {activeTab === 'notes' && (
            <NotesTab
              customer={customer}
              onAddNote={handleAddNote}
              onTogglePinNote={handleTogglePinNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'timeline' && <TimelineTab customer={customer} />}

          {activeTab === 'ai_assistant' && (
            <AiAssistantTab
              customer={customer}
              onAddNoteFromAi={(txt) => handleAddNote(txt, false)}
            />
          )}
        </div>
      </div>

      {/* Sub Modals */}
      {previewDoc && (
        <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {showCreateRequestModal && (
        <CreateRequestModal
          customer={customer}
          onClose={() => setShowCreateRequestModal(false)}
          onCreate={handleCreateRequest}
        />
      )}
    </div>
  );
};
