import React from 'react';
import { Customer, CustomerDocument } from '../../../../types/customerHub';
import { FileCheck, Printer, Eye, Download, ShieldCheck, FileText } from 'lucide-react';

interface DocumentsTabProps {
  customer: Customer;
  onPreviewDocument: (doc: CustomerDocument) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ customer, onPreviewDocument }) => {
  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>المستندات وإيصالات العميل الصادرة ({customer.documents.length})</span>
        </h3>
        <p className="text-slate-400 text-[11px] mt-0.5">
          الفواتير، وشهادات الضمان المستقبلية المعتمدة
        </p>
      </div>

      {customer.documents.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد مستندات صادرة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customer.documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 dir-ltr">
                    {doc.documentNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                    {doc.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white">{doc.title}</h4>
                <p className="text-slate-400 text-[11px]">
                  المرجع: <strong className="text-slate-200">{doc.referenceNumber}</strong> | التاريخ:{' '}
                  {doc.issueDate}
                </p>
                <p className="text-slate-300 text-[11px] font-bold">
                  الجهاز: {doc.productTitle} ({doc.productPrice.toLocaleString('ar-EG')} ج.م)
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => onPreviewDocument(doc)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>معاينة المستند</span>
                </button>
                <button
                  onClick={() => onPreviewDocument(doc)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Printer className="w-3.5 h-3.5" />
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
