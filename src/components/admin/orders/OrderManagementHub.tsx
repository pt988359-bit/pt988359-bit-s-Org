import React, { useState, useEffect } from 'react';
import {
  OrderWorkspaceModule,
  OrderDisplayMode,
  PurchaseRequest,
  NegotiationItem,
  InquiryItem,
  CompletedSaleItem,
  OrderAuditLogEntry,
} from '../../../types/orderManagementCenter';
import {
  getAuditLogs,
  logOrderAudit,
  exportOrderModuleToCSV,
} from '../../../utils/orderManagementStorage';
import {
  defaultRequestRepository,
  UnifiedCustomerRequest,
  RequestStatus,
} from '../../../core/repositories/RequestRepository';
import {
  mapUnifiedToLegacy,
  mapUnifiedToNegotiation,
  mapUnifiedToInquiry,
  mapUnifiedToCompletedSale,
  mapLegacyStatusToUnified,
} from '../../../core/adapters/unifiedRequestAdapter';
import { useShowroom } from '../../../context/ShowroomContext';

import { OrderModuleTabs } from './OrderModuleTabs';
import { defaultSequenceService } from '../../../core/services/SequenceService';
import { IdGenerator } from '../../../core/services/IdGenerator';
import { PurchaseRequestsWorkspace } from './PurchaseRequestsWorkspace';
import { NegotiationsWorkspace } from './NegotiationsWorkspace';

import { InquiriesWorkspace } from './InquiriesWorkspace';
import { CompletedSalesWorkspace } from './CompletedSalesWorkspace';
import { CancelledArchivedWorkspace } from './CancelledArchivedWorkspace';
import { AuditLogWorkspace } from './AuditLogWorkspace';
import { OrderKanbanView } from './OrderKanbanView';
import { OrderCalendarView } from './OrderCalendarView';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderAiAssistantModal } from './OrderAiAssistantModal';

import { CreateOrderModal } from './CreateOrderModal';
import { BulkOperationsBar } from './BulkOperationsBar';

import { UnifiedRequestsWorkspace } from './UnifiedRequestsWorkspace';

