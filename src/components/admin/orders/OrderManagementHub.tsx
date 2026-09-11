import React, { useState, useEffect } from 'react';
import {
  OrderWorkspaceModule,
  OrderDisplayMode,
  PurchaseRequest,
  ReservationItem,
  NegotiationItem,
  InquiryItem,
  CompletedSaleItem,
  OrderAuditLogEntry,
} from '../../../types/orderManagementCenter';
import {
  getPurchaseRequests,
  savePurchaseRequests,
  getReservations,
  saveReservations,
  getNegotiations,
  saveNegotiations,
  getInquiries,
  saveInquiries,
  getCompletedSales,
  saveCompletedSales,
  getAuditLogs,
  logOrderAudit,
  exportOrderModuleToCSV,
} from '../../../utils/orderManagementStorage';


import { OrderModuleTabs } from './OrderModuleTabs';
import { defaultSequenceService } from '../../../core/services/SequenceService';
import { IdGenerator } from '../../../core/services/IdGenerator';
import { PurchaseRequestsWorkspace } from './PurchaseRequestsWorkspace';
import { ReservationsWorkspace } from './ReservationsWorkspace';
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
  // Main Navigation & Display States
  const [activeModule, setActiveModule] = useState<OrderWorkspaceModule>('unified_requests');
  const [displayMode, setDisplayMode] = useState<OrderDisplayMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Data States
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [completedSales, setCompletedSales] = useState<CompletedSaleItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<OrderAuditLogEntry[]>([]);

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOrderModal, setActiveOrderModal] = useState<{ item: any; type: string } | null>(null);
  const [activeAiModal, setActiveAiModal] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load Initial Data
  useEffect(() => {
    setPurchaseRequests(getPurchaseRequests());
    setReservations(getReservations());
    setNegotiations(getNegotiations());
    setInquiries(getInquiries());
    setCompletedSales(getCompletedSales());
    setAuditLogs(getAuditLogs());
  }, []);

  // Sync to Storage on Changes
  useEffect(() => {
    if (purchaseRequests.length) savePurchaseRequests(purchaseRequests);
  }, [purchaseRequests]);

  useEffect(() => {
    if (reservations.length) saveReservations(reservations);
  }, [reservations]);


  useEffect(() => {
    if (negotiations.length) saveNegotiations(negotiations);
  }, [negotiations]);

  useEffect(() => {
    if (inquiries.length) saveInquiries(inquiries);
  }, [inquiries]);

  useEffect(() => {
    if (completedSales.length) saveCompletedSales(completedSales);
  }, [completedSales]);

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

  // Status Updates with Audit Logging
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setPurchaseRequests((prev) =>
      prev.map((pr) => {
        if (pr.id === id) {
          logOrderAudit('PRO TECK Admin', pr.referenceNumber, pr.status, newStatus, 'تغيير يدوي للحالة التشغيلية');
          return { ...pr, status: newStatus as any };
        }
        return pr;
      })
    );
    setAuditLogs(getAuditLogs());
  };

  // Convert Purchase Request -> Reservation
  const handleConvertToReservation = (request: PurchaseRequest) => {
    const newResNumber = defaultSequenceService.generateNextReference('reservation');
    const newReservation: ReservationItem = {
      id: IdGenerator.generateUniqueId('res'),
      reservationNumber: newResNumber,
      productTitle: request.productTitle,
      productPrice: request.productPrice,
      productImage: request.productImage,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      reservationType: 'online_hold',
      durationHours: 24,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
      remainingBalance: request.productPrice,
      status: 'pending',

      assignedAdmin: request.assignedAdmin || 'PRO TECK Admin',
      autoReleaseEnabled: true,
      timeline: [
        {
          id: IdGenerator.generateUniqueId('rtl'),
          timestamp: new Date().toISOString(),
          eventType: 'reservation_started',
          title: 'تحويل طلب الشراء إلى حجز عربون',
          description: `تم تحويل الطلب ${request.referenceNumber} إلى حجز برقم ${newResNumber}`,
          actor: 'PRO TECK Admin',
        },
      ],
    };

    setReservations((prev) => [newReservation, ...prev]);
    handleUpdateStatus(request.id, 'converted_to_reservation');
  };

  // Convert Reservation -> Completed Sale
  const handleConvertToSale = (item: any) => {
    const newOrderNumber = defaultSequenceService.generateNextReference('order');
    const newSale: CompletedSaleItem = {
      id: IdGenerator.generateUniqueId('sale'),
      orderNumber: newOrderNumber,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      productTitle: item.productTitle,
      productImage: item.productImage || '',
      finalPrice: item.productPrice || item.finalPrice || 0,
      paymentMethod: 'cash',
      invoiceNumber: defaultSequenceService.generateNextReference('invoice'),

      completionDate: new Date().toISOString(),
      deliveryType: 'showroom_pickup',
      assignedAdmin: item.assignedAdmin || 'PRO TECK Admin',
    };

    setCompletedSales((prev) => [newSale, ...prev]);
    logOrderAudit(
      'PRO TECK Admin',
      item.referenceNumber || item.reservationNumber,
      item.status,
      'completed',
      `تم إتمام عملية البيع وإصدار الفاتورة (${newSale.invoiceNumber})`
    );
    setAuditLogs(getAuditLogs());
  };

  // Negotiation Handlers

  const handleUpdateNegotiation = (
    item: NegotiationItem,
    decision: 'accepted' | 'counter_offered' | 'declined',
    adminNote: string,
    counterAmount?: number
  ) => {
    setNegotiations((prev) =>
      prev.map((n) => {
        if (n.id === item.id) {
          return {
            ...n,
            status: decision,
            adminNotes: adminNote,
            suggestedPrice: counterAmount || n.suggestedPrice,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      })
    );
    logOrderAudit('PRO TECK Admin', item.referenceNumber, item.status, decision, adminNote);
    setAuditLogs(getAuditLogs());
  };

  // Inquiry Answer Handler
  const handleAnswerInquiry = (id: string, response: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, adminResponse: response, status: 'answered' } : inq))
    );
  };

  // Auto Release Toggle
  const handleToggleAutoRelease = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, autoReleaseEnabled: !r.autoReleaseEnabled } : r))
    );
  };

  // Create New Request
  const handleCreateRequest = (newReq: Partial<PurchaseRequest>) => {
    setPurchaseRequests((prev) => [newReq as PurchaseRequest, ...prev]);
    logOrderAudit('PRO TECK Admin', newReq.referenceNumber!, 'new', 'new', 'إنشاء طلب شراء جديد يدوياً');
    setAuditLogs(getAuditLogs());
  };

  // Export CSV
  const handleExport = () => {
    let dataToExport: any[] = [];
    if (activeModule === 'purchase_requests') dataToExport = purchaseRequests;
    else if (activeModule === 'reservations') dataToExport = reservations;
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
  const filteredReservations = filterBySearchAndPriority(reservations);
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
          reservations: filteredReservations.length,
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
          reservations={filteredReservations}
          onSelectOrder={(item, type) => setActiveOrderModal({ item, type })}
          onMoveStatus={handleUpdateStatus}
        />
      ) : displayMode === 'calendar' ? (
        <OrderCalendarView
          reservations={filteredReservations}
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
              onConvertToReservation={handleConvertToReservation}
            />
          )}

          {activeModule === 'reservations' && (
            <ReservationsWorkspace
              reservations={filteredReservations}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => handleSelectAll(filteredReservations)}
              onSelectReservation={(item) => setActiveOrderModal({ item, type: 'reservation' })}
              onUpdateStatus={handleUpdateStatus}
              onToggleAutoRelease={handleToggleAutoRelease}
              onConvertToSale={handleConvertToSale}
            />
          )}

          {activeModule === 'negotiations' && (

            <NegotiationsWorkspace
              negotiations={filteredNegotiations}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={() => handleSelectAll(filteredNegotiations)}
              onUpdateNegotiation={handleUpdateNegotiation}
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
              onPurge={(id) => setPurchaseRequests((prev) => prev.filter((p) => p.id !== id))}
            />
          )}

          {activeModule === 'archived' && (
            <CancelledArchivedWorkspace
              items={filteredArchived}
              isArchivedView
              onRestore={(id) => handleUpdateStatus(id, 'new')}
              onPurge={(id) => setPurchaseRequests((prev) => prev.filter((p) => p.id !== id))}
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
          setPurchaseRequests((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
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
          onConvertToReservation={handleConvertToReservation}
          onConvertToSale={handleConvertToSale}
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
