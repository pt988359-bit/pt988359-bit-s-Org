import React, { useState } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Brain,
  Terminal,
  Settings,
  Activity,
} from 'lucide-react';
import { AiGovernanceEngine } from '../../services/aiGovernance';
import { AIOperationsDashboard } from './ai/AIOperationsDashboard';
import { AiEngineControlPanelModal } from './ai/AiEngineControlPanelModal';

export const AdminAiView: React.FC = () => {
  const { aiConfig, updateAiConfig } = useShowroom();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'operations' | 'knowledge' | 'governance'>('operations');
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [prompt, setPrompt] = useState(aiConfig.systemPrompt);
  const [pendingActions, setPendingActions] = useState(AiGovernanceEngine.getPendingActions());

  const handleSaveConfig = () => {
    updateAiConfig({ systemPrompt: prompt });
    showToast('تم حفظ الإعدادات', 'تم تحديث تعليمات المساعد الذكي وحارس النظام', 'success');
  };

  const handleApprove = (id: string) => {
    AiGovernanceEngine.approveAction(id, 'الأدمن الرئيسي');
    setPendingActions(AiGovernanceEngine.getPendingActions());
    showToast('تمت الموافقة', 'تمت الموافقة وتطبيق اقتراح الذكاء الاصطناعي بنجاح', 'success');
  };

  const handleReject = (id: string) => {
    AiGovernanceEngine.rejectAction(id, 'الأدمن الرئيسي');
    setPendingActions(AiGovernanceEngine.getPendingActions());
    showToast('تم الرفض', 'تم رفض التغيير المقترح وتجاهله', 'info');
  };

  return (
    <div className="flex flex-col gap-6 pb-12 dir-rtl text-xs">
      {/* Tab Selector Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2.5 rounded-2xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'operations'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>لوحة الأوامر والعمليات (AI Operations Agent - TASK-014)</span>
          </button>

          <button
            onClick={() => setKnowledgeModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>محرك المعرفة والقواعد (AI Knowledge Engine - TASK-013)</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2.5 rounded-2xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>حوكمة التوصيات وحارس النظام</span>
          </button>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px]">
          اضغط <kbd className="text-white font-bold bg-slate-800 px-1 py-0.5 rounded">Ctrl+K</kbd> لفتح النافذة المباشرة
        </div>
      </div>

      {/* OPERATIONS DASHBOARD TAB */}
      {activeTab === 'operations' && <AIOperationsDashboard />}

      {/* GOVERNANCE TAB */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* AI Permission Banner */}
          <Card className="bg-slate-900 border-indigo-500/40 text-white">
            <CardBody className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      قانون حوكمة الذكاء الاصطناعي (AI Rule)
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      مفعل بالأدوات
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1">
                    الذكاء الاصطناعي لا ينفذ أي إجراء تلقائياً بدون موافقة صريحة
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    يقتصر دور الـ AI على الاقتراح، التحليل، التلخيص، والتوصية. جميع الإجراءات تتطلب موافقة المدير المباشرة قبل الحفظ في البيانات.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* System Prompt Configuration */}
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-400" />
                تعليمات وتوجيهات المساعد الذكي (System Prompt)
              </h3>
            </CardHeader>
            <CardBody className="p-6 flex flex-col gap-4">
              <Textarea
                label="النص التوجيهي للذكاء الاصطناعي"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
              <Button variant="electric" onClick={handleSaveConfig} className="w-fit">
                حفظ التعليمات
              </Button>
            </CardBody>
          </Card>

          {/* Pending AI Suggestions Awaiting Review */}
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                توصيات الـ AI المعلقة بانتظار موافقة الأدمن ({pendingActions.length})
              </h3>
            </CardHeader>

            <CardBody className="p-6">
              {pendingActions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
                  لا توجد توصيات معلقة حالياً. الذكاء الاصطناعي يعمل في وضع الاقتراح عند الطلب.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingActions.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-xs">{act.description}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">النوع: {act.type}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(act.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          موافقة وتطبيق
                        </button>
                        <button
                          onClick={() => handleReject(act.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* AI KNOWLEDGE ENGINE MODAL (TASK-013) */}
      {knowledgeModalOpen && (
        <AiEngineControlPanelModal onClose={() => setKnowledgeModalOpen(false)} />
      )}
    </div>
  );
};
