import React from 'react';
import { CheckCircle2, Archive, UserPlus, Download, Printer, Trash2, X } from 'lucide-react';

interface BulkOperationsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkApprove: () => void;
  onBulkArchive: () => void;
  onBulkAssignAdmin: () => void;
  onBulkExport: () => void;
  onBulkPrint: () => void;
  onBulkDelete: () => void;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkApprove,
  onBulkArchive,
  onBulkAssignAdmin,
  onBulkExport,
  onBulkPrint,
  onBulkDelete,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-lg flex items-center gap-4 text-xs dir-rtl text-slate-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="font-extrabold text-white">عناصر محددة</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onBulkApprove}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>اعتماد محدد</span>
        </button>

        <button
          onClick={onBulkArchive}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5 text-amber-400" />
          <span>أرشفة</span>
        </button>

        <button
          onClick={onBulkAssignAdmin}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-400" />
          <span>تعيين مشرف</span>
        </button>

        <button
          onClick={onBulkExport}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>تصدير CSV</span>
        </button>

        <button
          onClick={onBulkPrint}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-teal-400" />
          <span>طباعة</span>
        </button>

        <button
          onClick={onBulkDelete}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف</span>
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        title="إلغاء التحديد"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
