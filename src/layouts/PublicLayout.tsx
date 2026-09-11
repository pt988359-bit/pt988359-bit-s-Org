import React, { Suspense, lazy } from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HomePage } from '../components/HomePage';
import { FloatingContactWidget } from '../components/FloatingContactWidget';
import { Skeleton } from '../components/ui/Skeleton';

// Lazy loaded secondary views
const CatalogPage = lazy(() => import('../components/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductDetailPage = lazy(() => import('../components/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CategoriesPage = lazy(() => import('../components/public/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const SellRequestPage = lazy(() => import('../components/SellRequestPage').then(m => ({ default: m.SellRequestPage })));
const ReservationCartPage = lazy(() => import('../components/ReservationCartPage').then(m => ({ default: m.ReservationCartPage })));
const ContactPage = lazy(() => import('../components/ContactPage').then(m => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('../components/public/AboutPage').then(m => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('../components/public/FaqPage').then(m => ({ default: m.FaqPage })));
const InvoiceVerifyPage = lazy(() => import('../components/public/InvoiceVerifyPage').then(m => ({ default: m.InvoiceVerifyPage })));
const MyActivityPage = lazy(() => import('../components/customer/MyActivityPage').then(m => ({ default: m.MyActivityPage })));
const NotFoundPage = lazy(() => import('../components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoaderFallback = () => (
  <div className="py-12 space-y-6 max-w-5xl mx-auto dir-rtl">
    <Skeleton className="h-12 w-3/4 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    <Skeleton className="h-64 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <Skeleton className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <Skeleton className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

export const PublicLayout: React.FC = () => {
  const { currentRoute } = useShowroom();

  const renderPublicRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <CatalogPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'sell':
        return <SellRequestPage />;
      case 'reservation':
        return <ReservationCartPage />;
      case 'contact':
        return <ContactPage />;
      case 'about':
        return <AboutPage />;
      case 'faq':
        return <FaqPage />;
      case 'verify-invoice':
        return <InvoiceVerifyPage />;
      case 'my-activity':
        return <MyActivityPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Suspense fallback={<PageLoaderFallback />}>
          {renderPublicRoute()}
        </Suspense>
      </main>
      <Footer />
      <FloatingContactWidget />
    </div>
  );
};
