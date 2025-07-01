import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import { Blog } from '@/types/blog';
import { getQueryParams } from '@/utils';

interface SearchBlogsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const searchBlogs = async (
  params: SearchBlogsParams,
): Promise<PaginatedResponse<Blog>> => {
  const queryString = getQueryParams(params);
  const response = await api.get<Promise<PaginatedResponse<Blog>>>(
    `/blogs${queryString}`,
  );
  return response.data;
};
