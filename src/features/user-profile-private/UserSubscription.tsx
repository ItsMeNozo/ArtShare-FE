import { PricingSection } from '@/components/ui/pricing-section';
import { PAYMENT_FREQUENCIES, TIERS } from '@/constants/planTiers';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BiError } from 'react-icons/bi';
import { useSearchParams } from 'react-router-dom';
import PlanHelpGuide from './components/PlanHelpGuide';

const UserSubscription = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
    isError: isSubscriptionError,
  } = useSubscriptionInfo();
  console.log('Subscription Info:', subscriptionInfo);

  useEffect(() => {
    if (searchParams.get('stripe_portal_return')) {
      console.log(
        'Returned from Stripe portal, invalidating subscription info...',
      );

      queryClient.invalidateQueries({ queryKey: ['subscriptionInfo'] });

      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, queryClient]);

  return (
    <div className="sidebar flex h-[calc(100vh-4rem)] w-full flex-col overflow-y-auto p-4 pb-16 select-none">
      <div className="flex w-full items-center justify-center">
        <div className="relative flex h-48 w-112 flex-col items-center space-y-2 rounded-3xl bg-gradient-to-r from-indigo-100 to-purple-100 p-4">
          {loadingSubscriptionInfo ? (
            <div className="flex h-full w-full animate-pulse items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : isSubscriptionError ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <BiError className="size-16 text-red-800" />
              <p className="text-red-800">Error loading subscription info</p>
              <button
                className="mt-2 cursor-pointer rounded-lg bg-indigo-500 px-4 py-2 text-white hover:brightness-105"
                onClick={() => window.location.reload()}
              >
                <span>Reload page</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <p className="font-thin">Your current plan</p>
                <h1 className="inline-block bg-gradient-to-r from-blue-700 via-purple-500 to-indigo-400 bg-clip-text text-2xl font-medium text-transparent">
                  {
                    TIERS.find((tier) => tier.id === subscriptionInfo?.plan)
                      ?.name
                  }
                </h1>
              </div>
              <p className="text-sm font-thin">
                {subscriptionInfo?.plan === 'free'
                  ? 'Free to use'
                  : subscriptionInfo?.expiresAt.toLocaleDateString()}
              </p>
              <div className="absolute bottom-4 flex h-16 w-64 cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-2 shadow-md">
                <p className="text-mountain-400 text-sm">
                  Your Token Remaining
                </p>
                <span className="text-lg font-medium">
                  {subscriptionInfo?.aiCreditRemaining}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <hr className="border-mountain-100 my-8 flex w-full border-[1px]" />
      <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
      <hr className="border-mountain-100 my-8 flex w-full border-[1px]" />
      <PlanHelpGuide />
    </div>
  );
};

export default UserSubscription;
