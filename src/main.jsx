import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { PeriodProvider } from './state/period-context';
import { ToastProvider } from './state/toast-context';
import { UIProvider } from './state/ui-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PeriodProvider>
        <ToastProvider>
          <UIProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UIProvider>
        </ToastProvider>
      </PeriodProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
