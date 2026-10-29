import React, { useState } from 'react';
import { Customer, CustomerStatus, PreferredContactMethod } from '../../../types/customerHub';
import { User, X, Save, Phone, MessageSquare, Mail, MapPin, Tag } from 'lucide-react';

interface AddEditCustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => void;
}

export const AddEditCustomerModal: React.FC<AddEditCustomerModalProps> = ({
  customer,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [primaryPhone, setPrimaryPhone] = useState(customer?.primaryPhone || '');
  const [whatsappPhone, setWhatsappPhone] = useState(customer?.whatsappPhone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [governorate, setGovernorate] = useState(customer?.address?.governorate || '');
  const [cityArea, setCityArea] = useState(customer?.address?.cityArea || '');
  const [streetAddress, setStreetAddress] = useState(customer?.address?.streetAddress || '');
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>(
    customer?.preferredContactMethod || 'whatsapp'
  );
  const [status, setStatus] = useState<CustomerStatus>(customer?.status || 'new');
  const [assignedAdmin, setAssignedAdmin] = useState(customer?.assignedAdmin || 'PRO TECK Admin');
  const [tagsText, setTagsText] = useState(customer?.tags?.join(', ') || 'VIP, High Value');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !primaryPhone.trim()) return;

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      fullName,
      primaryPhone,
      whatsappPhone: whatsappPhone || `20${primaryPhone.replace(/^0/, '')}`,
      email,
      address: {
        governorate,
        cityArea,
        streetAddress,
      },
      preferredContactMethod,
      status,
      assignedAdmin,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">
                {customer ? `تعديل ملف العميل (${customer.id})` : 'إضافة عميل جديد لدليل المعرض'}
              </h2>
              <p className="text-slate-400 text-[11px]">
                أدخل البيانات الشخصية وطرق التواصل والمنطقة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">اسم العميل بالكامل *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: المهندس أحمد محمود الشريف"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">رقم الهاتف الرئيسي *</label>
              <input
                type="text"
                required
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="01001234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white dir-ltr text-right focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">رقم الواتساب (شامل كود الدول)</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="201001234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white dir-ltr text-right focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmed@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- غير محدد --</option>
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="القليوبية">القليوبية</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="أخرى">محافظة أخرى</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">المنطقة/الحي</label>
              <input
                type="text"
                value={cityArea}
                onChange={(e) => setCityArea(e.target.value)}
                placeholder="المعادي / التجمع الخامس..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">العنوان التفصيلي للشارع والبرج</label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="شارع 68 عمارة 12 دجلة المعادي..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">حالة العميل</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="new">جديد (New)</option>
                <option value="active">نشط (Active)</option>
                <option value="vip">عميل مميز (VIP)</option>
                <option value="returning">عائد لشراء مجدد (Returning)</option>
                <option value="blocked">محظور (Blocked)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">المشرف المسؤول بالمعرض</label>
              <input
                type="text"
                value={assignedAdmin}
                onChange={(e) => setAssignedAdmin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">وسوم العميل (مفصولة بفاصلة)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="VIP, Frequent Buyer, High Value"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الملف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
