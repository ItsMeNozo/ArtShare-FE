import { PricingTier } from '@/components/ui/pricing-card';
import { PricingSection } from '@/components/ui/pricing-section';
import { useSubscriptionInfo } from '@/hooks/useSubscription';
import { BiError } from 'react-icons/bi';
import PlanHelpGuide from './components/PlanHelpGuide';

export const PAYMENT_FREQUENCIES = ['monthly', 'yearly'];

export const TIERS: PricingTier[] = [
  {
    id: 'individual',
    name: 'Starter',
    price: {
      monthly: 'Free',
      yearly: 'Free',
    },
    description: 'Used by art lovers',
    features: [
      'Showcase art & build public portfolio.',
      'Connect with artists community',
      'Generate AI art with daily credits.',
      'Explore AI artworks and prompts.',
      'Get prompt ideas from popular styles.',
      'Like, comment, follow, and share art.',
    ],
    cta: 'Get started',
    actionType: 'none',
  },
  {
    id: 'artist',
    name: 'Creative Pro',
    price: {
      monthly: 12,
      yearly: 10,
    },
    description: 'Great for professional content creators',
    features: [
      'Includes all Free plan features.',
      'Use advanced AI models for better art.',
      'Get a larger monthly AI quota.',
      'Generate high-res art without watermark.',
      'Gain commercial rights (T&Cs apply).',
      'Smarter, trend-based prompt suggestions.',
      'Organize art with portfolio collections.',
      'More storage for your artwork.',
    ],
    cta: 'Get started',
    actionType: 'checkout',
    popular: true,
  },
  {
    id: 'studio',
    name: 'Studios',
    price: {
      monthly: 30,
      yearly: 24,
    },
    description: 'Great for small/medium businesses',
    features: [
      'Everything in Creative Pro plan.',
      'Equip your team with collaborative tools (includes multiple user seats).',
      'Access a massive, shared pool of AI generation credits for team projects.',
      'Track team usage and artwork performance with analytics.',
      'Ensure faster workflows with top priority in the AI generation queue.',
      'Secure robust commercial rights suitable for agency and studio work.',
    ],
    cta: 'Get started',
    actionType: 'checkout',
  },
  {
    id: 'enterprise',
    name: 'Masterpiece',
    price: {
      monthly: 'Custom',
      yearly: 'Custom',
    },
    description: 'For Large art agencies & businesses',
    features: [
      'Everything in Studios plan.',
      'Receive a fully bespoke platform solution tailored to enterprise needs.',
      'Negotiate custom AI generation volumes, potentially unlimited.',
      'Secure enterprise-grade Service Level Agreements (SLAs).',
      'Discuss potential white-labeling solutions for your brand.',
      'Fund custom feature development specific to your requirements.',
    ],
    cta: 'Contact Us',
    actionType: 'contact',
    highlighted: true,
  },
];

const UserSubscription = () => {
  const {
    data: subscriptionInfo,
    isLoading: loadingSubscriptionInfo,
    isError: isSubscriptionError,
  } = useSubscriptionInfo();
  console.log('Subscription Info:', subscriptionInfo);
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
                  {subscriptionInfo?.plan === 'free'
                    ? 'Starter'
                    : subscriptionInfo?.plan}
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
