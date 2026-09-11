import React from 'react';
import { PortalCustomerDocument } from '../../types/customerPortal';
import { useShowroom } from '../../context/ShowroomContext';
import { X, Printer, Download, ShieldCheck, FileText, CheckCircle2, MapPin, Phone, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PortalCustomerDocument | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { settings } = useShowroom();
  if (!isOpen || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert(`جاري تحميل المستند الرسمى (${document.documentNumber}) بصيغة PDF...`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{document.title}</h3>
              <p className="text-xs text-slate-400">رقم المستند: {document.documentNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تحميل PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" id="printable-document">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {settings.name}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {settings.brandTagline}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 justify-end">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{settings.address.fullAddress}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>خدمة العملاء: <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.phone)}</span>{settings.secondaryPhone ? <> | <span dir="ltr" className="inline-block" style={{ unicodeBidi: 'isolate' }}>{formatPhoneForDisplay(settings.secondaryPhone)}</span></> : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>فرع {settings.address.area} - {settings.address.street}</span>
              </div>
            </div>
          </div>

          {/* Document Identity Banner */}
          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">نوع المستند</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{document.title}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">تاريخ الإصدار</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {new Date(document.issueDate).toLocaleDateString('ar-EG')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">المرجع المرتبط</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                {document.relatedReference}
              </span>
            </div>
            {document.amount !== undefined && (
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">المبلغ الإجمالي</span>
                <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                  {document.amount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">اسم العميل المحترم:</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 block">{document.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">رقم الهاتف المسجل:</span>
              <span dir="ltr" className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5 inline-block" style={{ unicodeBidi: 'isolate' }}>{document.customerPhone}</span>
            </div>
            {document.productTitle && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block">الجهاز المشمول بالطلب:</span>
                <span className="font-bold text-slate-900 dark:text-white">{document.productTitle}</span>
              </div>
            )}
          </div>

          {/* Detailed Content depending on Document Type */}
          {document.type === 'warranty_certificate' ? (
            <div className="space-y-4 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>شروط وأحكام الضمان المعتمد من PRO TECK</span>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>يسري هذا الضمان لمدة 12 شهراً كاملاً من تاريخ الفاتورة الصادرة.</li>
                <li>يغطي الضمان عيوب التصنيع والمكونات الفنية الداخلية للجهاز.</li>
                <li>يتاح للعميل حق طلب الاستبدال الفوري خلال 14 يوماً من الاستلام في حال وجود عيوب غير قابلة للإصلاح.</li>
                <li>يلتزم معرض PRO TECK بتوفير قطع غيار الفابريقة الأصلية طوال فترة الضمان.</li>
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
              <p>هذا المستند صادر إلكترونياً من منصة بوابة العملاء لمعرض PRO TECK بالأجهزة المنزلية بالمعادي.</p>
              <p>يعتبر إثباتاً رسمياً معتمداً ومسجلاً بقاعدة البيانات المركزية تحت المرجع المذكور أعلاه.</p>
            </div>
          )}

          {/* Official Stamp Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>مستند إلكتروني موثق من PRO TECK المعادي</span>
            </div>
            <div className="text-right">
              <div className="w-24 h-12 border-2 border-dashed border-blue-400/50 rounded-lg flex items-center justify-center text-[10px] text-blue-500 font-bold rotate-[-3deg]">
                ختم المعرض المعتمد
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-end">
          <Button variant="secondary" onClick={onClose}>
            إغلاق المستند
          </Button>
        </div>
      </div>
    </div>
  );
};
