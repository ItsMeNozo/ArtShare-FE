import api from "@/api/baseApi";
import { Blog } from "@/types/blog";
/**
 * Fetch details for a single blog by ID.
 * GET /blogs/:id
 */
export const fetchBlogDetails = async (blogId: number): Promise<Blog> => {
  const response = await api.get<Blog>(`/blogs/${blogId}`);
  return response.data;
};
/**
 * Fetch a paginated list of published blogs.
 * GET /blogs
 */
export const fetchBlogs = async (params?: {
  take?: number;
  skip?: number;
  search?: string;
}): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs", { params });
  return response.data;
};

/**
 * Fetch trending blogs, optionally filtered by categories.
 * GET /blogs/trending
 */
export const fetchTrendingBlogs = async (params?: {
  take?: number;
  skip?: number;
  categories?: string[];
}): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs/trending", { params });
  return response.data;
};

/**
 * Fetch blogs from followed users.
 * GET /blogs/following
 */
export const fetchFollowingBlogs = async (params?: {
  take?: number;
  skip?: number;
  categories?: string[];
}): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs/following", { params });
  return response.data;
};

/**
 * Search blogs by query.
 * GET /blogs/search
 */
export const searchBlogs = async (params: {
  take?: number;
  skip?: number;
  search?: string;
}): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs/search", { params });
  return response.data;
};

/**
 * Fetch blogs created by the current user.
 * GET /blogs/me
 */
export const fetchMyBlogs = async (): Promise<Blog[]> => {
  const response = await api.get<Blog[]>("/blogs/me");
  return response.data;
};

/**
 * Create a new blog post.
 * POST /blogs
 */
export const createBlog = async (data: Partial<Blog>): Promise<Blog> => {
  const response = await api.post<Blog>("/blogs", data);
  return response.data;
};

/**
 * Update an existing blog post.
 * PATCH /blogs/:id
 */
export const updateBlog = async (
  blogId: number,
  data: Partial<Blog>,
): Promise<Blog> => {
  const response = await api.patch<Blog>(`/blogs/${blogId}`, data);
  return response.data;
};

/**
 * Delete a blog post.
 * DELETE /blogs/:id
 */
export const deleteBlog = async (
  blogId: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/blogs/${blogId}`);
  return response.data;
};

/**
 * Toggle bookmark status for a blog.
 * POST /blogs/:id/bookmark
 */
export const toggleBookmark = async (blogId: number): Promise<any> => {
  const response = await api.post(`/blogs/${blogId}/bookmark`);
  return response.data;
};

/**
 * Protect a blog.
 * POST /blogs/:id/protect
 */
export const protectBlog = async (blogId: number): Promise<any> => {
  const response = await api.post(`/blogs/${blogId}/protect`);
  return response.data;
};

/**
 * Rate a blog.
 * POST /blogs/:id/rate
 */
export const rateBlog = async (
  blogId: number,
  rating: number,
): Promise<any> => {
  const response = await api.post(`/blogs/${blogId}/rate`, { rating });
  return response.data;
};

/**
 * Fetch blogs by username.
 * GET /blogs/user/:username
 */
export const fetchBlogsByUsername = async (
  username: string,
  params?: { take?: number; skip?: number },
): Promise<Blog[]> => {
  const response = await api.get<Blog[]>(`/blogs/user/${username}`, { params });
  return response.data;
};

/**
 * Fetch relevant blogs for a given blog.
 * GET /blogs/:blogId/relevant
 */
export const fetchRelevantBlogs = async (
  blogId: number,
  params?: { take?: number; skip?: number },
): Promise<Blog[]> => {
  const response = await api.get<Blog[]>(`/blogs/${blogId}/relevant`, {
    params,
  });
  return response.data;
};

/**
 * Fetch users who liked a blog.
 * GET /blogs/:id/likes
 */
export const fetchBlogLikes = async (
  blogId: number,
  params?: { skip?: number; take?: number },
): Promise<{ items: any[]; total: number }> => {
  const response = await api.get<{ items: any[]; total: number }>(
    `/blogs/${blogId}/likes`,
    { params },
  );
  return response.data;
};
