import Header from '@/components/header/app-header';
import Sidebar from '@/components/sidebar/app-sidebar';
import TopProgressBar from '@/components/TopProgressBar';
import UpgradePlanModal from '@/components/UpgradePlanModal';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import React, { useState } from 'react';

const InAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expandSidebar, setExpandSidebar] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
    isError: isSubscriptionError,
  } = useSubscriptionInfo();

  return (
    <div className={`relative flex h-screen min-h-0 w-full flex-row`}>
      <Sidebar
        expand={expandSidebar}
        setExpand={setExpandSidebar}
        userRole={subscriptionInfo?.plan || null}
        onShowUpgradeModal={() => setShowUpgradeModal(true)}
      />
      <div className={`z-50 flex h-full min-h-0 w-[calc(100vw-16rem)] flex-1 flex-col`}>
        <TopProgressBar />
        <Header />
        <div className="flex-1 bg-[#F2F4F7] dark:from-mountain-1000 dark:to-mountain-900 border border-mountain-100 dark:border-black rounded-t-3xl transition-shadow duration-300">
          {children}
        </div>
      </div>
      {showUpgradeModal && (
        <UpgradePlanModal
          loading={loadingSubscriptionInfo}
          error={isSubscriptionError}
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

export default InAppLayout;
