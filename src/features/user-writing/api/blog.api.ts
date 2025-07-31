import api from '@/api/baseApi';
import { Blog } from '@/types/blog';

interface RequestOptions {
  signal?: AbortSignal;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  isPublished?: boolean;
}

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
}

export const updateExistingBlog = async (
  blogId: string | number,
  blogData: UpdateBlogPayload,
  options?: RequestOptions,
): Promise<Blog> => {
  try {
    const response = await api.patch<Blog>(`/blogs/${blogId}`, blogData, {
      signal: options?.signal,
    });

    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const errorName = (error as { name?: string }).name;

      if (errorName === 'CanceledError' || errorName === 'AbortError') {
        throw error;
      }
    }

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
