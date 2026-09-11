import React, { useState } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { Card, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Search, FileCheck, ShieldCheck, AlertCircle, Calendar, User, DollarSign } from 'lucide-react';
import { Invoice } from '../../types';

export const InvoiceVerifyPage: React.FC = () => {
  const { invoices } = useShowroom();
  const [searchNum, setSearchNum] = useState('');
  const [searchedInvoice, setSearchedInvoice] = useState<Invoice | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNum.trim()) return;

    setHasSearched(true);
    const found = invoices.find(
      (inv) => inv.invoiceNumber.toLowerCase().trim() === searchNum.toLowerCase().trim()
    );
    setSearchedInvoice(found || null);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="text-center flex flex-col gap-3 py-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-4 py-1.5 rounded-full w-fit mx-auto">
          التحقق الرقمي من الفواتير
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          تأكيد صحة فاتورة معرض PRO TECK
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          أدخل رقم الفاتورة الرسمي للتحقق من بيانات الضمان، المبيعات، ومطابقة الرقم المرجعي بمعرض المعادي.
        </p>
      </div>

      {/* Search Input Box */}
      <Card className="p-6">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="أدخل رقم الفاتورة (مثال: INV-2026-042)"
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value)}
              className="text-center font-mono font-bold text-lg"
            />
          </div>
          <Button variant="electric" type="submit" leftIcon={<Search className="w-4 h-4" />}>
            التحقق الآن
          </Button>
        </form>
      </Card>

      {/* Verification Result */}
      {hasSearched && (
        <div>
          {searchedInvoice ? (
            <Card className="border-2 border-emerald-500 overflow-hidden shadow-xl">
              <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-100 font-bold">فاتورة موثقة رسمياً</span>
                    <h2 className="text-2xl font-black">{searchedInvoice.invoiceNumber}</h2>
                  </div>
                </div>
                <Badge status="available" />
              </div>

              <CardBody className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">اسم العميل</span>
                      <span className="font-bold">{searchedInvoice.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">تاريخ الإصدار</span>
                      <span className="font-bold">{searchedInvoice.issueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">إجمالي الفاتورة</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {searchedInvoice.totalAmount.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-xs text-slate-400 block">حالة الضمان بالمعرض</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">ساري ومسجل بالمشروع</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="font-bold text-sm mb-3">الأجهزة المشمولة بالفاتورة:</h4>
                  <div className="flex flex-col gap-2">
                    {searchedInvoice.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                      >
                        <span>{item.description}</span>
                        <span>
                          {item.qty} × {item.unitPrice.toLocaleString()} = {item.total.toLocaleString()} ج.م
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="p-8 text-center border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">لم يتم العثور على الفاتورة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تأكد من إدخال الرقم كما هو مكتوب في الفاتورة الورقية أو الرسالة النصية (مثال: INV-2026-042).
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
