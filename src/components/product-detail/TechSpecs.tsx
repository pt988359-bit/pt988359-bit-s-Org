import React from 'react';
import { Product } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

interface TechSpecsProps {
  product: Product;
}

export const TechSpecs: React.FC<TechSpecsProps> = ({ product }) => {
  const specs = product.specs || [];

  // Group specs if labels contain categories or dynamically group them
  const defaultGroups = [
    {
      title: 'المواصفات العامة والسعة',
      items: specs.slice(0, Math.ceil(specs.length / 2)),
    },
    {
      title: 'الأداء والتكنولوجيا والكهرباء',
      items: specs.slice(Math.ceil(specs.length / 2)),
    },
  ];

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">المواصفات الفنية المعتمدة (Specifications)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            جدول المواصفات والقياسات المستخرجة طبقاً لقالب الفحص الفني للقسم
          </p>
        </div>
      </div>

      {specs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">لا توجد مواصفات فنية إضافية مسجلة للجهاز.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {defaultGroups.map(
            (group, groupIdx) =>
              group.items.length > 0 && (
                <div key={groupIdx} className="space-y-3">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {group.title}
                  </h3>

                  <div className="space-y-2">
                    {group.items.map((spec, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <span className="font-bold text-slate-400">{spec.label}</span>
                        <span className="font-bold text-white text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </section>
  );
};
