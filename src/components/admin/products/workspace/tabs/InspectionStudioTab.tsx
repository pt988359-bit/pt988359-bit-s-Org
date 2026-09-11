import React, { useState } from 'react';
import { EnrichedProduct, InspectionCheckitem } from '../../../../../types/productStudio';
import { Stethoscope, CheckCircle2, AlertTriangle, XCircle, Save, Award, UserCheck } from 'lucide-react';

interface InspectionStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

export const InspectionStudioTab: React.FC<InspectionStudioTabProps> = ({ product, onUpdateProduct }) => {
  const [checklist, setChecklist] = useState<InspectionCheckitem[]>(
    product.inspectionChecklist || [
      { id: 'ck-1', title: 'اختبار موتور الانفرتر والكومبريسور', category: 'electrical', status: 'passed', score: 98, inspectorName: 'م. أحمد حسن', notes: 'الاستهلاك ممتاز والضوضاء تكاد تكون منعدمة (38dB)' },
      { id: 'ck-2', title: 'اختبار تسريب غاز الفريون R600a', category: 'safety', status: 'passed', score: 100, inspectorName: 'م. أحمد حسن', notes: 'الضغط ثابت 100%' },
      { id: 'ck-3', title: 'فحص جوان الأبواب والعزل الحراري', category: 'mechanical', status: 'passed', score: 95, inspectorName: 'م. سامي طاهر', notes: 'تم استبدال الجوان الفوقي بجوان أصلي جديد' },
      { id: 'ck-4', title: 'التعقيم الهيدروليكي والبخاري', category: 'sanitization', status: 'passed', score: 96, inspectorName: 'فني علي', notes: 'تم التعقيم بالكامل باستخدام مادة بخار ألمانية معتمدة' },
      { id: 'ck-5', title: 'فحص الخدوش الخارجية والطلاء', category: 'visual', status: 'passed', score: 92, inspectorName: 'PRO TECK Admin', notes: 'خدوش لا تذكر على الجانب الأيمن الخلفي' },
    ]
  );

  const [inspectorNotes, setInspectorNotes] = useState(product.productStory || 'الجهاز ممتاز جداً واجتاز كافة اختبارات السلامة والتجربة بالمعمل لمدة 48 ساعة.');

  const passedCount = checklist.filter((c) => c.status === 'passed').length;
  const overallScore = Math.round(checklist.reduce((acc, curr) => acc + curr.score, 0) / (checklist.length || 1));

  const handleSaveInspection = () => {
    onUpdateProduct({
      inspectionChecklist: checklist,
      productStory: inspectorNotes,
      healthScores: {
        generalScore: overallScore,
        technicalScore: overallScore,
        appearanceScore: overallScore,
        overallScore,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleStatus = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'passed' ? 'warning' : item.status === 'warning' ? 'failed' : 'passed';
          return { ...item, status: nextStatus, score: nextStatus === 'passed' ? 98 : nextStatus === 'warning' ? 75 : 40 };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Top Health Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">درجة الصحة الفنية الكلية</span>
            <span className="font-mono text-xl font-extrabold text-emerald-400">{overallScore}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">مؤشر ثقة المهندسين بالمعمل</span>
            <span className="font-mono text-xl font-extrabold text-blue-400">99.2% Confidence</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">الاختبارات الناجحة</span>
            <span className="font-mono text-xl font-extrabold text-indigo-300">
              {passedCount} من {checklist.length} اختبار
            </span>
          </div>
        </div>
      </div>

      {/* Inspection Checklist Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            قائمة فحص السلامة والتجربة الكهروميكانيكية (Inspection Checklist)
          </h3>

          <button
            onClick={handleSaveInspection}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ تقرير الفحص</span>
          </button>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleStatus(item.id)}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                {item.status === 'passed' && (
                  <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
                {item.status === 'warning' && (
                  <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                )}
                {item.status === 'failed' && (
                  <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                    <XCircle className="w-4 h-4" />
                  </span>
                )}

                <div>
                  <span className="font-bold text-white text-xs block">{item.title}</span>
                  <span className="text-[10px] text-slate-400 block">{item.notes}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  {item.score}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{item.inspectorName || 'مهندس الفحص'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-800 pt-3">
          <label className="font-bold text-slate-300 block">تقرير وملاحظات مهندس المعمل الفني (Inspector Story):</label>
          <textarea
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
