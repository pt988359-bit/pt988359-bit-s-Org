import React, { useState } from 'react';
import { AdminDraft, RecentWorkItem } from '../../../types/adminCore';
import { useShowroom, RoutePath } from '../../../context/ShowroomContext';
import {
  Clock,
  FileEdit,
  X,
  Package,
  FileSpreadsheet,
  Users,
  ShoppingBag,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface AdminRecentWorkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recentWorkItems: RecentWorkItem[];
  drafts: AdminDraft[];
  onDeleteDraft?: (draftId: string) => void;
}

export const AdminRecentWorkDrawer: React.FC<AdminRecentWorkDrawerProps> = ({
  isOpen,
  onClose,
  recentWorkItems,
  drafts,
  onDeleteDraft,
}) => {
  const { navigateTo } = useShowroom();
  const [activeTab, setActiveTab] = useState<'recent' | 'drafts'>('recent');

  if (!isOpen) return null;

  const getRecentIcon = (type: RecentWorkItem['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'invoice':
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
      case 'customer':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'request':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'category':
        return <Layers className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleOpenRecent = (item: RecentWorkItem) => {
    navigateTo(item.route as RoutePath);
    onClose();
  };

  const handleOpenDraft = (draft: AdminDraft) => {
    if (draft.type === 'product') navigateTo('admin-products');
    else if (draft.type === 'invoice') navigateTo('admin-invoices');
    else if (draft.type === 'category') navigateTo('admin-categories');
    else if (draft.type === 'ai_content') navigateTo('admin-ai');
    else navigateTo('admin-settings');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-md flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">آخر ما تم العمل عليه والمسودات</h3>
              <p className="text-[11px] text-slate-400">العودة السريعة لمتابعة العمل من حيث توقفت</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>السجلات الأخيرة ({recentWorkItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>المسودات المحفوظة ({drafts.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activeTab === 'recent' ? (
            recentWorkItems.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">لا توجد عناصر مفتوحة مؤخراً.</div>
            ) : (
              recentWorkItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenRecent(item)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {getRecentIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate group-hover:text-purple-300">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">{item.subtitle}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.timestamp}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 rotate-180 shrink-0" />
                </div>
              ))
            )
          ) : drafts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">لا توجد مسودات محفوظة.</div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => handleOpenDraft(draft)}
                  className="flex-1 min-w-0 cursor-pointer flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-amber-400">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate group-hover:text-purple-300">
                      {draft.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> حفظ تلقائي
                      </span>
                      <span className="text-[10px] text-slate-500">{draft.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {onDeleteDraft && (
                  <button
                    onClick={() => onDeleteDraft(draft.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 cursor-pointer"
                    title="حذف المسودة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500">
          محرك الحفظ التلقائي يحفظ التغييرات غير المكتملة فوراً
        </div>
      </div>
    </div>
  );
};
