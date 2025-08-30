import { SpeedInsights } from '@vercel/speed-insights/react';
import React, { Suspense } from 'react';
import './App.css';
import Loading from './components/loading/Loading';

// Context/Provider
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { NotificationsProvider } from '@/contexts/NotificationsProvider';
import { GlobalSearchProvider } from '@/contexts/SearchProvider';
import { UserProvider } from '@/contexts/user/UserProvider';
import { RouterProvider } from 'react-router-dom';
import { ComposeProviders } from './contexts/ComposeProviders';
import { LoadingProvider } from './contexts/Loading/LoadingProvider';
import { router } from './routes';
import { TooltipProvider } from './components/ui/tooltip';

const App: React.FC = () => {
  // The order here is the same as the nesting order (outermost first)
  const providers = [
    LoadingProvider,
    UserProvider,
    NotificationsProvider,
    LanguageProvider,
    GlobalSearchProvider,
    TooltipProvider
  ];

  return (
    <ComposeProviders providers={providers}>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
      <SpeedInsights debug={import.meta.env.DEV} />
    </ComposeProviders>
  );
};

export default App;
