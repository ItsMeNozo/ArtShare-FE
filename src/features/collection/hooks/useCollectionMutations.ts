import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { useLoading } from '@/contexts/Loading/useLoading';
import { useSnackbar } from '@/hooks/useSnackbar';
import { extractApiErrorMessage } from '@/utils/error.util';
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

interface MutationHookOptions {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

/**
 * A hook for creating a new collection.
 * Handles server-side creation and provides UI feedback.
 */
export function useCreateCollection({
  onSuccess,
  onError,
}: MutationHookOptions = {}) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (data: CreateCollectionFormData) => createCollection(data),
    onMutate: () => {
      showLoading('Creating collection...');
    },
    onSuccess: () => {
      showSnackbar('Collection created successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      onSuccess?.();
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'Failed to create collection.',
      );
      showSnackbar(message, 'error');
      onError?.(message);
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

/**
 * A hook for updating an existing collection (name, privacy) with optimistic updates.
 */
export function useUpdateCollection({
  onSuccess,
  onError,
}: MutationHookOptions = {}) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (variables: { id: number; data: UpdateCollectionData }) =>
      updateCollection(variables.id, variables.data),
    onMutate: async ({ id, data }) => {
      showLoading('Updating collection...');
      await queryClient.cancelQueries({ queryKey: COLLECTIONS_QUERY_KEY });

      const previousData = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<Collection>>
      >(COLLECTIONS_QUERY_KEY);

      queryClient.setQueryData<
        InfiniteData<PaginatedResponse<Collection>> | undefined
      >(COLLECTIONS_QUERY_KEY, (oldData) => {
        if (!oldData) return undefined;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((collection) =>
              collection.id === id ? { ...collection, ...data } : collection,
            ),
          })),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      showSnackbar('Collection updated successfully.', 'success');
      onSuccess?.();
    },
    onError: (error, _variables, context) => {
      const message = extractApiErrorMessage(
        error,
        'Failed to update collection.',
      );
      showSnackbar(message, 'error');
      onError?.(message);
      if (context?.previousData) {
        queryClient.setQueryData(COLLECTIONS_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      hideLoading();
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

/**
 * A hook for deleting a collection with optimistic updates.
 */
export function useDeleteCollection({
  onSuccess,
  onError,
}: MutationHookOptions = {}) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onMutate: async (id) => {
      showLoading('Deleting collection...');
      await queryClient.cancelQueries({ queryKey: COLLECTIONS_QUERY_KEY });

      const previousData = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<Collection>>
      >(COLLECTIONS_QUERY_KEY);

      queryClient.setQueryData<
        InfiniteData<PaginatedResponse<Collection>> | undefined
      >(COLLECTIONS_QUERY_KEY, (oldData) => {
        if (!oldData) return undefined;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter((collection) => collection.id !== id),
          })),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      showSnackbar('Collection deleted successfully.', 'success');
      onSuccess?.();
    },
    onError: (error, _variables, context) => {
      const message = extractApiErrorMessage(
        error,
        'Failed to delete collection.',
      );
      showSnackbar(message, 'error');
      onError?.(message);
      if (context?.previousData) {
        queryClient.setQueryData(COLLECTIONS_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      hideLoading();
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

/**
 * A hook for removing a post from a collection with optimistic updates and UI feedback.
 */
export function useRemovePostFromCollection({
  onSuccess,
  onError,
}: MutationHookOptions = {}) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const { showLoading, hideLoading } = useLoading();

  return useMutation({
    mutationFn: (variables: { collectionId: number; postId: number }) =>
      removePostFromCollection(variables.collectionId, variables.postId),

    onMutate: async ({ collectionId, postId }) => {
      showLoading('Removing post...');
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

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((collection) => {
              if (collection.id === collectionId) {
                return {
                  ...collection,
                  posts: (collection.posts || []).filter(
                    (p: Post) => p.id !== postId,
                  ),
                };
              }
              return collection;
            }),
          })),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      showSnackbar('Post removed from collection.', 'success');
      onSuccess?.();
    },
    onError: (error, _variables, context) => {
      const message = extractApiErrorMessage(error, 'Failed to remove post.');
      showSnackbar(message, 'error');
      onError?.(message);

      if (context?.previousData) {
        queryClient.setQueryData(COLLECTIONS_QUERY_KEY, context.previousData);
      }
    },
    onSettled: () => {
      hideLoading();
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}
