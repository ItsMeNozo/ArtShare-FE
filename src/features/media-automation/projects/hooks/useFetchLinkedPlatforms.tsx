import { useUser } from '@/contexts/UserProvider';
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
      fetchLinkedPlatforms({ platformName: platformName ?? undefined }),
    staleTime: 1000 * 60 * 3, // 5 minutes
    enabled: !!platformName,
  });
};
