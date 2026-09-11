/**
 * Enterprise CSV Exporter Utility
 * TASK-010 PART 9: CSV Export for Products, Sales, Expenses, Customers, Requests, Finance
 */

import { EnrichedProduct } from '../types/productStudio';
import { ExpenseItem } from '../types/adminFinance';
import { UnifiedCustomerRequest } from '../core/repositories/RequestRepository';
import { Customer } from '../types';

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const CSVExporter = {
  exportProducts(products: EnrichedProduct[]) {
    const headers = [
      'ID/Internal Code',
      'Title',
      'Brand',
      'Category',
      'Condition',
      'Status',
      'Selling Price',
      'Purchase Cost',
      'Transportation Cost',
      'Maintenance Cost',
      'Cleaning Cost',
      'Total Cost',
      'Expected Profit',
      'Is Archived',
      'Archive Reason',
      'Created At',
    ];

    const rows = products.map((p) => [
      p.internalCode || p.id,
      p.title,
      p.brand,
      p.categoryId,
      p.condition,
      p.status,
      p.price,
      p.purchaseHistory?.purchaseCost ?? p.pricingBreakdown?.purchaseCost ?? 0,
      p.purchaseHistory?.transportationCost ?? p.pricingBreakdown?.transportationCost ?? 0,
      p.purchaseHistory?.maintenanceCost ?? p.pricingBreakdown?.repairCost ?? 0,
      p.purchaseHistory?.cleaningCost ?? p.pricingBreakdown?.cleaningCost ?? 0,
      p.purchaseHistory?.totalCost ?? p.pricingBreakdown?.totalCost ?? 0,
      p.pricingBreakdown?.expectedProfit ?? 0,
      p.isArchived ? 'Yes' : 'No',
      p.archiveReason || '',
      p.createdAt,
    ]);

    downloadCSV(`PRO_TECK_Products_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },

  exportSales(salesOrProducts: EnrichedProduct[]) {
    const headers = [
      'Product Code',
      'Product Title',
      'Buyer Name',
      'Buyer Phone',
      'Sale Date',
      'Sale Price',
      'Total Cost',
      'Profit',
      'Invoice Number',
      'Payment Method',
      'Reservation Ref',
      'Admin Notes',
    ];

    const soldProducts = salesOrProducts.filter((p) => p.saleRecord || p.status === 'sold' || p.lifecycleStage === 'sold');
    const rows = soldProducts.map((p) => [
      p.internalCode || p.id,
      p.title,
      p.saleRecord?.buyerName || 'عميل معرض المعادي',
      p.saleRecord?.buyerPhone || '-',
      p.saleRecord?.saleDate || p.updatedAt || p.createdAt,
      p.saleRecord?.salePrice ?? p.price,
      p.saleRecord?.totalCost ?? p.pricingBreakdown?.totalCost ?? 0,
      p.saleRecord?.profit ?? ((p.saleRecord?.salePrice ?? p.price) - (p.pricingBreakdown?.totalCost ?? 0)),
      p.saleRecord?.invoiceNumber || `INV-${p.id.slice(0, 8)}`,
      p.saleRecord?.paymentMethod || 'cash',
      p.saleRecord?.reservationReference || '-',
      p.saleRecord?.adminNotes || '',
    ]);

    downloadCSV(`PRO_TECK_Sales_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },

  exportExpenses(expenses: ExpenseItem[]) {
    const headers = [
      'Reference Number',
      'Category',
      'Category (Ar)',
      'Amount',
      'Description',
      'Date',
      'Supplier',
      'Created By',
      'Notes',
    ];

    const rows = expenses.map((e) => [
      e.referenceNumber || e.id,
      e.category,
      e.categoryLabelAr || e.category,
      e.amount,
      e.description,
      e.date,
      e.supplierName || '-',
      e.createdBy || 'Admin',
      e.notes || '',
    ]);

    downloadCSV(`PRO_TECK_Expenses_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },

  exportCustomers(customers: Customer[]) {
    const headers = ['ID', 'Customer Name', 'Phone', 'Email', 'City/Area', 'Address', 'Total Orders', 'Notes', 'Created At'];

    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email || '-',
      c.city || '-',
      c.address || '-',
      c.totalOrders || 0,
      c.notes || '',
      c.createdAt,
    ]);

    downloadCSV(`PRO_TECK_Customers_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },

  exportRequests(requests: UnifiedCustomerRequest[]) {
    const headers = [
      'Reference Number',
      'Type',
      'Customer Name',
      'Customer Phone',
      'Product Title',
      'Product Price',
      'Status',
      'Created At',
      'Notes',
    ];

    const rows = requests.map((r) => [
      r.referenceNumber,
      r.type,
      r.customer.fullName,
      r.customer.phone,
      r.productTitle || '-',
      r.productPrice || 0,
      r.status,
      r.createdAt,
      r.internalNotes || '',
    ]);

    downloadCSV(`PRO_TECK_Requests_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },

  exportFinanceSummary(metrics: {
    todaySales: number;
    monthlySales: number;
    todayProfit: number;
    monthlyProfit: number;
    outstandingExpenses: number;
    netProfit: number;
  }) {
    const headers = ['Metric', 'Amount (EGP)', 'Date Generated'];
    const rows = [
      ['Today Sales (مبيعات اليوم)', metrics.todaySales, new Date().toLocaleString('ar-EG')],
      ['Monthly Sales (مبيعات الشهر)', metrics.monthlySales, new Date().toLocaleString('ar-EG')],
      ['Today Profit (أرباح اليوم)', metrics.todayProfit, new Date().toLocaleString('ar-EG')],
      ['Monthly Profit (أرباح الشهر)', metrics.monthlyProfit, new Date().toLocaleString('ar-EG')],
      ['Outstanding Expenses (المصروفات المستحقة)', metrics.outstandingExpenses, new Date().toLocaleString('ar-EG')],
      ['Net Profit (صافي الربح النهائي)', metrics.netProfit, new Date().toLocaleString('ar-EG')],
    ];

    downloadCSV(`PRO_TECK_Finance_Summary_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  },
};
