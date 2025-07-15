import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAutoPostDetails } from '../api/auto-posts.api';
import { autoPostKeys } from '../utils/autoPostKeys';

export const useGetAutoPostDetails = (
  autoPostId: number | undefined,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: autoPostKeys.details(autoPostId!),
    queryFn: async () => getAutoPostDetails(autoPostId!),
    enabled: typeof autoPostId === 'number' && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
};
