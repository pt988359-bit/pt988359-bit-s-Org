import React from 'react';
import { CustomerDocument } from '../../../types/customerHub';
import { BUSINESS_CONFIG } from '../../../config/businessConfig';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: CustomerDocument;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">{document.title}</h2>
              <p className="text-slate-400 text-[11px]">
                رقم المستند: <span className="font-mono text-emerald-400">{document.documentNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / تصدير PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0">
          {/* Company Branding Header */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">{BUSINESS_CONFIG.name}</h1>
              <p className="text-xs text-slate-600 font-bold mt-0.5">
                {BUSINESS_CONFIG.brandTagline} - {BUSINESS_CONFIG.address.area} {BUSINESS_CONFIG.address.street}
              </p>
              <p className="text-[11px] text-slate-500">هاتف: <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{BUSINESS_CONFIG.formattedPhone}</span> | {BUSINESS_CONFIG.address.governorate}</p>
            </div>
            <div className="text-left">
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-900 font-black text-xs block">
                {document.type === 'invoice'
                  ? 'فاتورة مبيعات معتمدة'
                  : 'مستند رسمي'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                رقم: {document.documentNumber}
              </p>
              <p className="text-[11px] text-slate-500">التاريخ: {document.issueDate}</p>
            </div>
          </div>

          {/* Customer & Document Information */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block font-bold">اسم العميل بالكامل:</span>
              <p className="font-extrabold text-slate-900 text-sm">{document.customerName}</p>
              <p className="text-slate-600 font-mono mt-0.5"><span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{document.customerPhone}</span></p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-bold">المرجع والتفاصيل:</span>
              <p className="font-bold text-slate-900">{document.referenceNumber}</p>
              <p className="text-emerald-700 font-bold mt-0.5">حالة المستند: {document.status}</p>
            </div>
          </div>

          {/* Product Details Table */}
          <table className="w-full text-right border-collapse text-xs my-4">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-3">بيان الجهاز / المنتج</th>
                <th className="p-3 text-center">سعر الجهاز</th>
                {document.remainingAmount !== undefined && <th className="p-3 text-center">المتبقي</th>}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 font-bold text-slate-900">
                <td className="p-3">{document.productTitle}</td>
                <td className="p-3 text-center">{document.productPrice.toLocaleString('ar-EG')} ج.م</td>
                {document.remainingAmount !== undefined && (
                  <td className="p-3 text-center text-amber-600">
                    {document.remainingAmount.toLocaleString('ar-EG')} ج.م
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          {/* Terms & Conditions */}
          {document.termsAndConditions && document.termsAndConditions.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
              <h4 className="font-extrabold text-slate-900 text-xs">الشروط والأحكام المعتمدة:</h4>
              <ul className="list-disc list-inside space-y-1">
                {document.termsAndConditions.map((term, tIdx) => (
                  <li key={tIdx}>{term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-center text-xs font-bold text-slate-800">
            <div>
              <p>توقيع وختم المعرض:</p>
              <p className="text-slate-500 font-normal mt-6">معرض PRO TECK المعادي</p>
            </div>
            <div>
              <p>توقيع العميل بالتسليم:</p>
              <p className="text-slate-500 font-normal mt-6">{document.customerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
