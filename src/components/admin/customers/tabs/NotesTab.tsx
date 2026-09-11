import React, { useState } from 'react';
import { Customer, CustomerNote } from '../../../../types/customerHub';
import { Pin, Plus, Send, User, AtSign, Trash2 } from 'lucide-react';

interface NotesTabProps {
  customer: Customer;
  onAddNote: (noteContent: string, isPinned: boolean) => void;
  onTogglePinNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  customer,
  onAddNote,
  onTogglePinNote,
  onDeleteNote,
}) => {
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddNote(content, isPinned);
    setContent('');
    setIsPinned(false);
  };

  return (
    <div className="space-y-4 dir-rtl text-xs text-slate-200">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Pin className="w-4 h-4 text-rose-400" />
          <span>ملاحظات المشرفين الخاصة (Private Admin Notes)</span>
        </h3>
        <p className="text-slate-400 text-[11px] mt-0.5">
          ملاحظات سرية لفريق المعرض فقط - غير مرئية للعميل
        </p>
      </div>

      {/* Note Input Box */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
        <textarea
          rows={3}
          required
          placeholder="اكتب ملاحظة جديدة حول العميل (يدعم الإشارة للمشرفين مثل @م. خالد أو @د. ياسمين)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0 cursor-pointer"
            />
            <Pin className="w-3.5 h-3.5 text-rose-400" />
            <span>تثبيت هذه الملاحظة بأعلى الملف (Pinned Note)</span>
          </label>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إضافة الملاحظة</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      {customer.notes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
          <Pin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-bold text-slate-300">لا توجد ملاحظات مسجلة لـ {customer.fullName}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customer.notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-2xl border transition-all space-y-2 shadow-md ${
                note.isPinned
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-400">
                  <User className="w-3.5 h-3.5" />
                  <span>{note.author}</span>
                  <span className="text-slate-500 font-normal">
                    • {new Date(note.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTogglePinNote(note.id)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      note.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت الملاحظة'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-wrap leading-relaxed text-xs">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
