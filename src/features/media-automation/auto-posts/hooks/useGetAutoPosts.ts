import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Order } from '../../projects/types/automation-project';
import { getAutoPosts } from '../api/auto-posts.api';
import { AutoPostStatus } from '../types';
import { autoPostKeys } from '../utils/autoPostKeys';

export interface UseGetAutoPostsOptions {
  projectId: number | undefined;
  status?: AutoPostStatus;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: Order;
}

export const useGetAutoPosts = (params: UseGetAutoPostsOptions) => {
  const { projectId, status, page = 1, limit = 10, orderBy, order } = params;
  return useQuery({
    queryKey: autoPostKeys.list({
      projectId,
      status,
      page,
      limit,
      orderBy,
      order,
    }),

    queryFn: () =>
      getAutoPosts({
        autoProjectId: projectId!,
        status,
        page,
        limit,
        sortBy: orderBy,
        sortOrder: order,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    enabled: typeof projectId === 'number',
  });
};
