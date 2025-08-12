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

  useEffect(() => {
    if (searchParams.get('stripe_portal_return')) {
      queryClient.invalidateQueries({ queryKey: ['subscriptionInfo'] });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, queryClient]);

  return (
    <div className="flex flex-col p-4 pb-16 rounded-t-3xl w-full h-[calc(100vh-4rem)] overflow-y-auto select-none sidebar">
      <div className="flex justify-center items-center w-full">
        <div className="relative flex flex-col items-center space-y-2 bg-gradient-to-r from-indigo-100 to-purple-100 p-4 border border-mountain-200 rounded-3xl w-112 h-48">
          {loadingSubscriptionInfo ? (
            <div className="flex justify-center items-center w-full h-full animate-pulse">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : isSubscriptionError ? (
            <div className="flex flex-col justify-center items-center w-full h-full">
              <BiError className="size-16 text-red-800" />
              <p className="text-red-800">Error loading subscription info</p>
              <button
                className="bg-indigo-500 hover:brightness-105 mt-2 px-4 py-2 rounded-lg text-white cursor-pointer"
                onClick={() => window.location.reload()}
              >
                <span>Reload page</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <p className="font-thin">Your current plan</p>
                <h1 className="inline-block bg-clip-text bg-gradient-to-r from-blue-700 via-purple-500 to-indigo-400 font-medium text-transparent text-2xl">
                  {
                    TIERS.find((tier) => tier.id === subscriptionInfo?.plan)
                      ?.name
                  }
                </h1>
              </div>
              <p className="font-thin text-sm">
                {subscriptionInfo?.plan === 'free'
                  ? 'Free to use'
                  : subscriptionInfo?.expiresAt.toLocaleDateString()}
              </p>
              <div className="bottom-4 absolute flex flex-col justify-center items-center bg-white shadow-md p-2 rounded-lg w-64 h-16 cursor-pointer">
                <p className="text-mountain-400 text-sm">
                  Your Token Remaining
                </p>
                <span className="font-medium text-lg">
                  {subscriptionInfo?.aiCreditRemaining}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <hr className="flex my-8 border-[1px] border-mountain-100 w-full" />
      <PricingSection frequencies={PAYMENT_FREQUENCIES} tiers={TIERS} />
      <hr className="flex my-8 border-[1px] border-mountain-100 w-full" />
      <PlanHelpGuide />
    </div>
  );
};

export default UserSubscription;
