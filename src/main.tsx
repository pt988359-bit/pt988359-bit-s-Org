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
