import api from '@/api/baseApi';
import { Post } from '@/types';

/**
 * GET /posts/user/:username
 *
 * @param username - The username of the user whose posts are to be fetched
 * @param page - The page number for pagination (default is 1)
 * @param pageSize - The number of posts per page (default is 25)
 * @returns A promise that resolves to an array of Post objects
 */
export const fetchUserPosts = async (
  username: string,
  page: number = 1,
  pageSize: number = 25,
): Promise<Post[]> => {
  try {
    const response = await api.get<Post[]>(
      `/posts/user/${username}?page=${page}&page_size=${pageSize}`,
    );
    return response.data;
  } catch (error) {
    console.error('fetchPostsByUsername error:', error);
    throw error;
  }
};
