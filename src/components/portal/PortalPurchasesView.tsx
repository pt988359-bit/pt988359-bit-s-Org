import React from 'react';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

interface PortalPurchasesViewProps {
  purchases: any[];
  onOpenDocument: (doc: any) => void;
  onNavigate: (view: string) => void;
}

export const PortalPurchasesView: React.FC<PortalPurchasesViewProps> = ({
  purchases = [],
  onOpenDocument,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <span>سجل مشترياتي من PRO TECK</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          الأجهزة المنزلية التي تم شراؤها ومعاينتها واستلامها بنجاح مع روابط الفواتير الرسمية وشهادات الضمان.
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لا توجد مشتريات مكتملة مسجلة بعد.
          </div>
        ) : (
          purchases.map((sale) => (
            <div
              key={sale.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={sale.productImage}
                    alt={sale.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {sale.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        عملية مكتملة بالمعرض
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                      {sale.productTitle}
                    </h3>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      السعر النهائي: {sale.finalPrice.toLocaleString('ar-EG')} ج.م
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      onOpenDocument({
                        id: `doc-inv-${sale.id}`,
                        type: 'invoice',
                        title: 'فاتورة مبيعات معتمدة',
                        documentNumber: sale.invoiceNumber,
                        issueDate: sale.completionDate,
                        relatedReference: sale.orderNumber,
                        amount: sale.finalPrice,
                        productTitle: sale.productTitle,
                        customerName: sale.customerName,
                        customerPhone: sale.customerPhone,
                        status: 'paid',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>عرض الفاتورة</span>
                  </button>
                  <button
                    onClick={() => onNavigate('warranty')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>شهادة الضمان</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>تاريخ الشراء والاستلام: {new Date(sale.completionDate).toLocaleDateString('ar-EG')}</span>
                <span>طريقة الدفع: {sale.paymentMethod === 'instapay' ? 'InstaPay' : 'كاش بالمعرض'}</span>
                <span>رقم الفاتورة: {sale.invoiceNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
