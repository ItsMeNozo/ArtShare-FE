import { Collection } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCollectionsWithPosts,
  fetchPublicCollectionsByUsername,
} from '../api/collection.api';

const STALE_TIME = 1000 * 60 * 5;

export function useCollectionsData(
  username?: string,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;

  const queryKey = username
    ? ['collections', 'public', username]
    : ['collections', 'me'];

  const queryFn = () =>
    username
      ? fetchPublicCollectionsByUsername(username)
      : fetchCollectionsWithPosts();

  const { data, error, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    staleTime: STALE_TIME,

    enabled: enabled && (username ? !!username.trim() : true),
  });

  const collections: Collection[] = data ?? [];

  return {
    collections,
    isLoading,
    isError,
    error,
  };
}
