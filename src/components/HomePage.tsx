import React, { useState } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { Product } from '../types';

// Import 13 Homepage Sections
import { FeaturedHero } from './home/FeaturedHero';
import { NewArrivals } from './home/NewArrivals';
import { PopularProducts } from './home/PopularProducts';
import { CategoryGrid } from './home/CategoryGrid';
import { WhyChooseUs } from './home/WhyChooseUs';
import { BuyingProcessTimeline } from './home/BuyingProcessTimeline';
import { RecentlySold } from './home/RecentlySold';
import { SellDeviceCta } from './home/SellDeviceCta';
import { MaintenanceServiceCta } from './home/MaintenanceServiceCta';
import { VisitShowroom } from './home/VisitShowroom';
import { Testimonials } from './home/Testimonials';
import { FaqAccordion } from './home/FaqAccordion';
import { FinalCta } from './home/FinalCta';
import { QuickViewModal } from './home/QuickViewModal';

import {
  Sparkles,
  ShoppingBag,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useShowroom();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Top Main Hero Section */}
      <section className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 md:p-16 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Decorative Blurred Element */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-2xl flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>معرض الأجهزة المنزلية بقلب المعادي</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            مستقبل الأجهزة المنزلية <br />
            <span className="text-blue-600 dark:text-blue-400">في قلب المعادي.</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            معرض احترافي يجمع بين جودة الأجهزة الجديدة واقتصادية الأجهزة المستعملة المضمونة بحالة الفابريقة. تفضل بزيارتنا في شارع 68 المعادي أو اطلب أونلاين.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigateTo('products')}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>تصفح أجهزة المعرض</span>
            </button>
            <button
              onClick={() => navigateTo('sell')}
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>بيع جهازك لـ PRO TECK</span>
            </button>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 w-full">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ضمان معتمد من المعرض</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>المعادي شارع 68</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>02:00 PM - 01:00 AM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1) Featured Products Hero */}
      <FeaturedHero onQuickView={handleOpenQuickView} />

      {/* 2) New Arrivals */}
      <NewArrivals onQuickView={handleOpenQuickView} />

      {/* 3) Most Popular Products */}
      <PopularProducts onQuickView={handleOpenQuickView} />

      {/* 4) Product Categories */}
      <CategoryGrid />

      {/* 5) Why Choose PRO TECK */}
      <WhyChooseUs />

      {/* 6) How Buying Works */}
      <BuyingProcessTimeline />

      {/* 7) Recently Sold */}
      <RecentlySold />

      {/* 8) Sell Your Device */}
      <SellDeviceCta />

      {/* 9) Maintenance & Repair Services */}
      <MaintenanceServiceCta />

      {/* 10) Visit Our Showroom */}
      <VisitShowroom />

      {/* 11) Testimonials */}
      <Testimonials />

      {/* 12) FAQ */}
      <FaqAccordion />

      {/* 13) Final Call To Action */}
      <FinalCta />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={handleCloseQuickView}
      />
    </div>
  );
};
