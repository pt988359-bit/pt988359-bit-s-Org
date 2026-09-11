import React, { useState } from 'react';
import { Customer } from '../../../types/customerHub';
import { ShoppingBag, BookmarkCheck, DollarSign, Percent, RefreshCw, Repeat, X, Save } from 'lucide-react';

interface CreateRequestModalProps {
  customer: Customer;
  onClose: () => void;
  onCreate: (requestType: string, payload: any) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  customer,
  onClose,
  onCreate,
}) => {
  const [requestType, setRequestType] = useState<
    'purchase' | 'reservation' | 'negotiation' | 'sell' | 'exchange'
  >('purchase');

  const [productTitle, setProductTitle] = useState('ثلاجة LG InstaView 24 قدم نوفروست استيل');
  const [price, setPrice] = useState(45500);
  const [amount, setAmount] = useState(2000);
  const [durationHours, setDurationHours] = useState(24);
  const [deviceDescription, setDeviceDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requestType === 'purchase') {
      onCreate('purchase', {
        product: {
          id: `prod-${Date.now()}`,
          title: productTitle,
          brand: 'LG',
          price,
          warrantyAvailable: true,
          condition: 'certified_refurbished',
          image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        },
      });
    } else if (requestType === 'reservation') {
      onCreate('reservation', {
        product: {
          id: `prod-${Date.now()}`,
          title: productTitle,
          brand: 'LG',
          price,
          image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        },
        durationHours: 24,
      });
    } else if (requestType === 'negotiation') {
      onCreate('negotiation', {
        product: {
          id: `prod-${Date.now()}`,
          title: productTitle,
          originalPrice: price,
          image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        },
        suggestedPrice: price - amount,
        notes: deviceDescription,
      });
    } else if (requestType === 'sell') {
      onCreate('sell', {
        deviceTitle: productTitle,
        expectedPrice: price,
        offeredPrice: price - 2000,
        description: deviceDescription,
      });
    } else if (requestType === 'exchange') {
      onCreate('exchange', {
        oldDeviceTitle: productTitle,
        oldDeviceEstimatedValue: price / 2,
        targetProductTitle: 'غسالة ملابس LG Direct Drive',
        targetProductPrice: price,
        cashDifference: price - price / 2,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-sm text-white">إضافة طلب جديد لـ {customer.fullName}</h2>
            <p className="text-slate-400 text-[11px]">اختر نوع الطلب وأدخل التفاصيل المطلوبة</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">اختر نوع الطلب:</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="purchase">1. طلب شراء جهاز (Purchase Request)</option>
              <option value="reservation">2. طلب حجز جهاز (Reservation Request - 24 Hours)</option>
              <option value="negotiation">3. طلب تفاوض على السعر (Negotiation)</option>
              <option value="sell">4. طلب بيع جهاز من العميل للشركة (Sell Device)</option>
              <option value="exchange">5. طلب استبدال جهاز (Exchange Request)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">اسم الجهاز/المنتج المعني:</label>
            <input
              type="text"
              required
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">سعر الجهاز الإجمالي (ج.م):</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500"
              />
            </div>

            {requestType === 'negotiation' && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">السعر المقترح (ج.م)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-extrabold focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 block">ملاحظات أو وصف إضافي:</label>
            <textarea
              rows={2}
              value={deviceDescription}
              onChange={(e) => setDeviceDescription(e.target.value)}
              placeholder="اكتب أي ملاحظات خاصة بالطلب..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
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
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition-all cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>إصدار الطلب الآن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
