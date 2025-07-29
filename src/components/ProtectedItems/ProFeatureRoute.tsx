import React from 'react';
import Loading from '../loading/Loading';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import NoPermissionPage from '@/pages/NoPermission/NoPermission';

const ProFeatureRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
  } = useSubscriptionInfo();
  if (loadingSubscriptionInfo) return <Loading />;
  if (subscriptionInfo?.plan === 'free') return <NoPermissionPage />;
  return <>{children}</>;
};

export default ProFeatureRoute;
