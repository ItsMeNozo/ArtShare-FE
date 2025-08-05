import { PaginatedResponse } from '@/api/types/paginated-response.type';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createCollection,
  deleteCollection,
  removePostFromCollection,
  updateCollection,
} from '../api/collection.api';
import { CreateCollectionFormData } from '../components/CreateCollectionDialog';
import { Collection, Post, UpdateCollectionData } from '../types/collection';

const COLLECTIONS_QUERY_KEY = ['collections', 'me'];

/**
 * A hook for creating a new collection.
 * Handles server-side creation and invalidates the collections list on success.
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionFormData) => createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

/**
 * A hook for updating an existing collection (name, privacy).
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number; data: UpdateCollectionData }) =>
      updateCollection(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

/**
 * A hook for deleting a collection.
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

/**
 * A hook for removing a post from a collection.
 * Implements an optimistic update for a snappy UI.
 */
export function useRemovePostFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { collectionId: number; postId: number }) =>
      removePostFromCollection(variables.collectionId, variables.postId),

    onMutate: async ({ collectionId, postId }) => {
      await queryClient.cancelQueries({ queryKey: COLLECTIONS_QUERY_KEY });

      const previousData = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<Collection>>
      >(COLLECTIONS_QUERY_KEY);

      queryClient.setQueryData<
        InfiniteData<PaginatedResponse<Collection>> | undefined
      >(COLLECTIONS_QUERY_KEY, (oldData) => {
        if (!oldData || !oldData.pages) {
          return undefined;
        }

        const newData = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((collection) => {
              if (collection.id === collectionId) {
                const updatedPosts = (collection.posts || []).filter(
                  (p: Post) => p.id !== postId,
                );

                return {
                  ...collection,
                  posts: updatedPosts,
                };
              }
              return collection;
            }),
          })),
        };

        return newData;
      });

      return { previousData };
    },

    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(COLLECTIONS_QUERY_KEY, context.previousData);
      }
      console.error('Failed to remove post:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}
