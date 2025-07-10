import { getCategories } from '@/api/category';
import { CategoryTypeValues } from '@/constants';
import { Category } from '@/types/category';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface UseCategoriesOptions {
  page?: number;
  pageSize?: number;
  type?: CategoryTypeValues;
  searchQuery?: string;
}

export function useCategories(
  options: UseCategoriesOptions = {},
): UseQueryResult<Category[]> {
  const { page = 1, pageSize = 25, type, searchQuery } = options;
  return useQuery<Category[]>({
    queryKey: ['categories', { page, pageSize, type, searchQuery }],

    queryFn: () => getCategories({ page, pageSize, type, searchQuery }),

    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
