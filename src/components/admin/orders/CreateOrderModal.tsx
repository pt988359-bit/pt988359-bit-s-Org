import React, { useState } from 'react';
import { PurchaseRequest } from '../../../types/orderManagementCenter';
import { X, ShoppingCart, User, Package, Plus, Send } from 'lucide-react';
import { defaultSequenceService } from '../../../core/services/SequenceService';
import { IdGenerator } from '../../../core/services/IdGenerator';

interface CreateOrderModalProps {
  onClose: () => void;
  onCreate: (request: Partial<PurchaseRequest>) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onCreate }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState<number>(0);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !productTitle) return;

    onCreate({
      referenceNumber: defaultSequenceService.generateNextReference('purchase'),
      customerName,
      customerPhone,
      customerWhatsapp: `20${customerPhone.replace(/^0/, '')}`,
      productTitle,
      productPrice,
      productImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
      productCode: `PROD-${IdGenerator.generateUniqueId('p').slice(-4).toUpperCase()}`,
      requestedDate: new Date().toISOString(),
      status: 'new',
      assignedAdmin: 'PRO TECK Admin',
      priority,
      notes,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          eventType: 'request_created',
          title: 'تم إنشاء طلب شراء جديد يدوياً',
          description: 'تم إدخال الطلب بواسطة الأدمن الرئيسي عبر مركز الإدارة.',
          actor: 'PRO TECK Admin',
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <span>تسجيل طلب شراء / حجز جديد يدوياً</span>
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">اسم العميل الثلاثي *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: المهندس حسام علي"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">رقم الهاتف المحمول (واتساب) *</label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01012345678"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">اسم الجهاز المطلوبة *</label>
              <input
                type="text"
                required
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="ثلاجة / غسالة / شاشة..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">السعر الإجمالي (ج.م)</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                placeholder="35000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">مستوى الأولوية</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
            >
              <option value="high">عالية (High)</option>
              <option value="medium">متوسطة (Medium)</option>
              <option value="low">منخفضة (Low)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">ملاحظات أولية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات العميل والتوصيل..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء الطلب الآن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
