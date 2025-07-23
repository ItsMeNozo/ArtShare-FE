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
import { Collection, UpdateCollectionData } from '../types/collection';

const COLLECTIONS_QUERY_KEY = ['collections'];

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
        PaginatedResponse<Collection>[]
      >(COLLECTIONS_QUERY_KEY);

      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEY,
        (oldData: InfiniteData<PaginatedResponse<Collection>>) => {
          if (!oldData) return oldData;

          const newData = { ...oldData };
          newData.pages = newData.pages.map((page) => ({
            ...page,
            data: page.data.map((collection: Collection) => {
              if (collection.id === collectionId) {
                return {
                  ...collection,
                  posts: (collection.posts || []).filter(
                    (p) => p.id !== postId,
                  ),
                };
              }
              return collection;
            }),
          }));
          return newData;
        },
      );

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
