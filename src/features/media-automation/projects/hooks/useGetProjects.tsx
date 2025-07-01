import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects.api';
import { Order, SortableKeys } from '../types/automation-project';

interface UseGetProjectInput {
  page: number;
  rowsPerPage: number;
  orderBy: SortableKeys;
  order: Order;
}

export const useGetProjects = (input: UseGetProjectInput) => {
  const { page, rowsPerPage, orderBy, order } = input;

  return useQuery({
    queryKey: ['projects', 'list', input],
    queryFn: () =>
      getProjects({
        page,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
