import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  Sparkles,
  Zap,
  ArrowRight,
  Package,
  ShoppingBag,
  TrendingUp,
  FileText,
  Users,
  Brain,
  PlusCircle,
  ShieldCheck,
  Trash2,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  CornerDownLeft,
  ChevronLeft,
} from 'lucide-react';
import { useShowroom } from '../../../context/ShowroomContext';
import { AIOperationsAgent } from '../../../core/services/ai/AIOperationsAgent';
import { ParsedCommand, CommandExecutionResult } from '../../../types/aiOperationsAgent';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal?: (modalName: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenModal,
}) => {
  const { currentRoute, navigateTo } = useShowroom();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'commands' | 'pages' | 'favorites' | 'history'>('all');
  const [parsedPreview, setParsedPreview] = useState<ParsedCommand | null>(null);
  const [confirmationPending, setConfirmationPending] = useState<ParsedCommand | null>(null);
  const [executionResult, setExecutionResult] = useState<CommandExecutionResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [favorites, setFavorites] = useState(() => AIOperationsAgent.getFavorites());
  const [recentQueries, setRecentQueries] = useState(() => AIOperationsAgent.getRecentQueries());
  const [suggestions, setSuggestions] = useState(() => AIOperationsAgent.getSuggestions());

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setExecutionResult(null);
      setConfirmationPending(null);
    }
  }, [isOpen]);

  // Parse query on typing
  useEffect(() => {
    if (query.trim().length >= 2) {
      const parsed = AIOperationsAgent.parseQuery(query, currentRoute);
      setParsedPreview(parsed);
      setSuggestions(AIOperationsAgent.getSuggestions(query));
    } else {
      setParsedPreview(null);
      setSuggestions(AIOperationsAgent.getSuggestions(''));
    }
    setSelectedIndex(0);
  }, [query, currentRoute]);

  if (!isOpen) return null;

  // Execute selected or typed command
  const handleRunCommand = (queryString: string) => {
    const parsed = AIOperationsAgent.parseQuery(queryString, currentRoute);

    // If high-risk command requiring confirmation
    if (parsed.requiresConfirmation && !confirmationPending) {
      setConfirmationPending(parsed);
      return;
    }

    // Dispatch action
    const { result } = AIOperationsAgent.executeCommand(
      queryString,
      {
        navigateTo: (r) => {
          navigateTo(r);
        },
        openModal: onOpenModal,
        userRole: 'admin',
      },
      currentRoute
    );

    setExecutionResult(result);
    setRecentQueries(AIOperationsAgent.getRecentQueries());
    setConfirmationPending(null);

    // Auto-close modal after brief confirmation if simple navigation
    if (result.success && parsed.intent === 'NAVIGATE') {
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const handleConfirmHighRisk = () => {
    if (!confirmationPending) return;
    handleRunCommand(confirmationPending.rawQuery);
  };

  const handleToggleFavorite = (e: React.MouseEvent, label: string, queryStr: string, category: string) => {
    e.stopPropagation();
    AIOperationsAgent.toggleFavorite({ label, query: queryStr, category });
    setFavorites(AIOperationsAgent.getFavorites());
  };

  // Icon Mapper
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return <Package className="w-4 h-4 text-blue-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'Users': return <Users className="w-4 h-4 text-cyan-400" />;
      case 'Brain': return <Brain className="w-4 h-4 text-indigo-400" />;
      case 'PlusCircle': return <PlusCircle className="w-4 h-4 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Trash2': return <Trash2 className="w-4 h-4 text-rose-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 dir-rtl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Search Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleRunCommand(query);
                }
              }}
              placeholder="اكتب أمراً باللغة العربية أو الإنجليزية (مثال: 'افتح المنتجات'، 'إضافة جهاز جديد'، 'فحص جودة الضمان')..."
              className="w-full bg-transparent text-white text-sm font-bold placeholder-slate-500 focus:outline-none py-1"
            />
          </div>

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Live Recognized Intent Preview Bar */}
        {parsedPreview && (
          <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-[10px]">
                INTENT: {parsedPreview.intent}
              </span>
              <span className="text-white font-bold">{parsedPreview.intentArabicLabel}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              {parsedPreview.isLocalExecution ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>تنفيذ محلي فوري (1ms)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>استدلال الذكاء الاصطناعي</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Banner for High Risk Commands */}
        {confirmationPending && (
          <div className="p-4 bg-rose-950/80 border-b border-rose-800 text-rose-200 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-extrabold text-white">إجراء حساس يتطلب التأكيد!</span>
                <p className="text-[11px] text-rose-300 mt-0.5">{confirmationPending.confirmationPromptArabic}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleConfirmHighRisk}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer"
              >
                تأكيد التنفيذ
              </button>
              <button
                onClick={() => setConfirmationPending(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Execution Result Feedback */}
        {executionResult && (
          <div className="p-3 bg-emerald-950/70 border-b border-emerald-800 text-emerald-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{executionResult.message}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">
              زمن التنفيذ: {executionResult.executionTimeMs}ms
            </span>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'commands'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الأوامر السريعة
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'pages'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            الصفحات
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>المفضلة ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>السجل ({recentQueries.length})</span>
          </button>
        </div>

        {/* Suggestions List Body */}
        <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1 max-h-[50vh]">
          {activeTab === 'history' ? (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">الأوامر الأخيرة</div>
              {recentQueries.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => handleRunCommand(q)}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="font-bold text-white text-xs">{q}</span>
                  </div>
                  <CornerDownLeft className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          ) : activeTab === 'favorites' ? (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">الأوامر المفضلة والمثبتة</div>
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleRunCommand(fav.query)}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div>
                      <span className="font-bold text-white text-xs">{fav.label}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{fav.query}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fav.shortcut && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                        {fav.shortcut}
                      </span>
                    )}
                    <CornerDownLeft className="w-4 h-4 text-slate-600 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  onClick={() => handleRunCommand(sug.query)}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/90 border border-slate-800/80 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 group-hover:bg-slate-700 transition-colors">
                      {renderCategoryIcon(sug.iconName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs group-hover:text-indigo-300 transition-colors">
                          {sug.label}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                          {sug.categoryLabelArabic}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">أمر: "{sug.query}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(e, sug.label, sug.query, sug.category)}
                      className="p-1.5 text-slate-500 hover:text-amber-400 rounded-lg transition-colors"
                      title="تثبيت في المفضلة"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    {sug.shortcut && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
                        {sug.shortcut}
                      </span>
                    )}

                    <CornerDownLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px]">Enter</kbd> للتنفيذ
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px]">Esc</kbd> للإغلاق
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-indigo-400">
            <Zap className="w-3 h-3" />
            <span>AI Operations Agent v2.0 (Clean Architecture)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
