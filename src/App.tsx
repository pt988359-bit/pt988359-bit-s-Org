import React, { useEffect, Suspense, lazy } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { ShowroomProvider, useShowroom } from './context/ShowroomContext';
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLoginModal } from './components/customer/CustomerLoginModal';
import { ProductionDiagnosticsPanel } from './components/ui/ProductionDiagnosticsPanel';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AdminAccessGate } from './components/admin/AdminAccessGate';

const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));

const AppRouter: React.FC = () => {
  const { currentRoute, navigateTo } = useShowroom();

  // Check URL path or hash on initial load
  useEffect(() => {
    const rawPath = window.location.pathname;
    const path = rawPath.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Check if path matches /product-detail/{productId}
    const productDetailMatch = rawPath.match(/\/product-detail\/([^/?#]+)/i) || window.location.hash.match(/product-detail\/([^/?#]+)/i);
    if (productDetailMatch && productDetailMatch[1]) {
      const extractedId = decodeURIComponent(productDetailMatch[1]);
      navigateTo('product-detail', { productId: extractedId });
      return;
    }

    if (path.includes('/portal') || hash.includes('portal')) {
      navigateTo('my-activity');
    } else if (path.includes('/admin') || hash.includes('admin')) {
      if (!currentRoute.startsWith('admin')) {
        navigateTo('admin-dashboard');
      }
    }
  }, []);

  // Route check for admin routes
  if (currentRoute.startsWith('admin')) {
    return (
      <AdminAccessGate>
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-sans dir-rtl">جاري تحميل لوحة التحكم...</div>}>
          <AdminLayout />
        </Suspense>
      </AdminAccessGate>
    );
  }

  // Default: Public Website Layout (Customer Workspace)
  return <PublicLayout />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmationProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <ShowroomProvider>
                <AppRouter />
                <CustomerLoginModal />
                <ProductionDiagnosticsPanel />
              </ShowroomProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </ConfirmationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
