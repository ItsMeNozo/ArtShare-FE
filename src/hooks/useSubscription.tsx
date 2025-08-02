import {
  getSubscriptionInfo,
  SubscriptionInfoDto,
  SubscriptionPlan,
} from '@/api/subscription/get-subscription-info.api';
import { useUser } from '@/contexts/user';
import { useQuery } from '@tanstack/react-query';

export const useSubscriptionInfo = () => {
  const { user } = useUser();
  const accessToken = localStorage.getItem('accessToken');
  return useQuery<SubscriptionInfoDto, Error>({
    queryKey: ['subscriptionInfo', user?.id],
    queryFn: getSubscriptionInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => ({
      ...data,
      expiresAt: new Date(data.expiresAt),
    }),
    enabled: !!accessToken,
  });
};

export const getDisplayPlanName = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return 'Free';
    case SubscriptionPlan.ARTIST_PRO:
      return 'Artist Pro';
    case SubscriptionPlan.ENTERPRISE:
      return 'Enterprise';
    default:
      return 'Unknown Plan';
  }
};
