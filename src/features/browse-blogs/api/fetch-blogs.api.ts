import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { Blog } from '@/types/blog';
import qs from 'qs';
import { BlogTab } from '../types';

interface FetchBlogsParams {
  page?: number;
  limit?: number;
  categories?: string[]; // category ids
}

export const fetchBlogs = async (
  tab: BlogTab,
  params: FetchBlogsParams = {},
): Promise<PaginatedResponse<Blog>> => {
  const queryString = qs.stringify(params, {
    addQueryPrefix: true,
    skipNulls: true,
  });
  const response = await api.get<PaginatedResponse<Blog>>(
    `/blogs/${tab}${queryString}`,
  );
  return response.data;
};
