import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { Post } from '@/types';
import { getQueryParams } from '@/utils';

interface GetPostsParams {
  filter?: string[];
  page?: number;
  limit?: number;
  isAi?: boolean;
  isMature?: boolean;
}

export const getPosts = async (
  tab: 'trending' | 'following',
  params: GetPostsParams,
): Promise<PaginatedResponse<Post>> => {
  const response = await api.get(`/posts/${tab}${getQueryParams(params)}`);
  return response.data;
};

interface SearchPostsParams extends GetPostsParams {
  q: string;
}

export const searchPosts = async (
  params: SearchPostsParams,
): Promise<PaginatedResponse<Post>> => {
  const response = await api.get(`/posts/search${getQueryParams(params)}`);
  return response.data;
};

export const fetchPostsByArtist = async (
  artistUsername: string,
  page: number,
  pageSize: number = 9,
): Promise<Post[]> => {
  try {
    const response = await api.get<Post[]>(
      `/posts/user/${artistUsername}?page=${page}&page_size=${pageSize}`,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch artist posts:', error);
    return [];
  }
};
