import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getUserProfileByUsername, UserProfile } from '../api/user-profile.api';

/**
 * A custom hook to fetch a user's profile by their username.
 * It encapsulates all the TanStack Query logic, including caching,
 * retries, and error handling for reuse in multiple components.
 *
 * @param username The username of the profile to fetch.
 * @returns The result of the useQuery hook for the user profile.
 */
export const useUserProfile = (username: string | undefined) => {
  const queryFn = () => {
    return getUserProfileByUsername(username!);
  };

  return useQuery<UserProfile, Error>({
    queryKey: ['userProfile', username],
    queryFn,

    enabled: !!username && username.trim() !== '',

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }

      return failureCount < 2;
    },
  });
};
