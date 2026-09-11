import React, { useState } from 'react';
import { InquiryItem } from '../../../types/orderManagementCenter';
import { MessageSquare, Eye, CheckCircle2, Send, Clock, User } from 'lucide-react';

interface InquiriesWorkspaceProps {
  inquiries: InquiryItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onAnswerInquiry: (id: string, response: string) => void;
}

export const InquiriesWorkspace: React.FC<InquiriesWorkspaceProps> = ({
  inquiries,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onAnswerInquiry,
}) => {
  const [activeInquiry, setActiveInquiry] = useState<InquiryItem | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSendResponse = () => {
    if (!activeInquiry || !responseMessage.trim()) return;
    onAnswerInquiry(activeInquiry.id, responseMessage.trim());
    setActiveInquiry(null);
    setResponseMessage('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs text-slate-100 dir-rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold text-[11px]">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === inquiries.length && inquiries.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                />
              </th>
              <th className="p-4">المرجع</th>
              <th className="p-4">العميل والهاتف</th>
              <th className="p-4">الجهاز الاستفساري</th>
              <th className="p-4">نص الاستفسار</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">الإجابة والرد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500 font-bold">
                  لا توجد استفسارات عملاء جديدة.
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => {
                const isSelected = selectedIds.includes(inq.id);

                return (
                  <tr key={inq.id} className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-blue-950/30' : ''}`}>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(inq.id)}
                        className="rounded border-slate-700 bg-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-black text-blue-400">{inq.referenceNumber}</td>
                    <td className="p-4">
                      <strong className="text-white block font-bold">{inq.customerName}</strong>
                      <span className="text-slate-400 font-mono text-[10px]">{inq.customerPhone}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{inq.productTitle}</td>
                    <td className="p-4 max-w-[260px]">
                      <p className="text-slate-300 line-clamp-2">{inq.inquiryMessage}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 font-bold border border-slate-800 text-[10px]">
                        {inq.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setActiveInquiry(inq);
                          setResponseMessage(inq.adminResponse || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1 mx-auto shadow-md"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>رد على الاستفسار</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activeInquiry && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-white">الرد على استفسار العميل ({activeInquiry.referenceNumber})</h3>
            <div className="p-3 bg-slate-950 rounded-xl text-slate-300">
              <strong className="text-blue-400 block mb-1">الاستفسار:</strong>
              <p>{activeInquiry.inquiryMessage}</p>
            </div>
            <textarea
              rows={4}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="اكتب رد الأدمن المعروض للعميل..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveInquiry(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">
                إلغاء
              </button>
              <button onClick={handleSendResponse} className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl shadow-md">
                إرسال الرد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
