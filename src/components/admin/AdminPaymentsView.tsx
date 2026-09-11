import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { BUSINESS_CONFIG } from '../../config/businessConfig';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CreditCard, QrCode, CheckCircle2 } from 'lucide-react';

export const AdminPaymentsView: React.FC = () => {
  const { settings, updateSettings } = useShowroom();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            إدارة حسابات إنستا باي InstaPay والمدفوعات
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إعداد المعرف الرسمي لقبول العربون والدفع الإلكتروني المباشر للمعرض
          </p>
        </CardHeader>

        <CardBody className="p-6 max-w-2xl flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
            يتم توجيه جميع مبالغ العربون (1000 ج.م) لحساب الإنستا باي المحدد أدناه. فور التحويل يرفع العميل إيصال الدفع للتأكيد الآلي.
          </div>

          <Input
            label="معرف حساب إنستا باي InstaPay Handle"
            value={settings.instapay.accountHandle}
            onChange={(e) =>
              updateSettings({
                instapay: { ...settings.instapay, accountHandle: e.target.value },
              })
            }
            placeholder={BUSINESS_CONFIG.instapay.accountHandle}
          />

          <Input
            label="رابط رمز الاستجابة السريعة (QR Code Image URL)"
            value={settings.instapay.qrCodeUrl || ''}
            onChange={(e) =>
              updateSettings({
                instapay: { ...settings.instapay, qrCodeUrl: e.target.value },
              })
            }
            placeholder="https://..."
          />

          <Button variant="electric" className="w-fit">
            حفظ إعدادات إنستا باي
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
