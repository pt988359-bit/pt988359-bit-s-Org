import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GlobalErrorHandler } from './core/services/GlobalErrorHandler.ts';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

GlobalErrorHandler.initialize();

// Route-conditional PWA logic: Gate manifest and Service Worker exclusively to /admin
if (typeof window !== 'undefined') {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Inject manifest dynamically for admin users
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Register service worker in production for admin routes only
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        try {
          navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('ServiceWorker registration failed:', err);
          });
        } catch (err) {
          console.warn('ServiceWorker error:', err);
        }
      });
    }
  } else {
    // Unregister any previous service worker registrations for non-admin visitors
    if ('serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {});
          });
        }).catch(() => {});
      } catch {
        // Silent catch with no console.error
      }
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

