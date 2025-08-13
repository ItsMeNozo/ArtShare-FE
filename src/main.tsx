import { ThemeProvider } from '@/contexts/ThemeProvider'; // Your custom theme context
import { StyledEngineProvider } from '@mui/material/styles';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppThemeProvider } from './contexts/AppThemeProvider.tsx';
import { FocusProvider } from './contexts/focus/FocusProvider.tsx';
import { SnackbarProvider } from './contexts/SnackbarProvider.tsx';
import './index.css';

import TimeAgo from 'javascript-time-ago';

import en from 'javascript-time-ago/locale/en';
import vi from 'javascript-time-ago/locale/vi';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import MobileBlocker from './components/MobileBlocker.tsx';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(vi);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds instead of 5 minutes
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection time instead of 30
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.sessionStorage,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 2, // Only persist for 2 minutes
  buster: '1.0.1', // Updated version buster to clear old cached data
});

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppThemeProvider>
            <SnackbarProvider>
              <FocusProvider>
                <Elements stripe={stripePromise}>
                  <MobileBlocker>
                    <App />
                  </MobileBlocker>
                </Elements>
              </FocusProvider>
            </SnackbarProvider>
          </AppThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
