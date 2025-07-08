import { Collection } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionsWithPosts } from '../api/collection.api';

export const COLLECTIONS_QUERY_KEY = ['collections', 'list'];
const STALE_TIME = 1000 * 60 * 5;

export function useCollectionsData(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const { data, error, isLoading, isError } = useQuery({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: fetchCollectionsWithPosts,
    staleTime: STALE_TIME,
    enabled,
  });

  const collections: Collection[] = data ?? [];

  return {
    collections,
    isLoading,
    isError,
    error,
  };
}
