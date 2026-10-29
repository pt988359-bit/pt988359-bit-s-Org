import React, { useState } from 'react';
import { PurchaseRequest } from '../../../types/orderManagementCenter';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Clock, User, AlertCircle } from 'lucide-react';

interface OrderCalendarViewProps {
  purchaseRequests: PurchaseRequest[];
  onSelectOrder: (item: any, type: string) => void;
}

export const OrderCalendarView: React.FC<OrderCalendarViewProps> = ({
  purchaseRequests,
  onSelectOrder,
}) => {
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');

  // Days of current month simulation
  const today = new Date();
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-xs text-slate-100 dir-rtl">
      {/* Calendar Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">جدول مواعيد طلبات الشراء والمعاينات (Calendar View)</h3>
            <p className="text-slate-400 text-[11px]">تتبع مواعيد طلبات الشراء والمعاينة بالفرع</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setCalendarMode('day')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
              calendarMode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            يومي (Day)
          </button>
          <button
            onClick={() => setCalendarMode('week')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
              calendarMode === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            أسبوعي (Week)
          </button>
          <button
            onClick={() => setCalendarMode('month')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
              calendarMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            شهري (Month)
          </button>
        </div>
      </div>

      {/* Calendar Grid Header (Days of week) */}
      <div className="grid grid-cols-7 gap-2 text-center font-black text-slate-400 text-[11px]">
        <div>الأحد</div>
        <div>الإثنين</div>
        <div>الثلاثاء</div>
        <div>الأربعاء</div>
        <div>الخميس</div>
        <div>الجمعة</div>
        <div>السبت</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((dayNum) => {
          // Find matching purchase requests for this day
          const matchedRequests = purchaseRequests.filter((r) => new Date(r.createdAt).getDate() % 30 === dayNum % 30);
          const isToday = dayNum === today.getDate();

          return (
            <div
              key={dayNum}
              className={`min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                isToday
                  ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {dayNum}
                </span>
                {matchedRequests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>

              {/* Scheduled Event Chips */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                {matchedRequests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => onSelectOrder(req, 'request')}
                    className="w-full text-right p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-[10px] text-blue-300 font-bold block truncate cursor-pointer"
                  >
                    📦 {req.referenceNumber} - {req.customerName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
