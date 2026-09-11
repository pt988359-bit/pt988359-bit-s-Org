import React from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Wrench,
  PiggyBank,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { FinancialTimelineEvent } from '../../../types/adminFinance';

interface FinancialTimelineTabProps {
  timelineEvents: FinancialTimelineEvent[];
}

const EVENT_ICONS: Record<string, { icon: React.ReactNode; color: string; border: string }> = {
  reservation: {
    icon: <PiggyBank className="w-4 h-4 text-emerald-400" />,
    color: 'bg-emerald-500/10 text-emerald-400',
    border: 'border-emerald-500/20',
  },
  expense: {
    icon: <TrendingDown className="w-4 h-4 text-rose-400" />,
    color: 'bg-rose-500/10 text-rose-400',
    border: 'border-rose-500/20',
  },
  purchase: {
    icon: <ShoppingCart className="w-4 h-4 text-blue-400" />,
    color: 'bg-blue-500/10 text-blue-400',
    border: 'border-blue-500/20',
  },
  large_repair: {
    icon: <Wrench className="w-4 h-4 text-amber-400" />,
    color: 'bg-amber-500/10 text-amber-400',
    border: 'border-amber-500/20',
  },
  sale: {
    icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
    color: 'bg-purple-500/10 text-purple-400',
    border: 'border-purple-500/20',
  },
  refund: {
    icon: <RefreshCw className="w-4 h-4 text-slate-400" />,
    color: 'bg-slate-800 text-slate-300',
    border: 'border-slate-700',
  },
  profit_event: {
    icon: <PiggyBank className="w-4 h-4 text-teal-400" />,
    color: 'bg-teal-500/10 text-teal-400',
    border: 'border-teal-500/20',
  },
};

export const FinancialTimelineTab: React.FC<FinancialTimelineTabProps> = ({ timelineEvents }) => {
  return (
    <div className="space-y-6 dir-rtl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          الجدول الزمني المالي وتتبع الأحداث (Financial Timeline Stream)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          تسلسل زمني حي لكافة الأحداث المالية (مبيعات، مشتريات، عربون، صيانة، ومصروفات) بالدقيقة والساعة مع هوية المُسجّل.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="relative border-r-2 border-slate-800 mr-4 pr-6 space-y-8">
          {timelineEvents.map((evt) => {
            const config = EVENT_ICONS[evt.type] || EVENT_ICONS['expense'];
            return (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot Icon */}
                <div
                  className={`absolute -right-[35px] top-0 w-8 h-8 rounded-xl border flex items-center justify-center shadow-lg ${config.color} ${config.border}`}
                >
                  {config.icon}
                </div>

                {/* Card Container */}
                <div className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-2 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 border border-slate-800 text-blue-400">
                        {evt.referenceNumber}
                      </span>
                      <h4 className="text-sm font-black text-white">{evt.title}</h4>
                    </div>

                    <span className="text-sm font-mono font-black text-emerald-400">
                      {evt.amount.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-bold leading-relaxed">{evt.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                    <span className="flex items-center gap-1 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      بواسطة: {evt.actor}
                    </span>
                    <span className="font-mono">{new Date(evt.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
