import { useUser } from '@/contexts/user';
import { useQuery } from '@tanstack/react-query';
import { fetchLinkedPlatforms } from '../api/fetch-linked-platforms';

interface UseFetchLinkedPlatformsOptions {
  platformName: string | null;
}

export const useFetchLinkedPlatforms = ({
  platformName,
}: UseFetchLinkedPlatformsOptions) => {
  const { user } = useUser();
  return useQuery({
    queryKey: ['linkedPlatforms', user, platformName],
    queryFn: () =>
      fetchLinkedPlatforms({
        platformName: platformName ?? undefined,
      }),
    staleTime: 1000 * 60 * 1, // 1 minute
    enabled: !!platformName,
  });
};
