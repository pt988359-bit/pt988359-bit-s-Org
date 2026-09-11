import React, { useState } from 'react';
import { Customer, DuplicateMatchGroup } from '../../../types/customerHub';
import { CopyCheck, X, AlertTriangle, ArrowLeft, Check, ShieldCheck } from 'lucide-react';

interface DuplicateDetectionModalProps {
  duplicateGroups: DuplicateMatchGroup[];
  onClose: () => void;
  onMergeCustomers: (primaryId: string, secondaryId: string) => void;
}

export const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  duplicateGroups,
  onClose,
  onMergeCustomers,
}) => {
  const [mergedSuccessMsg, setMergedSuccessMsg] = useState('');

  const handleMerge = (primaryId: string, secondaryId: string) => {
    onMergeCustomers(primaryId, secondaryId);
    setMergedSuccessMsg('تم دمج ملفات العميل ونقل كافة الطلبات والسجلات بنجاح!');
    setTimeout(() => setMergedSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CopyCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">
                رصد وإدارة الحسابات والعملاء المكررين ({duplicateGroups.length})
              </h2>
              <p className="text-slate-400 text-[11px]">
                نظام مطابقة ورصد التطابق المزدوج برقم الهاتف والواتساب والاسم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {mergedSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{mergedSuccessMsg}</span>
            </div>
          )}

          {duplicateGroups.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-extrabold text-sm text-white">لا توجد حالات تكرار حالياً</p>
              <p className="text-slate-400 text-[11px]">
                دليل العملاء خالي تماماً من أي حسابات مكررة بأرقام الهاتف أو الواتساب.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateGroups.map((grp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>تطابق مكرر مرصود:</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      الملف الأساسي المقترح: <strong className="text-white">{grp.primaryCustomer.id}</strong>
                    </span>
                  </div>

                  {/* Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    {/* Primary */}
                    <div className="space-y-1">
                      <span className="text-blue-400 font-extrabold text-[10px]">1. الملف الرئيسي المستهدف:</span>
                      <h4 className="font-black text-white text-xs">{grp.primaryCustomer.fullName}</h4>
                      <p className="text-slate-400 text-[10px]">
                        هاتف: <span className="dir-ltr text-right">{grp.primaryCustomer.primaryPhone}</span>
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        المبيعات: {grp.primaryCustomer.totalSpent.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>

                    {/* Matched Secondary */}
                    {grp.matchedCustomers.map((m, mIdx) => (
                      <div key={mIdx} className="space-y-1 border-r border-slate-800 pr-3">
                        <span className="text-amber-400 font-extrabold text-[10px]">
                          2. الملف المكرر المكتشف ({m.similarityScore}%):
                        </span>
                        <h4 className="font-black text-white text-xs">{m.customer.fullName}</h4>
                        <p className="text-slate-400 text-[10px]">
                          هاتف: <span className="dir-ltr text-right">{m.customer.primaryPhone}</span>
                        </p>
                        <p className="text-rose-400 text-[10px] font-bold">
                          سبب المطابقة: {m.reason === 'phone_exact' ? 'تطابق رقم الهاتف بالكامل' : 'تشابه الاسم برقم قريب'}
                        </p>

                        <button
                          onClick={() => handleMerge(grp.primaryCustomer.id, m.customer.id)}
                          className="mt-2 w-full px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] transition-all cursor-pointer shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>دمج الملف المكرر بالملف الرئيسي</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
