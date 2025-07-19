import { Collection } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCollectionsWithPosts,
  fetchPublicCollectionsByUsername,
} from '../api/collection.api';

const STALE_TIME = 1000 * 60 * 5;

/**
 * A custom hook to fetch collections data.
 * - If a `username` is provided, it fetches that user's PUBLIC collections.
 * - If no `username` is provided, it fetches the currently authenticated user's
 *   own collections (both public and private).
 *
 * @param username (Optional) The username of the user whose public collections to fetch.
 * @param options (Optional) Configuration options for the query, e.g., `{ enabled: false }`.
 * @returns The result of the useQuery hook for the collections data.
 */
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
