import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Platform } from '../../projects/types/platform';
import { disconnectPlatform, fetchPlatforms } from '../api/platforms.api';

export const useFetchPlatforms = (platformName: string) => {
  return useQuery<Platform[], AxiosError>({
    queryKey: ['platforms', platformName],
    queryFn: () => fetchPlatforms(platformName),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDisconnectPlatform = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectPlatform,

    onMutate: async (platformIdToDelete) => {
      await queryClient.cancelQueries({ queryKey: ['platforms'] });
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'linkedPlatforms',
      });

      const previousPlatforms = queryClient.getQueryData<Platform[]>([
        'platforms',
      ]);

      if (previousPlatforms) {
        queryClient.setQueryData<Platform[]>(['platforms'], (old) =>
          old ? old.filter((p) => p.id !== platformIdToDelete) : [],
        );
      }

      return { previousPlatforms };
    },

    onError: (err, _variables, context) => {
      console.error('Optimistic update failed, rolling back:', err);
      if (context?.previousPlatforms) {
        queryClient.setQueryData<Platform[]>(
          ['platforms'],
          context.previousPlatforms,
        );
      }
      alert('Failed to disconnect account. The connection has been restored.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'linkedPlatforms',
      });
    },
  });
};
