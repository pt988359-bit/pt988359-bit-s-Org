import React from 'react';
import { Product } from '../../types';
import { ShieldCheck, Award } from 'lucide-react';

interface WarrantyCardProps {
  product: Product;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ product }) => {
  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden space-y-6 dir-rtl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">بطاقة الضمان المعيارية (Warranty Card)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            صورة بطاقة الضمان والسياسات المعتمدة للجهاز
          </p>
        </div>
      </div>

      {product.warrantyImageUrl ? (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-center">
          <img
            src={product.warrantyImageUrl}
            alt="بطاقة الضمان"
            loading="lazy"
            className="max-h-96 rounded-xl object-contain border border-slate-700 shadow-xl"
          />
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">بطاقة الضمان متوفرة ومرفقة مع الجهاز</h3>
            <p className="text-xs text-slate-400 mt-1">
              يأتي هذا الجهاز مع بطاقة ضمان رسمية سارية المفعول تشمل الصيانة المجانية وسياسة الاستبدال.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
