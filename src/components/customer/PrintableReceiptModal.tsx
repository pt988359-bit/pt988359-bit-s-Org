import React from 'react';
import { CustomerDocument } from '../../types/customerActions';
import { useShowroom } from '../../context/ShowroomContext';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import { Button } from '../ui/Button';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  Store,
  MapPin,
  Phone,
  FileText,
  Download,
  Building,
} from 'lucide-react';

interface PrintableReceiptModalProps {
  document: CustomerDocument | null;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  document,
  onClose,
}) => {
  const { settings } = useShowroom();

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold">{document.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="electric"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="text-xs"
            >
              طباعة / حفظ كـ PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-10 space-y-8 print:p-8 print:space-y-6" id="printable-area">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black tracking-tighter text-blue-600">
                  {BUSINESS_CONFIG.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  المعرض المعتمد
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-1">
                {settings.showroomName || BUSINESS_CONFIG.brandTagline}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.address?.fullAddress || BUSINESS_CONFIG.address.fullAddress}</p>
              <p className="text-[11px] text-slate-500">
                هاتف: <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.phone || settings.contactPhone || BUSINESS_CONFIG.phone)}</span>
                {settings.secondaryPhone ? <> - <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.secondaryPhone)}</span></> : ''} | 
                واتساب: <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.whatsappPhone || BUSINESS_CONFIG.whatsappPhone)}</span>
              </p>
            </div>

            <div className="text-left space-y-1">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block text-center">
                <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
                <span className="text-[9px] font-mono font-bold text-slate-500 block mt-1">
                  {document.referenceNumber || (document as any).relatedReference || (document as any).documentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Document Title & Reference Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                نوع المستند الرسمي:
              </span>
              <h2 className="text-lg font-black text-slate-900">{document.title}</h2>
            </div>

            <div className="text-right sm:text-left space-y-0.5">
              <span className="text-xs text-slate-500 font-bold block">رقم المرجع الإداري:</span>
              <span className="text-sm font-black font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block">
                {document.referenceNumber || (document as any).relatedReference || (document as any).documentNumber}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                تاريخ الإصدار: {new Date(document.issueDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Customer & Product Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                بيانات العميل صاحب الطلب:
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">الاسم الثلاثي:</span>
                  <span className="font-bold text-slate-900">{document.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span className="font-mono font-bold text-slate-900">{document.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">حالة المستند:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {document.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                تفاصيل الجهاز بالمعرض:
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">الجهاز:</span>
                  <span className="font-bold text-slate-900 line-clamp-1">{document.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سعر المعرض المعتمد:</span>
                  <span className="font-mono font-bold text-slate-900">{((document.productPrice ?? (document as any).amount) || 0).toLocaleString()} {settings.currencySymbol}</span>
                </div>
                {document.remainingAmount !== undefined && (
                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>المبلغ المتبقي للاستلام:</span>
                    <span className="font-mono text-emerald-600">{document.remainingAmount?.toLocaleString()} {settings.currencySymbol}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              الشروط والأحكام وسياسة المعاينة:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              {(document.termsAndConditions || [
                'هذا الإيصال توثيق رسمي لحفظ بيانات العملية لدى معرض PRO TECK.',
                'حق المعاينة والتجربة المباشرة مكفول بالكامل داخل معرض PRO TECK بالمعادي.',
              ]).map((term, idx) => (
                <li key={idx}>{term}</li>
              ))}
            </ul>
          </div>

          {/* Signature & Stamp Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="space-y-1 text-center sm:text-right">
              <p className="font-bold text-slate-800">اعتماد إدارة معرض PRO TECK</p>
              <p className="text-[10px] text-slate-400">قسم المبيعات والحجوزات الفنية</p>
            </div>

            <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-400/50 flex flex-col items-center justify-center text-center p-2 text-[9px] font-bold text-blue-600 rotate-[-12deg]">
              <span>معتمد رسمي</span>
              <span>PRO TECK</span>
              <span>قسم الجودة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
