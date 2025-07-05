import api from '@/api/baseApi';
import { Collection } from '@/types';
import { CreateCollectionFormData } from '../components/CreateCollectionDialog';
import { UpdateCollectionData } from '../types/collection';

interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  is_private?: boolean;
  thumbnail_url?: string;
}

interface CreateCollectionPayload {
  name: string;
  is_private: boolean;
}

/**
 * Fetches all collections for the current user.
 * Corresponds to: GET /collections
 */
export const fetchCollectionsWithPosts = async (): Promise<Collection[]> => {
  try {
    const response = await api.get<Collection[]>('/collections');

    const collectionsWithSortedPosts = response.data.map((collection) => ({
      ...collection,

      posts: collection.posts
        ? [...collection.posts].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
        : [],
    }));

    return collectionsWithSortedPosts.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } catch (error) {
    console.error('API Error fetching collections:', error);
    throw error;
  }
};

/**
 * Updates specific fields of a collection.
 * Corresponds to: PATCH /collections/:id
 * Allows updating fields defined in UpdateCollectionData based on UpdateCollectionDto.
 */
export const updateCollection = async (
  collectionId: number,
  updateData: UpdateCollectionData,
): Promise<Collection> => {
  const payload: UpdateCollectionPayload = {};
  if (updateData.name !== undefined) {
    payload.name = updateData.name.trim();
  }
  if (updateData.description !== undefined) {
    payload.description = updateData.description;
  }
  if (updateData.isPrivate !== undefined) {
    payload.is_private = updateData.isPrivate;
  }
  if (updateData.thumbnailUrl !== undefined) {
    payload.thumbnail_url = updateData.thumbnailUrl;
  }

  if (Object.keys(payload).length === 0) {
    console.warn('API: No fields provided for update. Skipping API call.');
    throw new Error('No update data provided for the collection.');
  }

  try {
    const response = await api.patch<Collection>(
      `/collections/${collectionId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(`API Error updating collection ${collectionId}:`, error);
    throw error;
  }
};

/**
 * Removes a specific post from a specific collection.
 * Corresponds to: DELETE /collections/:collectionId/posts/:postId
 */
export const removePostFromCollection = async (
  collectionId: number,
  postId: number,
): Promise<void> => {
  try {
    await api.delete(`/collections/${collectionId}/posts/${postId}`);
  } catch (error) {
    console.error(
      `API Error removing post ${postId} from collection ${collectionId}:`,
      error,
    );
    throw error;
  }
};

/**
 * Creates a new collection.
 * Corresponds to: POST /collections
 */
export const createCollection = async (
  data: CreateCollectionFormData,
): Promise<Collection> => {
  try {
    const payload: CreateCollectionPayload = {
      name: data.name.trim(),
      is_private: data.isPrivate,
    };
    const response = await api.post<Collection>('/collections', payload);
    return response.data;
  } catch (error) {
    console.error(`API Error creating collection '${data.name}':`, error);
    throw error;
  }
};

/**
 * Adds a specific post to a specific collection.
 * Corresponds to: POST /collections/:collectionId/posts/:postId
 */
export const addPostToCollection = async (
  collectionId: number,
  postId: number,
): Promise<void> => {
  try {
    await api.post(`/collections/${collectionId}/posts/${postId}`);
  } catch (error) {
    console.error(
      `API Error adding post ${postId} to collection ${collectionId}:`,
      error,
    );
    throw error;
  }
};

/**
 * Fetches details for a single collection.
 * Corresponds to: GET /collections/:id
 */
export const fetchCollectionDetails = async (
  collectionId: number,
): Promise<Collection> => {
  try {
    const response = await api.get<Collection>(`/collections/${collectionId}`);

    const collection = response.data;
    if (collection.posts) {
      collection.posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return collection;
  } catch (error) {
    console.error(
      `API Error fetching details for collection ${collectionId}:`,
      error,
    );
    throw error;
  }
};

/**
 * Deletes a collection by its ID.
 */
export const deleteCollection = async (collectionId: number): Promise<void> => {
  try {
    await api.delete(`/collections/${collectionId}`);
  } catch (error) {
    console.error(`Failed to delete collection ${collectionId}:`, error);
    throw error;
  }
};
