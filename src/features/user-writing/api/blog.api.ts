import api from '@/api/baseApi';
import { Blog } from '@/types/blog';

// ✅ FIXED: Proper RequestOptions interface for browser environment
interface RequestOptions {
  signal?: AbortSignal;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  isPublished?: boolean;
  // Add other fields your backend expects for creation, e.g., category_ids, tags
}

/**
 * Creates a new blog post.
 * @param blogData The data for the new blog.
 * @returns The created blog post (ensure this also maps to frontend Blog type if backend returns a different DTO).
 */
export const createNewBlog = async (
  blogData: CreateBlogPayload,
): Promise<Blog> => {
  try {
    const response = await api.post<Blog>('/blogs', blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  isPublished?: boolean;
  slug?: string;
  coverImageUrl?: string;
  pictures?: string[];
  // Add other updatable fields
}

/**
 * Updates an existing blog post with proper abort signal support.
 * @param blogId The ID of the blog to update.
 * @param blogData The data to update the blog with.
 * @param options Options including abort signal for request cancellation.
 * @returns The updated blog post.
 */
export const updateExistingBlog = async (
  blogId: string | number,
  blogData: UpdateBlogPayload,
  options?: RequestOptions,
): Promise<Blog> => {
  try {
    const response = await api.patch<Blog>(`/blogs/${blogId}`, blogData, {
      signal: options?.signal, // This passes the AbortSignal to axios
    });

    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const errorName = (error as { name?: string }).name;

      // Don't log errors for intentionally aborted requests
      if (errorName === 'CanceledError' || errorName === 'AbortError') {
        // Request was intentionally aborted - this is expected behavior
        throw error;
      }
    }

    // Log other errors normally
    console.error('Error updating blog with ID', blogId, ':', error);
    throw error;
  }
};

export const deleteBlog = async (blogId: string | number): Promise<void> => {
  try {
    await api.delete(`/blogs/${blogId}`);
  } catch (error) {
    console.error(`Error deleting blog with ID ${blogId}:`, error);
    throw error;
  }
};