export const OrderManagementHub: React.FC = () => {
  const { products } = useShowroom();

  // Main Navigation & Display States
  const [activeModule, setActiveModule] = useState<OrderWorkspaceModule>('unified_requests');
  const [displayMode, setDisplayMode] = useState<OrderDisplayMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Raw Unified Requests & Derived Data States
  const [rawRequests, setRawRequests] = useState<UnifiedCustomerRequest[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [completedSales, setCompletedSales] = useState<CompletedSaleItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<OrderAuditLogEntry[]>([]);

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOrderModal, setActiveOrderModal] = useState<{ item: any; type: string } | null>(null);
  const [activeAiModal, setActiveAiModal] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derive legacy workspace data from unified requests
  const updateStatesFromRequests = (items: UnifiedCustomerRequest[], prods = products) => {
    setRawRequests(items);
    setPurchaseRequests(items.filter((item) => item.type === 'purchase').map((item) => mapUnifiedToLegacy(item, prods)));
    setNegotiations(items.filter((item) => item.type === 'negotiation').map((item) => mapUnifiedToNegotiation(item, prods)));
    setInquiries(items.filter((item) => item.type === 'inquiry').map((item) => mapUnifiedToInquiry(item, prods)));
    setCompletedSales(items.filter((item) => item.status === 'completed').map((item) => mapUnifiedToCompletedSale(item, prods)));
  };

  // Re-derive when products list updates
  useEffect(() => {
    if (rawRequests.length > 0) {
      updateStatesFromRequests(rawRequests, products);
    }
  }, [products]);

  // Load Initial Data & Subscribe in Real Time
  useEffect(() => {
    // 1. Initial cached load
    const cachedItems = defaultRequestRepository.getAll();
    updateStatesFromRequests(cachedItems);
    setAuditLogs(getAuditLogs());

    // 2. Real-time subscription to customer_requests collection
    const unsubscribe = defaultRequestRepository.subscribe((liveItems) => {
      if (Array.isArray(liveItems)) {
        updateStatesFromRequests(liveItems);
      }
    });

    // 3. Proactive initial remote fetch from Firestore
    defaultRequestRepository
      .fetchLive()
      .then((liveItems) => {
        if (Array.isArray(liveItems) && liveItems.length > 0) {
          updateStatesFromRequests(liveItems);
        }
      })
      .catch(() => {});

    return () => {
      unsubscribe();
    };
  }, []);

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (items: any[]) => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  // Status Updates with Unified Repository Persistence & Audit Logging
  const handleUpdateStatus = (id: string, newStatus: string) => {
    const target = rawRequests.find((r) => r.id === id) || defaultRequestRepository.getById(id);
    if (target) {
      const unifiedStatus = mapLegacyStatusToUnified(newStatus);
      const updated: UnifiedCustomerRequest = {
        ...target,
        status: unifiedStatus,
        updatedAt: new Date().toISOString(),
      };
      defaultRequestRepository.save(updated);
      logOrderAudit('PRO TECK Admin', target.referenceNumber, target.status, unifiedStatus, 'تغيير الحالة التشغيلية من لوحة الإدارة');
      setAuditLogs(getAuditLogs());
    }
  };

  // Negotiation Handlers
  const handleUpdateNegotiation = (
    item: NegotiationItem,
    decision: 'accepted' | 'counter_offered' | 'declined',
    adminNote: string,
    counterAmount?: number
  ) => {
    const target = rawRequests.find((r) => r.id === item.id) || defaultRequestRepository.getById(item.id);
    if (target) {
      let unifiedStatus: RequestStatus = 'waiting_customer';
      if (decision === 'accepted') unifiedStatus = 'approved';
      else if (decision === 'declined') unifiedStatus = 'rejected';
      else if (decision === 'counter_offered') unifiedStatus = 'waiting_customer';

      const updated: UnifiedCustomerRequest = {
        ...target,
        status: unifiedStatus,
        adminNotes: adminNote || target.adminNotes,
        finalPrice: counterAmount ?? target.finalPrice,
        details: {
          ...(target.details || {}),
          negotiationDecision: decision,
          counterAmount: counterAmount ?? target.details?.counterAmount,
          lastAdminNote: adminNote,
        },
        updatedAt: new Date().toISOString(),
      };
      defaultRequestRepository.save(updated);
      logOrderAudit('PRO TECK Admin', target.referenceNumber, target.status, unifiedStatus, adminNote || `تحديث التفاوض: ${decision}`);
      setAuditLogs(getAuditLogs());
    }
  };

  // Inquiry Answer Handler
  const handleAnswerInquiry = (id: string, response: string) => {
    const target = rawRequests.find((r) => r.id === id) || defaultRequestRepository.getById(id);
    if (target) {
      const updated: UnifiedCustomerRequest = {
        ...target,
        status: 'contacted',
        adminNotes: response,
        details: {
          ...(target.details || {}),
          adminResponse: response,
          answeredAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      defaultRequestRepository.save(updated);
      logOrderAudit('PRO TECK Admin', target.referenceNumber, target.status, 'contacted', `الرد على الاستفسار: ${response}`);
      setAuditLogs(getAuditLogs());
    }
  };

  // Create New Request
  const handleCreateRequest = (newReq: Partial<PurchaseRequest>) => {
    const created = defaultRequestRepository.createRequest({
      referenceNumber: newReq.referenceNumber || `PUR-${Date.now().toString().slice(-6)}`,
      type: 'purchase',
      customer: {
        fullName: newReq.customerName || 'عميل جديد',
        phone: newReq.customerPhone || '',
        whatsappPhone: newReq.customerWhatsapp || newReq.customerPhone || '',
      },
      productId: newReq.productCode,
      productTitle: newReq.productTitle,
      productPrice: newReq.productPrice,
      productImage: '',
      status: 'new',
      priority: newReq.priority === 'high' ? 'high' : 'medium',
      adminNotes: newReq.notes,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending_approval',
          note: 'إنشاء طلب شراء جديد يدوياً بواسطة الأدمن',
          actor: 'PRO TECK Admin',
        },
      ],
    });
    logOrderAudit('PRO TECK Admin', created.referenceNumber, 'new', 'new', 'إنشاء طلب شراء جديد يدوياً');
    setAuditLogs(getAuditLogs());
  };

  // Export CSV
  const handleExport = () => {
    let dataToExport: any[] = [];
    if (activeModule === 'purchase_requests') dataToExport = purchaseRequests;
    else if (activeModule === 'negotiations') dataToExport = negotiations;

    else if (activeModule === 'inquiries') dataToExport = inquiries;
    else if (activeModule === 'completed_sales') dataToExport = completedSales;
    else if (activeModule === 'audit_log') dataToExport = auditLogs;

    exportOrderModuleToCSV(`PRO_TECK_${activeModule}`, dataToExport);
  };

  // Filter Helper
  const filterBySearchAndPriority = (items: any[]) => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q)) ||
        (item.reservationNumber && item.reservationNumber.toLowerCase().includes(q)) ||
        (item.orderNumber && item.orderNumber.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.customerPhone && item.customerPhone.includes(q)) ||
        (item.productTitle && item.productTitle.toLowerCase().includes(q));

      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  };

  const filteredRequests = filterBySearchAndPriority(
    purchaseRequests.filter((p) => p.status !== 'archived' && p.status !== 'rejected')
  );
  const filteredNegotiations = filterBySearchAndPriority(negotiations);
  const filteredInquiries = filterBySearchAndPriority(inquiries);
  const filteredCompletedSales = filterBySearchAndPriority(completedSales);
  const filteredCancelled = purchaseRequests.filter((p) => p.status === 'rejected');
  const filteredArchived = purchaseRequests.filter((p) => p.status === 'archived');

  return (
    <div className="flex flex-col gap-6 pb-24 dir-rtl text-xs font-sans">
      {/* Top Workspace Header Controls */}
      <OrderModuleTabs
        activeModule={activeModule}
        onChangeModule={setActiveModule}
        displayMode={displayMode}
        onChangeDisplayMode={setDisplayMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        counts={{
          purchase_requests: filteredRequests.length,
          negotiations: filteredNegotiations.length,
          inquiries: filteredInquiries.length,
          completed_sales: filteredCompletedSales.length,
          cancelled: filteredCancelled.length,
          archived: filteredArchived.length,
          audit_log: auditLogs.length,
        }}

        onExport={handleExport}
        onCreateNewRequest={() => setIsCreateModalOpen(true)}
      />

      {/* Render Selected View Mode or Module */}
      {displayMode === 'kanban' ? (
        <OrderKanbanView
          purchaseRequests={filteredRequests}
          onSelectOrder={(item, type) => setActiveOrderModal({ item, type })}
          onMoveStatus={handleUpdateStatus}
        />
      ) : displayMode === 'calendar' ? (
        <OrderCalendarView
          purchaseRequests={filteredRequests}
          onSelectOrder={(item, type) => setActiveOrderModal({ item, type })}
        />
      ) : (
        <>
          {activeModule === 'unified_requests' && (
            <UnifiedRequestsWorkspace />
          )}

          {activeModule === 'purchase_requests' && (
            <PurchaseRequestsWorkspace
              requests={filteredRequests}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => handleSelectAll(filteredRequests)}
              onSelectOrder={(item) => setActiveOrderModal({ item, type: 'request' })}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeModule === 'inquiries' && (
            <InquiriesWorkspace
              inquiries={filteredInquiries}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => handleSelectAll(filteredInquiries)}
              onAnswerInquiry={handleAnswerInquiry}
            />
          )}

          {activeModule === 'completed_sales' && (
            <CompletedSalesWorkspace
              sales={filteredCompletedSales}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => handleSelectAll(filteredCompletedSales)}
            />
          )}

          {activeModule === 'cancelled' && (
            <CancelledArchivedWorkspace
              items={filteredCancelled}
              onRestore={(id) => handleUpdateStatus(id, 'new')}
              onPurge={(id) => defaultRequestRepository.delete(id)}
            />
          )}

          {activeModule === 'archived' && (
            <CancelledArchivedWorkspace
              items={filteredArchived}
              isArchivedView
              onRestore={(id) => handleUpdateStatus(id, 'new')}
              onPurge={(id) => defaultRequestRepository.delete(id)}
            />
          )}

          {activeModule === 'audit_log' && <AuditLogWorkspace auditLogs={auditLogs} />}
        </>
      )}

      {/* Floating Bulk Operations Toolbar */}
      <BulkOperationsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkApprove={() => {
          selectedIds.forEach((id) => handleUpdateStatus(id, 'approved'));
          setSelectedIds([]);
        }}
        onBulkArchive={() => {
          selectedIds.forEach((id) => handleUpdateStatus(id, 'archived'));
          setSelectedIds([]);
        }}
        onBulkAssignAdmin={() => setSelectedIds([])}
        onBulkExport={handleExport}
        onBulkPrint={() => window.print()}
        onBulkDelete={() => {
          selectedIds.forEach((id) => defaultRequestRepository.delete(id));
          setSelectedIds([]);
        }}
      />

      {/* 360 Order Workspace Details Modal */}
      {activeOrderModal && (
        <OrderDetailsModal
          item={activeOrderModal.item}
          itemType={activeOrderModal.type as any}
          onClose={() => setActiveOrderModal(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenAiAssistant={(item) => {
            setActiveAiModal(item);
          }}
        />
      )}

      {/* AI Assistant Modal */}

      {activeAiModal && (
        <OrderAiAssistantModal
          orderData={{
            referenceNumber: activeAiModal.referenceNumber || activeAiModal.reservationNumber || 'REF-AI',
            customerName: activeAiModal.customerName,
            customerPhone: activeAiModal.customerPhone,
            productTitle: activeAiModal.productTitle,
            productPrice: activeAiModal.productPrice || activeAiModal.finalPrice || 0,
            status: activeAiModal.status,
            notes: activeAiModal.notes,
          }}
          onClose={() => setActiveAiModal(null)}
        />
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <CreateOrderModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateRequest}
        />
      )}
    </div>
  );
};
