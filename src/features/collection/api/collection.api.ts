import api from '@/api/baseApi';
import { Collection } from '@/types';
import { CreateCollectionFormData } from '../components/CreateCollectionDialog';
import { UpdateCollectionData } from '../types/collection';

/**
 * Fetches all collections for the current user.
 * Corresponds to: GET /collections
 */
export const fetchCollectionsWithPosts = async (): Promise<Collection[]> => {
  try {
    const response = await api.get<Collection[]>('/collections');
    return response.data;
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
  try {
    const response = await api.patch<Collection>(
      `/collections/${collectionId}`,
      updateData,
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
 * Deletes a collection by its ID.
 * Corresponds to: DELETE /collections/:id
 */
export const deleteCollection = async (collectionId: number): Promise<void> => {
  try {
    await api.delete(`/collections/${collectionId}`);
  } catch (error) {
    console.error(`API Error deleting collection ${collectionId}:`, error);
    throw error;
  }
};

/**
 * Creates a new collection.
 * Corresponds to: POST /collections
 */
export const createCollection = async (
  collectionData: CreateCollectionFormData,
): Promise<Collection> => {
  try {
    const response = await api.post<Collection>('/collections', collectionData);
    return response.data;
  } catch (error) {
    console.error('API Error creating collection:', error);
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
