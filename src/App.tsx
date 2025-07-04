import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Loading from './components/loading/Loading';
import { AppRoutes } from './routes';

// Context/Provider
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { NotificationsProvider } from '@/contexts/NotificationsProvider';
import { GlobalSearchProvider } from '@/contexts/SearchProvider';
import { UserProvider } from '@/contexts/user/UserProvider';
import { ComposeProviders } from './contexts/ComposeProviders';
import { LoadingProvider } from './contexts/Loading/LoadingProvider';

const App: React.FC = () => {
  // The order here is the same as the nesting order (outermost first)
  const providers = [
    LoadingProvider,
    UserProvider,
    NotificationsProvider,
    LanguageProvider,
    GlobalSearchProvider,
  ];

  return (
    <BrowserRouter>
      <ComposeProviders providers={providers}>
        <Suspense fallback={<Loading />}>
          <AppRoutes />
        </Suspense>
      </ComposeProviders>
    </BrowserRouter>
  );
};

export default App;
