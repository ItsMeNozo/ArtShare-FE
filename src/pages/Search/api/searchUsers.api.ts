import api from '@/api/baseApi';
import { PaginatedResponse } from '@/api/types/paginated-response.type';
import qs from 'qs';
import { PublicUserSearchDto } from '../types';

interface FetchUsersParams {
  search: string;
  page?: number;
  limit?: number;
}

export const searchUsers = async (
  params: FetchUsersParams,
): Promise<PaginatedResponse<PublicUserSearchDto>> => {
  const queryString = qs.stringify(params, {
    addQueryPrefix: true,
    skipNulls: true,
  });
  const response = await api.get<PaginatedResponse<PublicUserSearchDto>>(
    `/users/search${queryString}`,
  );
  return response.data;
};
