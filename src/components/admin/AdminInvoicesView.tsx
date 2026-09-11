import React from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Invoice } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Table } from '../ui/Table';
import { FileText, Printer, CheckCircle } from 'lucide-react';

export const AdminInvoicesView: React.FC = () => {
  const { invoices } = useShowroom();

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            سجل الفواتير الرسمية وضمان المعرض ({invoices.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">الفواتير الضريبية المسجلة وشهادات الضمان الصادرة بفرع المعادي</p>
        </CardHeader>

        <CardBody className="p-6">
          <Table<Invoice>
            data={invoices}
            keyExtractor={(i) => i.id}
            columns={[
              { header: 'رقم الفاتورة', accessorKey: 'invoiceNumber' },
              { header: 'العميل', accessorKey: 'customerName' },
              { header: 'الهاتف', accessorKey: 'customerPhone' },
              { header: 'الإجمالي', cell: (i) => `${i.totalAmount.toLocaleString()} ج.م` },
              { header: 'تاريخ الإصدار', accessorKey: 'issueDate' },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
};
