import React, { useState, useEffect } from 'react';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import {
  Customer,
  CustomerDirectoryViewMode,
  CustomerFilterOptions,
  DuplicateMatchGroup,
} from '../../types/customerHub';
import {
  getStoredCustomers,
  saveCustomers,
  filterCustomers,
  findDuplicateCandidates,
  exportCustomersToCSV,
} from '../../utils/customerHubStorage';

// Sub Components
import { CustomerTable } from './customers/CustomerTable';
import { CustomerGrid } from './customers/CustomerGrid';
import { CustomerCompact } from './customers/CustomerCompact';
import { CustomerWorkspaceModal } from './customers/CustomerWorkspaceModal';
import { AddEditCustomerModal } from './customers/AddEditCustomerModal';
import { DuplicateDetectionModal } from './customers/DuplicateDetectionModal';

import {
  Users,
  Search,
  Filter,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  ListFilter,
  CopyCheck,
  Download,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [viewMode, setViewMode] = useState<CustomerDirectoryViewMode>('table');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [vipOnly, setVipOnly] = useState(false);
  const [hasPurchasesOnly, setHasPurchasesOnly] = useState(false);
  const [hasReservationsOnly, setHasReservationsOnly] = useState(false);
  const [archivedOnly, setArchivedOnly] = useState(false);

  // Modals
  const [workspaceCustomer, setWorkspaceCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateMatchGroup[] | null>(null);

  // Load Customers on Mount
  useEffect(() => {
    const loaded = getStoredCustomers();
    setCustomers(loaded);
  }, []);

  // Filter Logic
  const filterOptions: CustomerFilterOptions = {
    searchQuery,
    status: selectedStatus,
    area: selectedArea,
    vipOnly,
    hasPurchasesOnly,
    hasReservationsOnly,
    archivedOnly,
  };

  const filteredCustomers = filterCustomers(customers, filterOptions);

  // Duplicate Candidates
  const duplicatesCount = findDuplicateCandidates(customers).length;

  // Handlers
  const handleSaveCustomerList = (updatedList: Customer[]) => {
    setCustomers(updatedList);
    saveCustomers(updatedList);
  };

  const handleCreateCustomer = (data: Partial<Customer>) => {
    const newCust: Customer = {
      id: `CUST-${1000 + customers.length + 1}`,
      fullName: data.fullName || 'عميل جديد',
      primaryPhone: data.primaryPhone || BUSINESS_CONFIG.phone,
      whatsappPhone: data.whatsappPhone || BUSINESS_CONFIG.whatsappPhone,
      email: data.email || '',
      address: data.address || { governorate: 'القاهرة', cityArea: 'المعادي' },
      preferredContactMethod: data.preferredContactMethod || 'whatsapp',
      status: data.status || 'new',
      tags: data.tags || ['جديد'],
      firstContactDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
      totalRequests: 0,
      totalPurchases: 0,
      totalReservations: 0,
      totalSpent: 0,
      assignedAdmin: data.assignedAdmin || 'PRO TECK Admin',
      isArchived: false,
      notes: [],
      communicationLogs: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'النظام',
          eventType: 'customer_created',
          title: 'إنشاء ملف العميل',
          description: 'تم تسجيل بيانات العميل بنجاح في دليل المعرض.',
        },
      ],
      documents: [],
      visitedProducts: [],
    };

    const updated = [newCust, ...customers];
    handleSaveCustomerList(updated);
    setShowAddModal(false);
  };

  const handleUpdateCustomer = (customerData: Partial<Customer>) => {
    if (!editCustomer && !workspaceCustomer) return;
    const targetId = editCustomer?.id || workspaceCustomer?.id;

    const updated = customers.map((c) => {
      if (c.id === targetId) {
        const merged = { ...c, ...customerData, lastActivityDate: new Date().toISOString() };
        if (workspaceCustomer && workspaceCustomer.id === targetId) {
          setWorkspaceCustomer(merged);
        }
        return merged;
      }
      return c;
    });

    handleSaveCustomerList(updated);
    setEditCustomer(null);
  };

  const handleSoftDeleteCustomer = (cust: Customer) => {
    const updated = customers.map((c) =>
      c.id === cust.id ? { ...c, isArchived: !c.isArchived } : c
    );
    handleSaveCustomerList(updated);
    if (workspaceCustomer?.id === cust.id) {
      setWorkspaceCustomer(null);
    }
  };

  const handleMergeCustomers = (primaryId: string, secondaryId: string) => {
    const secondary = customers.find((c) => c.id === secondaryId);
    if (!secondary) return;

    const updated = customers.map((c) => {
      if (c.id === primaryId) {
        return {
          ...c,
          totalSpent: c.totalSpent + secondary.totalSpent,
          totalPurchases: c.totalPurchases + secondary.totalPurchases,
          totalReservations: c.totalReservations + secondary.totalReservations,
          totalRequests: c.totalRequests + secondary.totalRequests,
          notes: [...secondary.notes, ...c.notes],
          communicationLogs: [...secondary.communicationLogs, ...c.communicationLogs],
          timeline: [...secondary.timeline, ...c.timeline],
          documents: [...secondary.documents, ...c.documents],
        };
      }
      if (c.id === secondaryId) {
        return { ...c, isArchived: true };
      }
      return c;
    });

    handleSaveCustomerList(updated);
    setDuplicateGroups(findDuplicateCandidates(updated));
  };

  return (
    <div className="space-y-4 sm:space-y-6 dir-rtl text-xs text-slate-100 pb-12">
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
                <span>دليل إدارة العملاء والطلبات الموحد</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {filteredCustomers.length} عميل
                </span>
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5">
                المركز العملياتي الشامل للعملاء، الحجوزات، العرابين، والطلبات بالمعرض
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDuplicateGroups(findDuplicateCandidates(customers))}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer relative min-h-[40px]"
            >
              <CopyCheck className="w-4 h-4 text-amber-400" />
              <span>فحص الحسابات المكررة</span>
              {duplicatesCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute -top-1 -right-1" />
              )}
            </button>

            <button
              onClick={() => exportCustomersToCSV(filteredCustomers)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px]"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، الواتساب، كود العميل، أو مرجع الطلب..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">كل الحالات</option>
              <option value="vip">★ عميل مميز (VIP)</option>
              <option value="active">نشط (Active)</option>
              <option value="new">جديد (New)</option>
              <option value="returning">عائد لشراء مجدد</option>
              <option value="blocked">محظور (Blocked)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض جدول مفصل"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض بطاقات الشبكة"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'compact' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض مدمج سريع"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-4 text-[11px] pt-1 flex-wrap font-bold">
          <label className="flex items-center gap-1.5 text-amber-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vipOnly}
              onChange={(e) => setVipOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>عملاء VIP فقط</span>
          </label>

          <label className="flex items-center gap-1.5 text-emerald-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPurchasesOnly}
              onChange={(e) => setHasPurchasesOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span>أصحاب صفقات شراء مكتملة</span>
          </label>

          <label className="flex items-center gap-1.5 text-blue-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReservationsOnly}
              onChange={(e) => setHasReservationsOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
            />
            <span>أصحاب حجوزات سارية</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 cursor-pointer mr-auto">
            <input
              type="checkbox"
              checked={archivedOnly}
              onChange={(e) => setArchivedOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0 cursor-pointer"
            />
            <span>عرض سلة الأرشيف (Soft Delete)</span>
          </label>
        </div>
      </div>

      {/* Directory Content Rendering */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-extrabold text-white text-sm">لم يتم العثور على أي عملاء مطابقين للبحث</h3>
          <p className="text-slate-500 text-[11px]">تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح</p>
        </div>
      ) : viewMode === 'table' ? (
        <CustomerTable
          customers={filteredCustomers}
          onOpenWorkspace={(c) => setWorkspaceCustomer(c)}
          onEditCustomer={(c) => setEditCustomer(c)}
          onSoftDeleteCustomer={handleSoftDeleteCustomer}
        />
      ) : viewMode === 'grid' ? (
        <CustomerGrid
          customers={filteredCustomers}
          onOpenWorkspace={(c) => setWorkspaceCustomer(c)}
          onEditCustomer={(c) => setEditCustomer(c)}
        />
      ) : (
        <CustomerCompact
          customers={filteredCustomers}
          onOpenWorkspace={(c) => setWorkspaceCustomer(c)}
          onEditCustomer={(c) => setEditCustomer(c)}
        />
      )}

      {/* Customer Workspace Modal */}
      {workspaceCustomer && (
        <CustomerWorkspaceModal
          customer={workspaceCustomer}
          onClose={() => setWorkspaceCustomer(null)}
          onUpdateCustomer={handleUpdateCustomer}
          onSoftDeleteCustomer={handleSoftDeleteCustomer}
        />
      )}

      {/* Add / Edit Customer Modal */}
      {(showAddModal || editCustomer) && (
        <AddEditCustomerModal
          customer={editCustomer}
          onClose={() => {
            setShowAddModal(false);
            setEditCustomer(null);
          }}
          onSave={(data) => {
            if (editCustomer) {
              handleUpdateCustomer(data);
            } else {
              handleCreateCustomer(data);
            }
          }}
        />
      )}

      {/* Duplicate Detection Modal */}
      {duplicateGroups && (
        <DuplicateDetectionModal
          duplicateGroups={duplicateGroups}
          onClose={() => setDuplicateGroups(null)}
          onMergeCustomers={handleMergeCustomers}
        />
      )}
    </div>
  );
};
