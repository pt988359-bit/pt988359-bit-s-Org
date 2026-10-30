import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GlobalErrorHandler } from './core/services/GlobalErrorHandler.ts';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

GlobalErrorHandler.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register minimal PWA service worker in production only
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
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

