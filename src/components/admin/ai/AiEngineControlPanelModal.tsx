import React, { useState } from 'react';
import {
  Brain,
  X,
  Database,
  ShieldCheck,
  Zap,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  BookOpen,
  Settings,
  Activity,
  Award,
  Layers,
} from 'lucide-react';
import { AIKnowledgeEngine } from '../../../core/services/ai/AIKnowledgeEngine';
import { useShowroom } from '../../../context/ShowroomContext';

interface AiEngineControlPanelModalProps {
  onClose: () => void;
}

export const AiEngineControlPanelModal: React.FC<AiEngineControlPanelModalProps> = ({ onClose }) => {
  const { categories, suppliers } = useShowroom();

  const [learningEnabled, setLearningEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'memory' | 'multimodal'>('overview');
  const [stats, setStats] = useState(() => AIKnowledgeEngine.getEngineStats());
  const [memoryRecords, setMemoryRecords] = useState(() => AIKnowledgeEngine.getMemoryRecords());
  const snapshot = AIKnowledgeEngine.getKnowledgeSnapshot(categories, suppliers || []);

  const handleClearMemory = () => {
    if (window.confirm('هل أنت تأكد من رغبتك في مسح ذاكرة التعلم المحلي للمحرك؟ ستستعيد القيم المرجعية الأصلية.')) {
      AIKnowledgeEngine.clearMemory();
      setStats(AIKnowledgeEngine.getEngineStats());
      setMemoryRecords([]);
    }
  };

  const handleExportKnowledge = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ snapshot, stats, memoryRecords }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `proteck-ai-knowledge-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 dir-rtl text-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">لوحة تحكم محرك الذكاء الاصطناعي والمعرفة (AI Core Hub)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  v2.0 Clean Architecture
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                إدارة ذاكرة التعلم، قواعد العمل المؤسسية، خوارزميات التسعير، ومقاييس الدقة بدون تعديل نماذج خارجية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>نظرة عامة وإحصائيات المحرك</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'rules'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>قواعد المعرض ({snapshot.activeBusinessRulesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'memory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>ذاكرة التعلم والتصحيحات ({memoryRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('multimodal')}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'multimodal'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>المعالجات المستقبليّة (Multimodal)</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportKnowledge}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>تصدير المعرفة</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>دقة المحرك الإجمالية</span>
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{stats.overallAccuracy}%</div>
                  <p className="text-[10px] text-emerald-400">بناءً على اعتمادات وتصحيحات المدير</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>إجمالي عمليات التحليل</span>
                    <Zap className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{stats.totalExtractions}</div>
                  <p className="text-[10px] text-slate-400">عملية تحليل واستخراج ناجحة</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>حجم ذاكرة التعلم</span>
                    <Database className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{stats.memorySizeKb} KB</div>
                  <p className="text-[10px] text-slate-400">{memoryRecords.length} سجل تعديل محفوظ محلياً</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 font-bold">
                    <span>الماركات المعرفة</span>
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{snapshot.brandsCount} ماركة</div>
                  <p className="text-[10px] text-blue-400">مع أسماء مرادفة بالسوق المصري</p>
                </div>
              </div>

              {/* Learning Settings */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>إعدادات التعلم والتحسين المستمر (Continuous Learning Settings)</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={learningEnabled}
                      onChange={(e) => setLearningEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  عند تفعيل التعلم، يتعلم محرك AI تلقائياً من تعديلات المدير على الماركات، الأقسام، وحسابات التكلفة، ويرفع نسب الثقة في المرات القادمة دون إرسال أي بيانات لنماذج خارجية.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleClearMemory}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>تفريغ ذاكرة المحرك ومسح التعديلات</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>قواعد المعرض والمحرك المعتمدة (Business Rules Service)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AIKnowledgeEngine.getActiveBusinessRules().map((rule) => (
                  <div key={rule.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs">{rule.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold">
                        {rule.code}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{rule.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>قاعدة مفعّلة في محرك Prompts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEMORY TAB */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>سجل تعديلات المدير المقبولة والمرفوضة</span>
                </h3>

                <button
                  onClick={handleClearMemory}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 font-bold text-xs hover:bg-rose-500/20"
                >
                  تفريغ الذاكرة
                </button>
              </div>

              {memoryRecords.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400">
                  لا توجد تصحيحات مخصصة في الذاكرة حالياً. يعمل المحرك بالقيم المرجعية الافتراضية.
                </div>
              ) : (
                <div className="space-y-2">
                  {memoryRecords.map((rec) => (
                    <div key={rec.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="text-indigo-400 font-mono">[{rec.field}]</span>
                          <span>من: "{String(rec.originalAiValue)}" ➔ إلى: "{String(rec.userCorrectedValue)}"</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(rec.timestamp).toLocaleString('ar-EG')}</span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                        معتمد بالذاكرة
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MULTIMODAL TAB */}
          {activeTab === 'multimodal' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>معمارية المعالجات متعددة الوسائط المستقبليّة (Multimodal Architecture)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AIKnowledgeEngine.getMultimodalProcessors().map((proc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">{proc.type.toUpperCase()} Processor</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold">
                        {proc.version}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {proc.supportedFormats.map((fmt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono">
                          {fmt}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>جاهز للتكامل مع الواجهات والأجهزة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <span>PRO TECK Enterprise AI Knowledge Engine • Powered by Clean Architecture</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
