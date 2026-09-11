import React from 'react';
import { Customer } from '../../../../types/customerHub';
import { CustomerDocument } from '../../../../types/customerHub';
import { FileText, Printer, Download, Eye, CheckCircle, Plus } from 'lucide-react';

interface InvoicesTabProps {
  customer: Customer;
  onPreviewDocument: (doc: CustomerDocument) => void;
  onCreateNewRequest: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  customer,
  onPreviewDocument,
  onCreateNewRequest,
}) => {
  const invoices = customer.documents.filter((d) => d.type === 'invoice');

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>فواتير العميل المعتمدة بالمعرض ({invoices.length})</span>
          </h3>
          <p className="text-slate-400 text-[11px] mt-0.5">
            فواتير مبيعات الأجهزة المرفقة بشهادات الضمان والشروط القانونية
          </p>
        </div>

        <button
          onClick={onCreateNewRequest}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إصدار فاتورة جديدة</span>
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد فواتير صادرة لـ {customer.fullName} حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 dir-ltr">
                    {inv.documentNumber}
                  </span>
                  <span className="text-slate-400 text-[11px]">تاريخ الإصدار: {inv.issueDate}</span>
                </div>
                <h4 className="font-extrabold text-sm text-white">{inv.productTitle}</h4>
                <p className="text-slate-400 text-[11px]">
                  القيمة الإجمالية:{' '}
                  <span className="text-emerald-400 font-extrabold">
                    {inv.productPrice.toLocaleString('ar-EG')} ج.م
                  </span>{' '}
                  | الحالة: <span className="text-emerald-300 font-bold">{inv.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreviewDocument(inv)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>معاينة الفاتورة</span>
                </button>
                <button
                  onClick={() => onPreviewDocument(inv)}
                  className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold border border-blue-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة / PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
