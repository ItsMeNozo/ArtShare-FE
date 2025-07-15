import { getCategories } from '@/api/category';
import { CategoryTypeValues } from '@/constants';
import { Category } from '@/types/category';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface UseCategoriesOptions {
  type?: CategoryTypeValues;
}

export function useCategories(
  options: UseCategoriesOptions = {},
): UseQueryResult<Category[]> {
  const { type } = options;
  return useQuery<Category[]>({
    queryKey: ['categories', { type }],

    queryFn: () => getCategories({ type }),

    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
