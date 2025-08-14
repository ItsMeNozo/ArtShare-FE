import Sidebar from '@/components/sidebar/app-sidebar';
import TopProgressBar from '@/components/TopProgressBar';
import UpgradePlanModal from '@/components/UpgradePlanModal';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import React, { useState } from 'react';

interface SearchLayoutProps {
  children: React.ReactNode;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({ children }) => {
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
      <div
        className={`z-50 flex h-full min-h-0 w-[calc(100vw-16rem)] flex-1 flex-col`}
      >
        <TopProgressBar />
        {/* No Header for search page */}
        <div className="flex-1 rounded-t-3xl">{children}</div>
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

export default SearchLayout;
