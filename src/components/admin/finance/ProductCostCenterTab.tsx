import React, { useState } from 'react';
import { Calculator, Edit3, DollarSign, Package, Check, Sparkles, Tag } from 'lucide-react';
import { ProductCostSheet } from '../../../types/adminFinance';

interface ProductCostCenterTabProps {
  costSheets: ProductCostSheet[];
  onSaveCostSheet: (sheet: ProductCostSheet) => void;
}

export const ProductCostCenterTab: React.FC<ProductCostCenterTabProps> = ({
  costSheets,
  onSaveCostSheet,
}) => {
  const [selectedSheet, setSelectedSheet] = useState<ProductCostSheet | null>(
    costSheets.length > 0 ? costSheets[0] : null
  );

  const [editForm, setEditForm] = useState<ProductCostSheet | null>(
    costSheets.length > 0 ? costSheets[0] : null
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleSelectSheet = (sheet: ProductCostSheet) => {
    setSelectedSheet(sheet);
    setEditForm(sheet);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProductCostSheet, value: number) => {
    if (!editForm) return;

    const updated = {
      ...editForm,
      [field]: value,
    };

    // Recalculate total cost live
    const totalCost =
      (field === 'purchaseCost' ? value : updated.purchaseCost) +
      (field === 'transportationCost' ? value : updated.transportationCost) +
      (field === 'repairCost' ? value : updated.repairCost) +
      (field === 'cleaningCost' ? value : updated.cleaningCost) +
      (field === 'accessoriesCost' ? value : updated.accessoriesCost) +
      (field === 'laborCost' ? value : updated.laborCost) +
      (field === 'otherCosts' ? value : updated.otherCosts);

    updated.totalCost = totalCost;

    setEditForm(updated);
  };

  const handleSave = () => {
    if (!editForm) return;
    onSaveCostSheet(editForm);
    setSelectedSheet(editForm);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Title Bar */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          مركز التكلفة الحقيقية للأجهزة (Product Cost Sheet)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          حساب التكلفة الفعلية الشاملة لكل جهاز معتمد (سعر الشراء + الشحن + قطع الغيار + الصيانة + النظافة + العمالة)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Appliances (4 Columns) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black text-white">قائمة كروت التكلفة للأجهزة</span>
            <span className="text-[11px] font-extrabold text-blue-400">{costSheets.length} جهاز</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {costSheets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-1">
                <Calculator className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="font-bold text-slate-400">لا توجد كروت تكلفة مسجلة</p>
                <p className="text-[11px] text-slate-600">سيتم إدراج الأجهزة تلقائياً عند اعتمادها</p>
              </div>
            ) : (
              costSheets.map((sheet) => {
                const isSelected = selectedSheet?.productId === sheet.productId;
                return (
                  <button
                    key={sheet.productId}
                    onClick={() => handleSelectSheet(sheet)}
                    className={`w-full p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={sheet.productImage}
                      alt={sheet.productTitle}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block text-slate-100 truncate">
                        {sheet.productTitle}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400 font-bold">
                          التكلفة: <strong className="text-emerald-400">{sheet.totalCost.toLocaleString('ar-EG')} ج.م</strong>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Appliance Cost Sheet Detail (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {editForm ? (
            <>
              {/* Active Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src={editForm.productImage}
                    alt={editForm.productTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {editForm.category}
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      {editForm.productTitle}
                    </h3>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    تعديل التكاليف
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    حفظ التغييرات
                  </button>
                )}
              </div>

              {/* Total Cost Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">إجمالي التكلفة الشاملة للواحدة</span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">
                    {editForm.totalCost.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-400">جنية مصري</span>
                  </span>
                </div>

                <div className="text-left space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">سعر البيع المستهدف</span>
                  <span className="text-sm font-black text-blue-400">
                    {editForm.targetSellingPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>

              {/* Cost Components Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  تفاصيل وحساب بند التكاليف التفصيلية
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Purchase Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">سعر الشراء الاصلي من المورد</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.purchaseCost}
                        onChange={(e) => handleInputChange('purchaseCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.purchaseCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Transportation Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">تكلفة النولون والشحن</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.transportationCost}
                        onChange={(e) => handleInputChange('transportationCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.transportationCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Repair Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">تكلفة قطع الغيار والصيانة الفنية</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.repairCost}
                        onChange={(e) => handleInputChange('repairCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.repairCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Cleaning Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">تكلفة التجهيز والنظافة والتعقيم</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.cleaningCost}
                        onChange={(e) => handleInputChange('cleaningCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.cleaningCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Accessories Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">تكلفة الاكسسوارات المرفقة</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.accessoriesCost}
                        onChange={(e) => handleInputChange('accessoriesCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.accessoriesCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Labor Cost */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">أمصاريف المصنعية والعمالة</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.laborCost}
                        onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {editForm.laborCost.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Min Acceptable Price Config */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">
                  الحد الأدنى لبيع الجهاز (Minimum Acceptable Price)
                </span>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.minimumAcceptablePrice}
                      onChange={(e) => handleInputChange('minimumAcceptablePrice', parseFloat(e.target.value) || 0)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs"
                    />
                  ) : (
                    <span className="text-base font-black text-amber-300 font-mono">
                      {editForm.minimumAcceptablePrice.toLocaleString('ar-EG')} ج.م
                    </span>
                  )}
                  <span className="text-[11px] text-amber-400/80">
                    لا يسمح بنزول السعر عن هذا الحد أثناء الفصال مع العميل إلا بموافقة صريحة.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calculator className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">لا توجد بطاقة تكلفة محددة</p>
              <p className="text-[11px] text-slate-500">اختر جهازاً من القائمة أو أضف جهازاً جديداً لبدء حساب تكاليفه الفعلية.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
