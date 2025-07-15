// This file could be src/services/blogServiceUtils.ts or similar,
// or its contents (mapper, DTO, unique functions) could be moved elsewhere.
// For now, this is the cleaned version of the file you provided.

import api from '@/api/baseApi';
import { Blog } from '@/types/blog'; // Assuming BlogUser and BlogCategory are part of your main Blog type or defined in @/types/blog

// --- Functions that were NOT duplicates and might still be needed ---

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
  // Assuming backend returns something mappable to Blog or directly Blog
  try {
    // If backend returns a specific DTO for creation, type it here, e.g., api.post<BackendBlogDetailsDto>
    // and then map it. For simplicity, assuming it returns a Blog-compatible structure.
    const response = await api.post<Blog>('/blogs', blogData); // Or BackendBlogDetailsDto then map
    // If mapping is needed: return mapBackendDetailsToFrontendBlog(response.data);
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
 * Updates an existing blog post.
 * @param blogId The ID of the blog to update.
 * @param blogData The data to update the blog with.
 * @returns The updated blog post (ensure mapping if necessary).
 */
export const updateExistingBlog = async (
  blogId: string | number,
  blogData: UpdateBlogPayload,
): Promise<Blog> => {
  // Assuming backend returns something mappable to Blog or directly Blog
  try {
    // Similar to createNewBlog, if backend returns a specific DTO, map it.
    const response = await api.patch<Blog>(`/blogs/${blogId}`, blogData); // Or BackendBlogDetailsDto then map
    // If mapping is needed: return mapBackendDetailsToFrontendBlog(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog with ID ${blogId}:`, error);
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
