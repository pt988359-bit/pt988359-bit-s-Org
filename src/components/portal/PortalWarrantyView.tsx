import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface PortalWarrantyViewProps {
  warranties: any[];
  onOpenDocument?: (doc: any) => void;
}

export const PortalWarrantyView: React.FC<PortalWarrantyViewProps> = ({
  warranties = [],
  onOpenDocument: _onOpenDocument,
}) => {
  return (
    <div className="space-y-6 animate-fade-in dir-rtl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>ضمان وتأمين أجهزتي</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تفاصيل كروت الضمان المعتمدة من PRO TECK للأجهزة المشتراة وسياسة المعاينة والصيانة.
        </p>
      </div>

      {/* Warranties List */}
      <div className="space-y-6">
        {warranties.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            لا توجد شهادات ضمان مسجلة حتى الآن.
          </div>
        ) : (
          warranties.map((war) => (
            <div
              key={war.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {war.warrantyNumber || `WAR-${war.id}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ضمان معتمد
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                      {war.productTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-extrabold border border-purple-500/20">
                    الضمان متوفر مع كارت ضمان الأصلي
                  </span>
                </div>
              </div>

              {/* Warranty Card Images */}
              {(war.warrantyImages || war.warrantyImageUrl) && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">صور كروت الضمان:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(war.warrantyImages) ? (
                      war.warrantyImages.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Warranty Card"
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                        />
                      ))
                    ) : war.warrantyImageUrl ? (
                      <img
                        src={war.warrantyImageUrl}
                        alt="Warranty Card"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {/* Policy terms / Details */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-2 text-xs">
                <h4 className="font-bold text-purple-900 dark:text-purple-300">تفاصيل الضمان والتغطية:</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {war.details || war.replacementPolicy || 'يشمل الضمان الفحص الفني المجاني والصيانة المعتمدة لدى المعرض.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
