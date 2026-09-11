import React, { useState } from 'react';
import { FileText, Search, ShieldCheck } from 'lucide-react';

interface PortalDocumentsViewProps {
  documents: any[];
  onOpenDocument: (doc: any) => void;
}

export const PortalDocumentsView: React.FC<PortalDocumentsViewProps> = ({
  documents = [],
  onOpenDocument,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDocs = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.relatedReference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>مركز المستندات والإيصالات</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            استعراض كافة إيصالات الحجز، الفواتير الضريبية، وشهادات الضمان الرسمية لـ PRO TECK.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم المستند أو الجهاز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pr-9 pl-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-48 sm:w-60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          كافة المستندات ({documents.length})
        </button>
        <button
          onClick={() => setFilterType('reservation_receipt')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            filterType === 'reservation_receipt'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          إيصالات الحجز
        </button>

        <button
          onClick={() => setFilterType('invoice')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            filterType === 'invoice'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          الفواتير
        </button>
        <button
          onClick={() => setFilterType('warranty_certificate')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            filterType === 'warranty_certificate'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          شهادات الضمان
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لا توجد مستندات مطابقة للبحث.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 hover:border-blue-500 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                  {doc.type === 'warranty_certificate' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="font-mono font-bold text-blue-500">{doc.documentNumber}</span>
                    <span>•</span>
                    <span>{new Date(doc.issueDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {doc.amount !== undefined && (
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      المبلغ: {doc.amount.toLocaleString('ar-EG')} ج.م
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onOpenDocument(doc)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>معاينة المستند</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
