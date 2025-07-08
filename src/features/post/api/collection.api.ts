import api from '@/api/baseApi';
import { Collection } from '@/types';
import { DialogCollection } from '../components/SavePostDialog';

export const fetchCollectionsForDialog = async (): Promise<
  DialogCollection[]
> => {
  try {
    // Adjust the endpoint as needed
    const response = await api.get<Collection[]>('/collections'); // Ensure backend includes posts

    // Map the raw API response to the DialogCollection structure
    const dialogCollections: DialogCollection[] = response.data.map(
      (collection) => ({
        id: collection.id,
        name: collection.name,
        // Extract just the post IDs from the nested post objects
        postIds: collection.posts?.map((post) => post.id) || [],
      }),
    );

    return dialogCollections;
  } catch (error) {
    console.error('Failed to fetch collections for dialog:', error);
    throw error || new Error('Could not load collections.');
  }
};
