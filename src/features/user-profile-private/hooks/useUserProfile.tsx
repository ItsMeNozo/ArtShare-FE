import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import { useUser } from '@/contexts/user';
import { getUserProfile } from '../api/get-user-profile';

export const userProfileQueryKey = ['userProfile'];

export const useUserProfile = () => {
  const { isAuthenticated } = useUser();

  return useQuery<User, Error>({
    queryKey: userProfileQueryKey,
    queryFn: getUserProfile,
    enabled: isAuthenticated,

    staleTime: 1000 * 60 * 60, // 1 hour: Data is fresh for an hour
    gcTime: 1000 * 60 * 60,    // 1 hour: Cache is cleared after an hour of inactivity
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
