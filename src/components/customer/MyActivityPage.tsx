import React, { useState, useEffect } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { getCustomerAggregatedData } from '../../utils/portalStorage';
import { getFavorites, getRecentlyViewed, toggleFavoriteInStorage } from '../../utils/customerStorage';
import { PrintableReceiptModal } from './PrintableReceiptModal';
import { Button } from '../ui/Button';
import {
  UserCheck,
  ShoppingBag,
  Sparkles,
  CreditCard,
  RefreshCw,
  FileText,
  Heart,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const MyActivityPage: React.FC = () => {
  const { products, getProductById, navigateTo, settings } = useShowroom();
  const { customer, isCustomerAuthenticated, openLoginModal } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<
    'timeline' | 'purchases' | 'reservations' | 'trade_sell' | 'documents' | 'warranties' | 'favorites' | 'history'
  >('timeline');

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Favorites & View History from local storage
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [viewHistory, setViewHistory] = useState<string[]>(getRecentlyViewed());

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteInStorage(id);
    setFavorites(getFavorites());
  };

  const favoriteProducts = favorites
    .map((id) => getProductById(id))
    .filter((p): p is typeof products[0] => p !== undefined);

  const historyProducts = viewHistory
    .map((id) => getProductById(id))
    .filter((p): p is typeof products[0] => p !== undefined);

  if (!isCustomerAuthenticated || !customer) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-center animate-fadeIn">
        <div className="p-10 sm:p-14 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-md">
            <UserCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              سجلي وطلباتي الموحدة في PRO TECK
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              قم بتسجيل الدخول السريع برقم هاتفك المصري وتأكيد الهوية عبر كود التحقق (OTP) لاستعراض كافة طلبات الشراء، الحجوزات، إيصالات العرابين، شهادات الضمان، وطلبات البيع والاستبدال الخاصة بك.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-3 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => openLoginModal()}
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>تسجيل الدخول وتوثيق الهوية</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold"
              onClick={() => navigateTo('products')}
            >
              تصفح الأجهزة والمعرض
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Aggregate Customer Data filtered cleanly by customer phone
  const data = getCustomerAggregatedData(customer.phone);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Customer Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            {customer.name ? customer.name.charAt(0) : 'C'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-white">{customer.name || 'عميل PRO TECK المميز'}</h1>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                هوية موثقة (OTP)
              </span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                {customer.id}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span dir="ltr" className="inline-block font-mono" style={{ unicodeBidi: 'isolate' }}>{customer.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{customer.email}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>عضو منذ {new Date(customer.createdAt).toLocaleDateString('ar-EG')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('products')}
            leftIcon={<ShoppingBag className="w-4 h-4 text-blue-400" />}
            className="w-full md:w-auto"
          >
            تصفح أجهزة المعرض
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>السجل الزمني ({data.timelineEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>الشراء والمبيعات ({data.purchaseRequests.length + data.completedSales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'reservations'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>الحجوزات ({data.reservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trade_sell')}

          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'trade_sell'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>البيع والاستبدال ({data.sellRequests.length + data.exchangeRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>المستندات الإيصالات ({data.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warranties')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'warranties'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>الضمان المعتمد ({data.warranties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>المفضلة ({favoriteProducts.length})</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {data.timelineEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد أحداث زمنية مسجلة حالياً</h3>
              <p className="text-xs text-slate-400">أي طلبات أو حجوزات تجريها بالمعرض ستظهر في السجل الزمني فوراً.</p>
            </div>
          ) : (
            <div className="relative border-r-2 border-slate-800 mr-4 pr-6 space-y-6">
              {data.timelineEvents.map((ev) => (
                <div key={ev.id} className="relative group">
                  <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-950"></div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-blue-400">{ev.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{ev.description}</p>
                    {ev.referenceNumber && (
                      <span className="inline-block text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md mt-1">
                        مرجع: {ev.referenceNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Purchases */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {data.purchaseRequests.length === 0 && data.completedSales.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد طلبات شراء مسجلة حالياً</h3>
              <p className="text-xs text-slate-400">يمكنك الشراء الفوري أو طلب المعاينة المباشرة لأي جهاز بالمعرض.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.purchaseRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      {req.referenceNumber}
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      طلب معاينة بالمعرض
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={req.productImage || 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=300&q=80'} alt={req.productTitle} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{req.productTitle}</h4>
                      <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
                        {req.productPrice.toLocaleString()} {settings.currencySymbol}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {data.completedSales.map((sale) => (
                <div key={sale.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      فاتورة: {sale.invoiceNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      شراء مكتمل ومعتمد
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={sale.productImage} alt={sale.productTitle} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{sale.productTitle}</h4>
                      <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
                        {sale.finalPrice.toLocaleString()} {settings.currencySymbol}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Reservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {data.reservations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد حجوزات مسجلة</h3>
              <p className="text-xs text-slate-400">احجز أجهزتك المفضلة لمدة 24 ساعة لضمان عدم بيعها لشخص آخر.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.reservations.map((res) => (
                <div key={res.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {res.reservationNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      حالة الحجز: {res.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={res.productImage || 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=300&q=80'} alt={res.productTitle} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{res.productTitle}</h4>
                      <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
                        السعر: {res.productPrice?.toLocaleString()} {settings.currencySymbol}
                      </span>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Trade & Sell */}

      {activeTab === 'trade_sell' && (
        <div className="space-y-4">
          {data.sellRequests.length === 0 && data.exchangeRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <RefreshCw className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد طلبات بيع أو استبدال مسجلة</h3>
              <p className="text-xs text-slate-400">يمكنك بيع جهازك القديم للمعرض أو استبداله بأجهزة حديثة وفارق كاش.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.sellRequests.map((sr: any) => (
                <div key={sr.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      {sr.referenceNumber || sr.requestNumber || `SELL-${sr.id}`}
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      طلب بيع جهاز للمعرض
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{sr.deviceTitle || sr.deviceName || sr.applianceType || 'جهاز مباع للمعرض'}</h4>
                  <p className="text-xs text-slate-400">السعر المتوقع: <span className="font-bold text-emerald-400">{(sr.expectedPrice || sr.askingPrice || 0).toLocaleString()} ج.م</span></p>
                </div>
              ))}

              {data.exchangeRequests.map((ex: any) => (
                <div key={ex.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {ex.referenceNumber || ex.requestNumber || `EXC-${ex.id}`}
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      طلب استبدال
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">استبدال: {ex.oldDeviceTitle || ex.currentApplianceType} ⬅️ {ex.targetProductTitle || ex.desiredProductTitle}</h4>
                  <p className="text-xs text-slate-400">الفارق المطلوب: <span className="font-bold text-emerald-400">{(ex.cashDifference || ex.estimatedTradeValue || 0).toLocaleString()} ج.م</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {data.documents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد مستندات مستخرجة بعد</h3>
              <p className="text-xs text-slate-400">يتم توليد إيصالات المستندات تلقائياً عند إتمام طلبات الحجز أو الشراء.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.documents.map((doc) => (
                <div key={doc.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                        {doc.documentNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(doc.issueDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                    <p className="text-xs text-slate-400">{doc.productTitle}</p>
                  </div>

                  <Button
                    variant="electric"
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => setSelectedDoc(doc)}
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                  >
                    عرض واستخراج الإيصال
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Warranties */}
      {activeTab === 'warranties' && (
        <div className="space-y-4">
          {data.warranties.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد شهادات ضمان مفعلة</h3>
              <p className="text-xs text-slate-400">تحصل على شهادة ضمان معتمدة لمدة 12 شهراً فور إتمام الشراء بالمعرض.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.warranties.map((w) => (
                <div key={w.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      {w.warrantyNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      ضمان ساري ومفعل
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={w.productImage} alt={w.productTitle} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{w.productTitle}</h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">الرقم التسلسلي: {w.serialNumber}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div>مدة الضمان: <strong className="text-white">12 شهراً شاشات وأجهزة منزلية</strong></div>
                    <div>سياسة الاستبدال: <span className="text-slate-400">{w.replacementPolicy}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Heart className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">قائمة المفضلة فارغة</h3>
              <p className="text-xs text-slate-400">اضغط على رمز القلب على أي جهاز لحفظه في قائمة المفضلة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteProducts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-3 relative group"
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-950">
                    <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'} alt={item.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-xl bg-slate-900/80 text-rose-500 border border-slate-700 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-blue-400 font-bold block">{item.brand}</span>
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
                      {item.price.toLocaleString()} {settings.currencySymbol}
                    </span>
                  </div>

                  <Button
                    variant="silver"
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => navigateTo('product-detail', { productId: item.id })}
                  >
                    معاينة الجهاز
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      <PrintableReceiptModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
};
